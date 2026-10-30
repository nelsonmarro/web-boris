# Database security audit: PostgreSQL 17 + Prisma v7 (@prisma/adapter-pg) — web-boris

Date: 2026-10-30. Scope: compose files, deploy scripts, `src/lib/prisma.ts`, `prisma.config.ts`, `prisma/schema.prisma`,
`prisma/migrations/**`, every Prisma call site, voter hashing, backups, migrate service. Repo read-only; no production
access. Local check: the running container `websec-qa-db-1` (postgres:15-alpine, started from a copy of this repo's
`docker-compose.yml` in `../web-boris-sec`) was inspected with read-only catalog queries only. No secret values are
reproduced in this report.

Versions in `node_modules`: `@prisma/adapter-pg` 7.6.0, `pg` 8.20.0, `@prisma/client` 7.6.x.

---

## (a) Confirmed findings (confidence ≥ 7)

### A1. The production app connects to Postgres as the cluster superuser — MEDIUM, confidence 10 (exists) / exploitability conditional

- **Location:** `deploy/init-env.sh:23-26` (`POSTGRES_USER=webboris`, `DATABASE_URL=postgresql://webboris:…@db:5432/webboris`),
  `docker-compose.prod.yml:12-14` (`POSTGRES_USER: ${POSTGRES_USER}`), `docker-compose.prod.yml:33` (`env_file: .env.production` for `app`).
- **Category:** excessive privilege (CWE-250), defense in depth.
- **Evidence:** the official image creates `POSTGRES_USER` as the bootstrap superuser, and it is the only login role. On the local
  container: `SELECT rolname, rolsuper … FROM pg_roles` → one role, `rolsuper = t, rolcreaterole = t, rolcreatedb = t`.
  Production uses the same image and mechanism, and the app's `DATABASE_URL` reuses that role.
- **Attack scenario:** today there is **no** SQL-injection vector (see "Safe" below: no raw SQL, all inputs Zod-validated
  and server-derived). But any future raw query, a compromised npm dependency, or RCE in the app container yields
  superuser on the cluster, not just DML on `PollVote`: `COPY (SELECT '') TO PROGRAM 'sh -c …'` → shell as `postgres` in the
  db container; `pg_read_server_files`/`pg_ls_dir`; `ALTER SYSTEM`; `DROP DATABASE`; creating new login roles for persistence.
  An attacker in the app already has the data, so the marginal gain is mainly persistence, destruction and lateral reach into
  the db container. Hence MEDIUM, not HIGH.
