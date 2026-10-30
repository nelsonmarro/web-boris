# Security audit: server-side entry points (web-boris)

Scope: route handlers, server actions, header/cookie reads, Prisma sinks, data exposure.
Method: read-only static review, data flow traced from input to sink. No servers started, no network requests, no `.env*` values read (only variable names).

## Findings

### F1. Per-network vote cap (MAX_VOTES_PER_IP) can be bypassed with parallel requests (check-then-insert race)
- **Where:** `src/features/community/actions/cast-vote.ts:55-68`
- **Category:** vote integrity / business-logic race (TOCTOU)
- **Severity:** MEDIUM (only the fan poll is affected; no data or account exposure)
- **Confidence:** 8
- **Data flow:** `castVote` is a public server action. A request without the `wb_voter` cookie gets a fresh `randomUUID()` (line 42), so each request counts as a new voter. The handler then:
  1. runs `findUnique` for (pollId, voterKey),
  2. runs `count({ pollId, ipHash })` and compares the result with `MAX_VOTES_PER_IP` (5),
  3. runs `create`.

  These three statements are separate, with no transaction and no lock. The only unique constraint is `(pollId, voterKey)`, and `voterKey` is different on every cookieless request. `src/lib/prisma.ts` creates a `pg.Pool`, which defaults to 10 connections, so concurrent requests interleave in the database.
- **Exploit:** From one IP, send N (for example 200) concurrent POSTs to the `castVote` action ID. Use the same `pollId` and `option`, and send no cookie. Most requests run their `count` before any insert commits, so all of them see a count below 5 and insert. Repeating the burst adds still more votes. The result is far more than 5 votes from one network, so one person can decide the weekly duel or the `desclasificar` vote. The current `pollId` and option slugs are public: `GET /api/comunidad/encuesta` returns them. The action ID is in the client bundle.
- **Fix:** Make the check and the insert atomic for each (pollId, ipHash):
  - wrap them in `prisma.$transaction(async tx => { await tx.$executeRaw\`SELECT pg_advisory_xact_lock(hashtext(${poll.id + '|' + ipHash}))\`; count…; create… })` (parameterised tagged template, not `Unsafe`); or
  - add a slot column `ipSlot Int` with `@@unique([pollId, ipHash, ipSlot])`, insert with slot = count, and retry once on P2002 (the slot index then enforces the cap at the database level); or
  - run the transaction with `isolationLevel: 'Serializable'` and retry on serialization failure.

### F2. IPv6 /64 grouping still lets an attacker with a routed /48 cast ~65k×5 votes
- **Where:** `src/features/community/lib/voter.ts:131-144` (`networkOf`), used by `cast-vote.ts:53`
- **Category:** vote integrity (identity-cap bypass)
- **Severity:** LOW
- **Confidence:** 7
- **Exploit:** nginx passes the real `$remote_addr`, so the address cannot be spoofed. But `networkOf` buckets IPv6 by /64. A free Hurricane Electric tunnel (or many VPS plans) gives a routed /48, which is 65,536 distinct /64s. An attacker can bind addresses across those /64s and send 5 cookieless votes from each. This is bounded only by effort. It is weaker than F1, which needs only one IP.
- **Fix:** For the cap, bucket IPv6 by /48 (or apply a second, larger cap per /48, for example 20). Accept that the cap is a speed bump. If the poll must be trustworthy, require a signed-in identity (`PollVote.userId` already exists, with `@@unique([pollId, userId])`).

### F3. (Demo modes only) Client-supplied `X-Real-IP` is trusted when the app is reached without nginx
- **Where:** `src/features/community/lib/voter.ts:100-109` (`clientIp`); `Makefile:28-33` (`make start` on :3131, `make share` with a cloudflared quick tunnel to `next start`)
- **Category:** IP spoofing → vote-cap and contact-limit bypass
- **Severity:** LOW (production is not affected)
- **Confidence:** 7
- **Detail:** `clientIp` takes `x-real-ip` first, then the last `x-forwarded-for` hop, and does not check that a trusted proxy set them.
  - **Production is safe.** `deploy/nginx/web-boris.conf:22-23` overwrites both headers with `$remote_addr`, and `docker-compose.prod.yml:32` binds the app only to `127.0.0.1:3131`.
  - **Demo modes are exposed.** Under `make share`, cloudflared forwards the client's own `X-Real-IP` header to Next unchanged. Under `make start` the port is reached directly. Either way, every request can claim a new IP, which removes the 5-per-network cap and the contact-form rate limit.
  - **Real effect is small.** Voting only works if `VOTE_SECRET` and `DATABASE_URL` are set in that environment. The local `.env` has no `VOTE_SECRET` name, so in practice the demo modes mostly affect the contact-form throttle.
