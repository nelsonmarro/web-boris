# Security audit — Authentication, authorization and session

Repo: web-boris @ main (752762e). Versions in node_modules: next 16.2.1, next-auth 5.0.0-beta.30, @auth/core 0.41.0, @auth/prisma-adapter 2.11.1.
Scope: `src/core/auth/*`, `src/app/api/auth/[...nextauth]/route.ts`, `src/proxy.ts`, `src/features/auth/**`, `src/features/payments/**`, `prisma/schema.prisma`, server actions, `next.config.ts`, deploy env generation (variable names only).

## Summary

**No exploitable authentication/authorization vulnerability exists today (0 findings at confidence ≥ 7 with real impact).**
Auth.js is wired up but configured with **zero providers**, and **no `/admin` or `/settings` route exists**, so nobody can sign in and the proxy protects nothing. Every mutating server action is public **on purpose**: the anonymous poll vote and the contact form.

There is one **latent HIGH** (L1 below). The proxy's `!!req.auth` check fails open, and an unauthenticated attacker can trigger that with a single cookie. It becomes a real auth bypass the moment someone adds an `/admin` or `/settings` page that relies only on the proxy. Fix it before adding any protected page.

## Findings (exploitable now)

None.

## Latent issue (not exploitable today, but a trap for the next feature)

### L1 — Proxy auth check fails open on any Auth.js config error, and an attacker can trigger it with a cookie

- **File:** `src/proxy.ts:7` (`const isLoggedIn = !!req.auth;`), together with `src/proxy.ts:13`.
- **Category:** Authentication bypass / fail-open. This is the npm-audit advisory for next-auth «Configuration errors can cause existence-based auth checks to fail open», and this app has the vulnerable pattern.
- **Severity:** none today, because there is no protected route. It becomes **HIGH** once an `/admin` or `/settings` page exists.
- **Confidence in the mechanism:** 9/10. I traced it in the installed source.

**Mechanism (verified in node_modules)**
1. The `auth(...)` wrapper calls `handleAuth` (`node_modules/next-auth/lib/index.js:127-131`), which runs `getSession()` and then `await sessionResponse.json()`. It assigns the result to `req.auth` **without checking the HTTP status**.
2. `getSession()` forwards the request's whole `cookie` header (`lib/index.js:11-13`) to `Auth()`.
3. `Auth()` runs `assertConfig` first (`node_modules/@auth/core/index.js:72-88`). On any config error, for the non-HTML `session` action, it returns `Response.json({ message: "There was a problem with the server configuration..." }, { status: 500 })`.
4. `assertConfig` (`node_modules/@auth/core/lib/utils/assert.js:66-70`) returns `InvalidCallbackUrl` when the **`authjs.callback-url` cookie** (`__Secure-authjs.callback-url` over https) does not parse as an http(s) URL (`isValidHttpUrl`, `assert.js:4-10`).
5. So `req.auth = { message: "..." }`, which is truthy. `isLoggedIn` becomes true and the proxy calls `NextResponse.next()`.

**Exploit scenario (once a protected page exists)**
```
GET /admin HTTP/1.1
Host: borisaoblois.82-25-95-39.sslip.io
Cookie: __Secure-authjs.callback-url=x
```
- The attacker controls their own cookies, so no victim is needed.
- The request passes the proxy unauthenticated and the page renders.
- Other ways to trigger it: deploying without `AUTH_SECRET` (`MissingSecret`), or without `AUTH_URL`/`AUTH_TRUST_HOST` in production (`UntrustedHost`). Either one makes **every** request fail open.
- Today `deploy/init-env.sh:18-20` sets `AUTH_URL`, `AUTH_TRUST_HOST` and a random `AUTH_SECRET`, so only the cookie path remains.

**Recommended fix (before adding any protected route)**
- In the proxy, check for a real user, not just a truthy object: `const isLoggedIn = !!req.auth?.user;`.
- Better, use the `authorized` callback in `authConfig`: `authorized: ({ auth }) => !!auth?.user`.
- Never rely on the proxy alone. Every protected page, layout, server action and route handler must call `const session = await auth(); if (!session?.user) …` (with the same `?.user` check) and enforce roles server-side.
- Upgrade next-auth when a fixed release is available.

## Other things checked

### Checked and safe