- **Fix (proportionate for a hobby site — two roles, no more):** keep `webboris` (superuser) for migrations only, and add a
  DML-only app role.
  1. One-time SQL on the existing prod volume (as `webboris`, via
     `docker compose --env-file .env.production -f docker-compose.prod.yml exec db psql -U webboris -d webboris`):
     ```sql
     CREATE ROLE webboris_app LOGIN PASSWORD :'app_pw'   -- psql -v app_pw="$APP_PG_PASSWORD"
       NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 20;
     REVOKE ALL ON DATABASE webboris FROM PUBLIC;
     GRANT CONNECT ON DATABASE webboris TO webboris_app;
     GRANT USAGE ON SCHEMA public TO webboris_app;            -- PG15+: PUBLIC already lacks CREATE on public
     -- Minimal: the app only reads/inserts votes today (Auth.js has no providers):
     GRANT SELECT, INSERT ON "PollVote" TO webboris_app;
     -- If Auth.js providers are enabled later, the PrismaAdapter needs full DML on its tables:
     GRANT SELECT, INSERT, UPDATE, DELETE ON "User", "Account", "Session", "VerificationToken" TO webboris_app;
     -- Future migrations created by webboris get DML for the app automatically (never _prisma_migrations):
     ALTER DEFAULT PRIVILEGES FOR ROLE webboris IN SCHEMA public
       GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO webboris_app;
     ALTER DEFAULT PRIVILEGES FOR ROLE webboris IN SCHEMA public
       GRANT USAGE, SELECT ON SEQUENCES TO webboris_app;
     ALTER ROLE webboris_app SET statement_timeout = '5s';
     ALTER ROLE webboris_app SET idle_in_transaction_session_timeout = '15s';
     ALTER ROLE webboris_app SET lock_timeout = '3s';
     ```
     (If the default-privileges route grants more than SELECT/INSERT on future tables, that is an acceptable trade-off; a
     future retention job needing UPDATE/DELETE on `PollVote` would require `GRANT UPDATE, DELETE ON "PollVote"`.)
  2. `deploy/init-env.sh`: generate `APP_PG_PASSWORD="$(openssl rand -hex 24)"` and write
     `APP_DATABASE_URL=postgresql://webboris_app:${APP_PG_PASSWORD}@db:5432/webboris`; for fresh volumes, ship the SQL above as
     `deploy/db-init/10-app-role.sh` mounted at `/docker-entrypoint-initdb.d/` (runs only on an empty volume).
  3. `docker-compose.prod.yml`, service `app` (compose `environment` overrides `env_file`):
     ```yaml
     app:
       env_file: .env.production
       environment:
         DATABASE_URL: ${APP_DATABASE_URL}
         POSTGRES_PASSWORD: ''      # don't hand the superuser password to the app container
     ```
     Better still, split `.env.production` into `.env.db` (POSTGRES_*), `.env.app` (app secrets + `APP_DATABASE_URL`) and give
     `migrate` only `DATABASE_URL` (superuser). Today `migrate` also receives `AUTH_SECRET`, `VOTE_SECRET`, `RESEND_API_KEY`,
     and `app` receives `POSTGRES_PASSWORD` (same value as in its `DATABASE_URL`, so currently no extra exposure, but it would
     become one after the role split).
  4. `migrate` keeps `DATABASE_URL` = superuser (`prisma migrate deploy` needs DDL; short-lived, only during deploy).

### A2. Dev compose publishes Postgres on all interfaces with a committed trivial password and a superuser — MEDIUM (developer machines only), confidence 9

- **Location:** `docker-compose.yml:5-9` — `POSTGRES_USER: root`, `POSTGRES_PASSWORD:` a hardcoded, trivially guessable
  literal committed to git, `ports: - "${DB_PORT:-5432}:5432"`.
- **Category:** network exposure + default credentials.
- **Evidence:** `"5432:5432"` with no host IP binds `0.0.0.0` and `[::]`. Docker inserts its own iptables/nft DNAT rules, so
  ufw/firewalld on the dev machine do not block it. (The running QA copy shows `127.0.0.1:5433`, i.e. someone overrode
  `DB_PORT` with an explicit host IP — the committed default does not do that.) Also: dev runs PG 15, prod PG 17.
- **Attack scenario:** developer runs `make dev` on café/coworking/conference Wi-Fi → anyone on the LAN connects to
  `<laptop-ip>:5432` with the password published on GitHub → superuser → `COPY … TO PROGRAM` = code execution inside the
  container on the developer's laptop, from where the attacker has a foothold on the dev network. Data value is low (test votes);
  the code-exec foothold is the real risk.
- **Fix:**
  ```yaml
  # docker-compose.yml
  services:
    db:
      image: postgres:17-alpine          # match production
      ports:
        - "127.0.0.1:${DB_PORT:-5432}:5432"
  ```
  Optionally read the password from `.env` (`POSTGRES_PASSWORD: ${DEV_DB_PASSWORD:-…}`), but loopback binding alone removes
  the exposure. (Aside, out of scope: on this machine two other projects' DBs — `verith_db` 5432 and a MySQL on 3307 — are
  also published on `0.0.0.0`.)

---

## (b) Hardening recommendations

### B1. Vote data retention / pseudonymous data kept forever — LOW (informational, GDPR-ish), confidence 8
- **Location:** `src/features/community/lib/voter.ts:15-17`; `prisma/schema.prisma:57-71`; no delete/cleanup anywhere
  (grepped `deleteMany`/`.delete(` — only in-memory Map/Set deletes).