- **Fix:** Read the client IP from a header only when an env flag says a trusted proxy is present (for example `TRUSTED_PROXY=nginx`). Otherwise fall back to a non-spoofable value, or disable voting. For cloudflared, prefer `Cf-Connecting-IP`.

## Checked and found SAFE
- `GET /api/comunidad/encuesta` (`route.ts`): returns only the poll definition, counts/percentages and `myOption`. No `voterKey`, `ipHash` or IP. Errors are logged on the server only, with a generic `unavailable` state. `Cache-Control: no-store`.
- `GET /api/comunidad/historial` (`route.ts`): takes no input and makes one aggregate `groupBy(pollId, option)`. Only aggregate counts and slugs are returned. Errors are logged via `describeError`, and the client gets an empty history.
- `GET /wiki/aleatorio` (`route.ts`): no open redirect. `Location` is always `/wiki/<slug>`, where the slug comes from the server-side registry. The `Referer` is only parsed (`new URL().pathname` plus a regex) to exclude the current slug, and never reaches the output.
- `castVote` poll targeting: the client cannot pick the poll. `checkVote` requires `pollId === getActivePoll().id` (computed on the server for the current ISO week) and `option ∈ {poll.a, poll.b}`. Zod limits lengths. Past and future polls are rejected (`cerrada`).
- `castVote` cookie: `wb_voter` is `httpOnly`, `SameSite=Lax`, `Secure` in production, and `path=/`. The stored key is HMAC(VOTE_SECRET, uuid). A forged cookie value only picks another anonymous identity, which is no worse than clearing cookies.
- VOTE_SECRET: required to be ≥ 32 characters. It is used only as an HMAC key for `voterKey` and `ipHash` (IP+pollId, so hashes cannot be linked across polls). It is never returned to the client. If it is missing, voting is cleanly disabled.
- Double voting with the same cookie: blocked by `@@unique([pollId, voterKey])`. A P2002 error is swallowed as idempotent.
- Server-action CSRF: Next's built-in Origin vs Host/X-Forwarded-Host check applies. nginx sets `Host`/`X-Forwarded-Host` to `$host`. There is no `serverActions.allowedOrigins` widening in `next.config.ts`.
- `sendContactEmail` HTML injection: every user field goes through `escapeHtml` (`& < > " '`) before being placed in the HTML body.
- `sendContactEmail` header injection: CR/LF are removed from the subject. The value is also sent as JSON to the Resend API, not raw SMTP. `replyTo` is a Zod `.email()` value (Zod v4 regex: no whitespace, CRLF, commas or multiple addresses).
- `sendContactEmail` relay abuse: the recipient is fixed (`CONTACT_EMAIL`) and `from` is fixed (`CONTACT_FROM_EMAIL`). No user-controlled recipient, cc/bcc or from, so it cannot be used as a relay to arbitrary addresses.
- `sendContactEmail` error leakage: only generic Spanish messages and Zod field-error strings are returned. Resend errors and exceptions are logged on the server only.
- `getWikiArticles`: Zod schema with `.catch` defaults on every field. `page` ≤ 1000, `pageSize` comes from an allow-list, `tipo` from an allow-list, and the query is cut to `MAX_QUERY_LENGTH`. Filtering happens in memory over public MDX, with no file paths or DB involved.
- `getFilterOptions` / `getWikiIndex` (also exported server actions): no input, and they return only public catalogue data.
- Path traversal: `getContentRepository().getArticle(slug)` searches the in-memory list and does not build a file path from the slug. `[slug]` page and OG image use `dynamicParams = false`.
- Prisma: there is no `$queryRawUnsafe`, `$executeRawUnsafe` or raw SQL anywhere in `src`. All queries go through the typed client.
- JSON-LD `dangerouslySetInnerHTML` (`[slug]/page.tsx:82`): the source is repo frontmatter, and `serializeJsonLd` escapes `<`, `>` and `&`.
- Auth.js `/api/auth/[...nextauth]`: there are no providers configured, so no sign-in surface. `src/proxy.ts` matches only `/admin` and `/settings`, and no such routes exist.
- Error pages (`error.tsx`, `global-error.tsx`): they do not render `error.message` (Next also replaces server errors with a digest in production).
- Secrets in git: only `.env.example` is tracked. `.env` is untracked.
- Port exposure: the production app binds to `127.0.0.1:3131`, and Postgres publishes no ports in `docker-compose.prod.yml`.