- **Providers:** `src/core/auth/auth.config.ts:2-4` has `providers: []`. There is no Credentials, Email/Resend/Nodemailer or OAuth provider, so nobody can sign in and no JWT can be issued without the secret.
- **npm audit, @auth/core «Email normalizer… homoglyph @ bypass»:** NOT affected. It only applies to email/magic-link providers, and none is configured.
- **npm audit, next-auth «config errors fail open»:** the pattern is present (L1), but there is nothing to bypass today.
- **`allowDangerousEmailAccountLinking`:** not set anywhere, and there are no OAuth providers.
- **`AUTH_SECRET`:** Auth.js requires it and returns `MissingSecret` without it. In production it is generated randomly on the VPS by `deploy/init-env.sh:20`. Variable names in `.env` / `.env.example` are `AUTH_SECRET` and `AUTH_URL`; values were not read.
- **trustHost / Host header:** production sets `AUTH_URL=https://<host>` and `AUTH_TRUST_HOST=true`.
  - `createActionURL` and `reqWithEnvURL` take the origin from `AUTH_URL`, not from `Host` or `X-Forwarded-Host`.
  - So Host-header poisoning cannot change auth URLs or redirects.
- **Open redirect via `callbackUrl`:**
  - The default `redirect` callback only allows relative or same-origin URLs, and no custom `redirect` callback is defined.
  - With no providers, the sign-in flow cannot complete anyway.
  - The proxy's own redirect (`src/proxy.ts:14`) is a fixed same-origin `/api/auth/signin`.
- **`/api/auth/[...nextauth]`:** exposes only the stock handlers (session, csrf, providers, signin, signout, error).
  - signout POST is CSRF-token protected.
  - `/session` returns null for anonymous users.
- **Session strategy:** JWT, an encrypted JWE keyed by `AUTH_SECRET`. The `session` callback (`auth.config.ts:9-15`) only copies `token.sub` into `user.id` and leaks no other data.
- **Auth cookies:** Auth.js defaults apply: `__Secure-` prefix over https, HttpOnly, SameSite=Lax. No cookie overrides.
- **Voter cookie** (`src/features/community/actions/cast-vote.ts:43-49`): HttpOnly, SameSite=Lax, Secure in production. It is an anonymous ID with no privilege attached.
- **Next.js middleware-bypass CVEs:** CVE-2025-29927 (`x-middleware-subrequest`) was fixed in 15.2.3, and the installed version is 16.2.1.
- **Matcher bypass:** the matcher `["/admin/:path*", "/settings/:path*"]` has nothing behind it to bypass.
- **Server actions CSRF:** `next.config.ts` has no `experimental.serverActions.allowedOrigins`, so Next's built-in Origin/Host check is unwidened.
- **Server actions without a session check** are public by design and do not touch user or account data:
  - `castVote` (`src/features/community/actions/cast-vote.ts`): anonymous voting.
  - `sendContact` (`src/core/actions/contact.action.ts`): Zod-validated and HTML-escaped.
  - `getWikiArticles` (`src/features/monsters/actions/get-wiki-articles.ts`): read-only, Zod-validated.
- **Route handlers** `/api/comunidad/encuesta` and `/api/comunidad/historial`: read-only and public by design.
- **Admin/dashboard:**
  - There are no admin pages, no role field on `User` in `prisma/schema.prisma`, and no RBAC code.
  - No code path reads or writes `User` / `Account` / `Session` outside the adapter.
  - `PollVote.userId` is never set.
- **`src/features/auth/` and `src/features/payments/`:** empty directories.

### Dead or unused auth code (informational, not a vulnerability)

- `src/proxy.ts`: runs Auth.js on `/admin` and `/settings`, but neither route exists, so it only ever produces a redirect or a 404. It is also the place where the L1 fail-open pattern lives.
- `src/core/auth/auth.ts`:
  - `signIn` and `signOut` are exported but unused.
  - `PrismaAdapter(prisma)` is configured but unreachable, because there are no providers and the strategy is JWT.
- `src/app/api/auth/[...nextauth]/route.ts`: a public Auth.js endpoint surface with no providers.
- `src/types/next-auth.d.ts`: a type augmentation only (its comment «The user's postal address» on `id` is stale).
- Prisma tables `Account`, `Session`, `User` and `VerificationToken` are present but unused. `src/features/auth/` and `src/features/payments/` are empty.
- If accounts are not planned soon, consider removing the auth wiring entirely, which also removes the L1 trap. Keep `User` only if `PollVote.userId` is going to be used.