- **How the hashes are built (verified):**
  - `ipHash = HMAC-SHA256(VOTE_SECRET, networkOf(ip) + "|" + pollId)` — keyed with a ≥ 32-char secret
    (`voteSecret()` enforces length; prod value from `openssl rand -hex 32`), per-poll. **Without the secret it is not
    reversible**, so a DB-only leak (e.g. a leaked `backup.sql`) does not expose IPs. Good design.
  - `voterKey = HMAC-SHA256(VOTE_SECRET, cookieUUID)` — **not** per-poll: the same browser has the same `voterKey` in every
    poll for the cookie lifetime (1 year), so votes across weeks are linkable to one browser.
- **Residual risk:** `VOTE_SECRET` lives in `.env.production` on the same host and inside the app container env. Whoever gets
  the DB **and** the secret can brute-force IPv4 (2^32 HMACs per poll; minutes on a GPU, hours on CPU) and recover the voter
  IP (/64 for IPv6) of every historical vote. Since nothing is ever deleted, the window is unbounded.
- **Fix (cheap):** `ipHash` is only needed while the poll is open (the history uses `groupBy(pollId, option)` only).
  Blank it after the week closes, e.g. opportunistically at the start of `castVote` or in a weekly cron:
  ```ts
  await prisma.pollVote.updateMany({ where: { pollId: { not: poll.id }, ipHash: { not: '' } }, data: { ipHash: '' } });
  ```
  (needs `UPDATE` on `PollVote` if A1 is applied). Optionally make `voterKey` per poll —
  `hmac(secret, `${voterId}|${pollId}`)` — `loadOpenState` and the unique key are already per poll; deploy on a Monday so the
  active week is not reopened. Mention vote hashing in a privacy note.

### B2. Advisory-lock fix for the vote race: `$executeRaw` is correct, with caveats — guidance, confidence 9
- **Verified in `node_modules/@prisma/adapter-pg/dist/index.js:207-296, 601-644`:** `queryRaw` maps every result column's
  OID through `fieldToColumnType`; `void` is OID 2278 (< 16384, not in the switch) → throws
  `UnsupportedNativeDataType` ("Unsupported column type void"). So
  **`$queryRaw\`SELECT pg_advisory_xact_lock(…)\`` fails with this adapter**. `executeRaw` just returns `rowCount` (1) and
  never inspects column types → **`$executeRaw` is the right call**. (Alternative: `$queryRaw` with `…::text` or
  `pg_try_advisory_xact_lock`, which returns `bool`, a supported type.)
- **Caveats for the implementer:**
  1. Use the **transaction client**: `prisma.$transaction(async (tx) => { await tx.$executeRaw\`SELECT pg_advisory_xact_lock(hashtextextended(${ipHash}, 0))\`; … })`.
     Calling `prisma.$executeRaw` inside the callback runs on another pooled connection in autocommit, and the xact lock is
     released immediately → no protection. Keep the tagged template (parameterised), never `$executeRawUnsafe`.
  2. Key on `ipHash` (already includes `pollId`) — that is the counter being raced. 64-bit `hashtextextended` collisions are negligible.
  3. A unique violation (P2002) inside an interactive transaction aborts the PG transaction; any later statement in the same
     `tx` fails with "current transaction is aborted". Make `create` the last statement in the tx and catch P2002 **outside**
     the `$transaction` (or pre-check with `findUnique` inside the locked section, which removes the race anyway).
  4. Each waiting request holds one of the pool's 10 connections (pg default `max: 10`, `src/lib/prisma.ts:7`) while blocked
     on the lock; a burst from one network can starve the pool for the whole site until Prisma's interactive-tx
     `maxWait` (2 s)/`timeout` (5 s) fire. Prefer `pg_try_advisory_xact_lock` via `tx.$queryRaw` (returns boolean) and answer
     "try again"/`limite` when not acquired, or `SET LOCAL lock_timeout = '2s'` first.

