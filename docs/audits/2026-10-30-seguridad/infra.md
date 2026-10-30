# Infra / DevSecOps audit — web-boris (2026-10-30)

Scope: Dockerfile, .dockerignore, docker-compose(.prod).yml, deploy/*.sh, deploy/nginx/web-boris.conf,
.github/workflows (all branches), .env.example, .gitignore, package.json, git history (all refs + reflog, 316 commits).
Read-only. No secret values printed below; values are masked.

## Findings (confidence >= 7, real attack path)

### F1 — Dev Postgres published on all interfaces with a superuser and a hard-coded password
- File: `docker-compose.yml:5-9` (`POSTGRES_USER: root`, `POSTGRES_PASSWORD: root****`, `ports: "${DB_PORT:-5432}:5432"`); used by `make dev` / `make db-up` (`Makefile:22,40`).
- Category: Insecure default / exposed service. Severity: MEDIUM. Confidence: 8.
- Exploit: `"5432:5432"` binds 0.0.0.0, and Docker inserts its own iptables ACCEPT rules, so a host firewall (ufw/nftables) does not block it. While `make dev` runs on a laptop joined to any shared network (office/café Wi-Fi, LAN), anyone on that network can `psql -h <laptop-ip> -U root webboris` with the password that is public in the repo. `root` is a Postgres superuser → read/modify the local data and `COPY ... TO PROGRAM` = command execution as `postgres` inside the container. The same file exists in the VPS checkout (`/srv/web-boris`): a plain `docker compose up -d` or `make db-up` there (without `-f docker-compose.prod.yml`) would publish a superuser with a public password on the VPS's public IP, bypassing its firewall.
- Fix: bind to loopback: `ports: ["127.0.0.1:${DB_PORT:-5432}:5432"]`; optionally take the password from `.env` (`${POSTGRES_PASSWORD:-…}`). Keep the prod file as-is (it publishes nothing).

## Operational note (not a repo vulnerability, but action needed)

- **Old Resend key.** `docs/deploy/vps.md:27` states the previous Resend key "pasó por el chat" and must be replaced by a NEW one. The local, git-ignored `.env` (mode 644) still holds a value that looks like a real Resend key (`RESEND_API_KEY=re_****`, 36 chars). It was never committed (verified over all refs and reflog). If it is the key that went through the chat, revoke it in the Resend dashboard (a valid key lets anyone send mail as the verified sender domain) and use a fresh one locally too. Issue #5 tracks the prod key; `init-env.sh` correctly ships `re_pendiente`.

## Verified SAFE

**Secrets in the repo / history**
- `.gitignore:34-35` ignores `.env*` except `.env.example`; `git check-ignore` confirms `.env`, `.env.production`, `.env.local`.
- Only `.env.example` and `deploy/init-env.sh` were ever added with "env" in the name (all refs + reflog). No `.pem`, `.key`, `id_rsa`, `.sql` dumps (other than the Prisma migration) ever committed.
- History grep (`git log -p --all` and `--reflog`): every `re_…` string is a placeholder (`re_build_placeholder`, `re_dummy`, `re_pendiente`, `re_qa_invalida`, test fixture `re_AbC…`). `AUTH_SECRET=` / `VOTE_SECRET=` only appear as `$(openssl rand …)` or CI dummies. `postgresql://` URLs only with placeholder creds (`build`, `ci`, the dev `root:root…@localhost`, `${PG_PASSWORD}`). No hits for `BEGIN … PRIVATE KEY`, `ghp_`, `github_pat_`, `sk_live`, `sk_test`, `AKIA…`, `AIza…`, `xox?-`, OpenSSH keys. High-entropy scan of tracked text files: nothing secret. `docs/`: no credentials (only the public VPS IP, public emails, a `<id>` Drive URL template).
- `.antigravitycli/*.json`, `GEMINI.md`, `conductor/`, `exa-results/` are tracked but contain no secrets. `.claude/` and `.remember/` are not tracked.

**Dockerfile / image**
- Runner stage runs as `USER node` (`Dockerfile:35`), files `--chown=node:node`. Only `.next/standalone`, `.next/static`, `public`, `src/content` are copied into the final image.
- `.dockerignore` excludes `.env*` (except `.env.example`), `.git`, `docs`, `.remember`, `.superpowers`, etc. This is **load-bearing**: Next 16 standalone copies `.env` and `.env.production` from the project dir into `.next/standalone` (`node_modules/next/dist/build/index.js:265-282`), and on the VPS `.env.production` (real secrets) sits in the build context root. Because of `.dockerignore`, it never enters the context → not baked into `web-boris-app`. Keep that line.
- Build-time `DATABASE_URL`/`RESEND_API_KEY` are placeholders, set only in the `builder` stage (not inherited by `runner`). Only `NEXT_PUBLIC_SITE_URL` is inlined into the client bundle.
- File tracing (`.next/**/*.nft.json`) is narrow: only `public/assets`, `src/content`, OG fonts — no project-wide tracing that could sweep stray files into the image.
- `migrate` stage runs as root with full `node_modules` (incl. prisma CLI) but is a one-shot `--rm` container on the internal network, never exposed.

**Compose (prod)**
- `docker-compose.prod.yml:31-32` app bound to `127.0.0.1:3131` only; `db` publishes no ports; password is a 48-hex random value from `init-env.sh`.

**deploy scripts**
- All three use `set -euo pipefail`; no `set -x`; no secret is echoed (only the host is printed).
- `init-env.sh`: `umask 077` before writing (file 600), refuses to overwrite an existing file, secrets from `openssl rand` (CSPRNG): `AUTH_SECRET` 33 bytes base64, `VOTE_SECRET` 32 bytes hex, PG password 24 bytes hex. `PG_PASSWORD="$(openssl rand …)"` is a plain assignment, so a missing/failed openssl aborts under `set -e` before the heredoc is written. (The heredoc's inline `$(openssl rand …)` would not be caught by `set -e`, but line 14 already proves openssl works.)
- `setup-vps.sh`: `$HOST` comes from root's own CLI arg (no untrusted input in `sed`); never edits other vhosts; `nginx -t` before reload.
- `deploy.sh`: `git pull --ff-only` from GitHub `main` (trust anchor = whoever can push to main, expected).

**nginx vhost (`deploy/nginx/web-boris.conf`) — headers sent upstream**
- `Host: $host`, `X-Real-IP: $remote_addr`, `X-Forwarded-For: $remote_addr` (**overwritten, not appended** — no `$proxy_add_x_forwarded_for`), `X-Forwarded-Proto: $scheme`, `X-Forwarded-Host: $host`, HTTP/1.1, buffering off, 60 s read timeout. All other client headers pass through unchanged.
- `proxy_set_header` replaces any client-supplied `X-Real-IP`/`X-Forwarded-For`, and the app reads `x-real-ip` first, then the last XFF hop (`src/features/community/lib/voter.ts:21-26`). A remote client cannot spoof its IP for the per-network vote limit. The app is reachable only through nginx (loopback bind), so headers cannot be injected by bypassing the proxy.
- `client_max_body_size 1m`; `X-Robots-Tag noindex` (preview). TLS (ciphers/protocols) comes from certbot's `options-ssl-nginx.conf` and `--redirect` adds the HTTP→HTTPS redirect.
- `X-Forwarded-Host` is set from `$host`, which keeps Next's server-action Origin check consistent. Auth.js uses `AUTH_TRUST_HOST=true`, but `AUTH_URL` is fixed, the provider list is empty and the proxy only covers `/admin` and `/settings`, so a forged Host has no auth impact.

**CI (`.github/workflows/ci.yml`)**
- Triggers `push: main` + `pull_request` (not `pull_request_target`); top-level `permissions: contents: read`; no `secrets.*`; only dummy env values; no `${{ github.event.* }}` interpolated into `run:` steps (the only expression is `github.ref` in `concurrency`, which is not shell).
- Unmerged remote branch `origin/add-claude-github-actions-1792257453405` holds `claude.yml` (`issue_comment`, `issues`, … with `secrets.CLAUDE_CODE_OAUTH_TOKEN`, `id-token: write`) and `claude-code-review.yml`. These are inactive: `issue_comment`/`issues` workflows only run from the default branch, and the branch is not merged into `main`. Delete the branch, or review before merging (anyone can comment `@claude` on a public repo; the action checks the commenter's write access by default).

**package.json**
- Informational: `shadcn` (a CLI) is in `dependencies`; `prisma` is correctly a devDependency. The standalone runner image only contains traced files, so neither CLI ships in `web-boris-app`; they only exist in the `deps`/`migrate` images. Moving `shadcn` to `devDependencies` is still good hygiene. No impact on the attack surface of the running app.

**.env.example**
- No real or real-looking secrets; `AUTH_SECRET`, `RESEND_API_KEY`, `VOTE_SECRET`, `DATABASE_URL` are empty. The deploy does not use it (it writes `.env.production` itself), so no insecure default reaches prod. The `root:root` URL appears only in a comment as a local example.

## Hardening suggestions (no direct attack path; cannot verify on the VPS without SSH)
1. **Default server.** The vhost has no `default_server` and no catch-all. Whether a request with an arbitrary Host/SNI (or the raw IP) lands on this app depends on the naphsoft.dev config and include order. Add an explicit catch-all (`listen 80 default_server; listen 443 ssl default_server; ssl_reject_handshake on; return 444;`) if naphsoft.dev doesn't already have one. Check with `curl -kI -H 'Host: evil.example' https://82.25.95.39/`.
2. `server_tokens off;` in the `http {}` block (not set in the vhost; the global state is unknown).
3. HSTS (`add_header Strict-Transport-Security "max-age=31536000" always;`) on the 443 block once the final domain is in place (not on sslip.io).
4. Optionally strip internal Next headers at the proxy (`proxy_set_header x-middleware-subrequest "";`) as defense in depth. Next 16.2.1 is already patched for CVE-2025-29927.
5. Make sure Docker on the VPS is >= 28 (it blocks L2 neighbours from reaching containers and their 127.0.0.1-published ports directly). Arch's current package satisfies this.
6. Add `*.sql` / `backup*` to `.dockerignore`. The documented `pg_dump … > backup.sql` (vps.md:46) writes into the build context. It would only reach the builder cache on the VPS (not the runner image, given the narrow tracing), but it is cheap to exclude.
7. Pin GitHub Actions to commit SHAs (`actions/checkout@v7`, `actions/setup-node@v7`).
8. `certbot --register-unsafely-without-email`: no expiry warnings if renewal breaks. Consider an email (operational).
9. Local `.env` is mode 644. `chmod 600 .env` (single-user laptop, so low).