### B3. No automated backups; the Docker volume is the only copy — LOW (availability), confidence 9
- **Location:** `docs/deploy/vps.md:46` (manual `pg_dump … > backup.sql` only); `deploy/deploy.sh` has no backup step.
- **Issues:** losing the volume (`docker compose down -v`, disk failure, botched `docker volume prune`) loses all votes. The
  documented command writes `backup.sql` into `/srv/web-boris` (the git checkout) with the default umask (0644), and
  `.dockerignore` does not exclude `*.sql`, so a dump left there is sent into the build context and copied into the `builder`
  stage (`Dockerfile:12`, `COPY . .`) and its cache layers (not into `runner`).
- **Fix:** a pre-migration dump in `deploy.sh` plus a daily systemd timer, outside the repo, mode 600, with rotation and an
  off-host copy (or Hostinger VPS snapshots):
  ```bash
  umask 077; mkdir -p /var/backups/web-boris
  compose exec -T db pg_dump -U webboris -Fc webboris > "/var/backups/web-boris/$(date -u +%F_%H%M).dump"
  find /var/backups/web-boris -name '*.dump' -mtime +14 -delete
  ```
  Add `*.sql` and `*.dump` to `.dockerignore` and `.gitignore`. Test a restore once (`pg_restore -d`).

### B4. Postgres image is never updated by the deploy — LOW, confidence 8
- **Location:** `docker-compose.prod.yml:9` (`postgres:17-alpine`), `deploy/deploy.sh:44-45` (`compose build app migrate`,
  `compose up -d db` — neither pulls `db`). The VPS keeps whatever 17.x was first pulled, without minor security releases.
- **Fix:** `compose pull db` before `compose up -d db` in `deploy.sh` (minor releases within 17 are drop-in), or pin an exact
  minor tag and bump it deliberately.

### B5. No server-side timeouts on the app's sessions — LOW, confidence 7
- **Location:** `src/lib/prisma.ts:7` — `pg.Pool({ connectionString, connectionTimeoutMillis: 3000 })`; no
  `statement_timeout`, `idle_in_transaction_session_timeout`, `max`.
- **Fix:** set them on the role (A1 SQL) or in the pool options:
  `new pg.Pool({ connectionString, connectionTimeoutMillis: 3000, max: 10, statement_timeout: 5000, idle_in_transaction_session_timeout: 15000 })`.

### B6. Unauthenticated full-table aggregate on every request — LOW (availability), confidence 7
- **Location:** `src/app/api/comunidad/historial/route.ts:20` — `groupBy(['pollId','option'])` over the entire `PollVote`
  table, `Cache-Control: no-store`, no caching, on a public GET; the table grows forever (B1). Harmless at today's volume,
  but an easy amplifier later.
- **Fix:** cache the result for 60–300 s (e.g. `unstable_cache`/`'use cache'` with `cacheLife`, or an in-memory memo), and/or
  restrict to the last N weeks (`where: { pollId: { gte: '<week N weeks ago>' } }` — ids start with the ISO week).

### B7. Minor items — LOW / informational
- `src/lib/prisma.ts:5` — `` `${process.env.DATABASE_URL}` `` turns a missing variable into the string `"undefined"` and
  creates the pool anyway; fail fast instead (`if (!process.env.DATABASE_URL) throw …` at first use) for clearer errors.
  In dev, the module-level `pg.Pool` is re-created on every HMR reload even though the `PrismaClient` is reused from
  `globalThis` (pool leak in dev only); store the pool on `globalThis` too.
- Password rotation: `POSTGRES_PASSWORD` is read only when the volume is first initialised. Regenerating
  `.env.production` (init-env.sh refuses to overwrite it, good) would leave `DATABASE_URL` out of sync with the role
  password. Document rotation as `ALTER ROLE webboris PASSWORD …` + edit `.env.production` + `up -d app`.
- Auth.js tables (`User`, `Account`, `Session`, `VerificationToken`) exist but are unused (`auth.config.ts` has no providers,
  JWT sessions). If providers are enabled later, `Account.access_token/refresh_token/id_token` are stored in plaintext
  (Auth.js default); consider encrypting or not persisting them.
- `console.error('[comunidad] voto no registrado:', error)` (`cast-vote.ts:72`) may print Prisma error text including the
  invocation and constraint details; values involved are HMAC hashes, not IPs or emails. Acceptable.
- Docker networks: `db` and `app` share the default project network; the host can reach the db's bridge IP (password auth
  required). Optional: put `db` on an `internal: true` network shared with `app`/`migrate`, keeping `app` on a second
  network for outbound (YouTube RSS, Resend).

---

## Checked and found SAFE

- **Prod Postgres port:** `docker-compose.prod.yml` `db` has no `ports:` → not published; only `app` publishes, on
  `127.0.0.1:3131`. Reachable only from containers on the project network (and the host via the bridge IP).
- **Prod password:** `openssl rand -hex 24` (192 bits, URL-safe hex, no encoding pitfalls in `DATABASE_URL`), generated on the
  VPS, never printed; `umask 077` → `.env.production` mode 600 (root-owned, since `setup-vps.sh` runs as root).
  `POSTGRES_PASSWORD` and `DATABASE_URL` are written from the same shell variable in one heredoc → consistent; the script
  refuses to overwrite an existing file. `.env*` is in `.gitignore` and `.dockerignore` (only `.env.example` is tracked; its
  `DATABASE_URL` is a placeholder pointing at localhost). Build stage uses a dummy `build:build@localhost` URL.
- **`POSTGRES_HOST_AUTH_METHOD`:** not set anywhere in the repo. pg_hba (verified on the local container, same image family):
  `local all all trust`, `host … 127.0.0.1/::1 trust` (inside the container only), `host all all all scram-sha-256`;
  `password_encryption = scram-sha-256`. Same defaults for postgres:17 with a password set.
- **TLS:** no `sslmode` anywhere; `ssl = off`. App↔DB traffic stays on the Docker bridge on one host → acceptable.
- **Prisma logging:** `new PrismaClient({ adapter })` with no `log` option → no query/param logging. The adapter's
  `debug()` output (query + args) is only emitted with the `DEBUG` env var, which is not set in prod.
- **Singleton:** `globalThis` caching in dev; one module-level instance in prod. Fine.
- **Call sites (complete list):** `cast-vote.ts:55,60,65`, `poll-state.ts:93,95`, `historial/route.ts:20`, and
  `PrismaAdapter(prisma)` in `src/core/auth/auth.ts:7`. **No** `$queryRaw`, `$executeRaw`, `*Unsafe`, `Prisma.sql`, or
  `Prisma.raw` anywhere in `src/`/`scripts/`.
- **Operator injection / mass assignment:** the only client input is `castVote({ pollId, option })`, parsed by
  `z.object({ pollId: z.string().max(160), option: z.string().max(80) })` (`vote-input.ts:5-8`; extra keys stripped, objects
  rejected), then checked for equality against the **server-computed** poll. `where`/`data` are built field by field from
  server values (`poll.id`, validated `option`, HMACs) — no spreading of client objects, no client-controlled
  `orderBy`/`select`. The history route takes no input.
- **Constraints the logic relies on exist in the migration:** `PollVote_pollId_voterKey_key` UNIQUE
  (`migration.sql:82`, backs `findUnique({ pollId_voterKey })` and the P2002 double-click guard); `PollVote_pollId_ipHash_idx`
  (non-unique by design, for the per-network count); `PollVote_pollId_userId_key` UNIQUE (NULLs are distinct in PG, so
  anonymous votes are not blocked).
- **PII:** contact form (`src/core/actions/contact.action.ts`) does not touch the DB (email via Resend, in-memory rate limit).
  No raw IPs stored anywhere; Auth tables empty (verified locally: 0 rows).
- **Migrate service:** `Dockerfile:40-43` image contains only `node_modules`, `prisma/`, `prisma.config.ts` (no `.env`, so
  `dotenv/config` loads nothing); CMD is fixed to `prisma migrate deploy` (never resets/drops). `deploy.sh` only runs that
  CMD. Accidental `migrate reset`/`migrate dev` against prod from a dev machine is impossible (DB not published; the local
  `.env` points at localhost); on the VPS it would need an explicit `compose run --rm migrate npx prisma migrate reset --force`.
  Credentials: the superuser from `.env.production` (appropriate for DDL; see A1 to stop sharing it with the app).
