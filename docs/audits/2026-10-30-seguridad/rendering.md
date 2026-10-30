# Security audit: client-side injection, rendering & HTTP config

Scope: XSS sinks, MDX pipeline, URL params, share text, OG routes, localStorage, next.config.ts, YouTube embeds, info leakage.
Repo: web-boris @ 752762e (main). Next 16.2.1, next-mdx-remote-client 2.1.10. Read-only review.

## Findings (confidence >= 7, exploitable)

**None.** No HIGH or MEDIUM issue with a practical exploit path was found in this scope. Every sink that takes data
either receives repository-controlled content (MDX, JSON in `src/content/`) or allowlist-validated input.

## Low / informational (not exploitable today; hardening)

1. **`images.remotePatterns` allows all of `placehold.co`** (`next.config.ts:13-16`), Hardening, LOW, conf 8.
   Nothing in `src/` references placehold.co (grep returns nothing). Anyone can make `/_next/image?url=https://placehold.co/...`
   fetch and cache images from that host, including arbitrary text rendered by placehold.co (`?text=`), served from
   the site's origin. No SSRF (fixed external host), and the impact is cache/bandwidth use and odd content on your origin.
   Fix: remove the `placehold.co` entry. The `i.ytimg.com` entry is already restricted to `/vi/**`, which is fine.

2. **MDX allows JS expressions, `import` and `export`** (`src/features/monsters/components/wiki/mdx/MdxRenderer.tsx:179-188`),
   informational. `MDXRemote` is called without `disableImports` or `disableExports`, so `{...}` expressions run on the
   server at build or ISR time. MDX comes only from `src/content/*.mdx` in the repo and no user input reaches it, so
   this is a supply-chain or contributor-trust issue, not XSS. If content ever comes from a CMS (the `ContentRepository`
   seam is built for that), set `disableImports: true`, `disableExports: true` and strip `mdxFlowExpression` and
   `mdxTextExpression` nodes (or use `format: 'md'`) before going live.

3. **MDX `a` override treats `/\host` as internal** (`MdxRenderer.tsx:126`): `href.startsWith('/') && !href.startsWith('//')`
   lets `/\evil.com` through to `<Link>`, and browsers resolve that as protocol-relative `//evil.com`. Only an author
   can write it (repo content), so it is not exploitable. For consistency, reject `/\` the same way `NewsLink` already
   does (`src/core/content/schemas.ts:59`). `javascript:` hrefs in MDX fall to the plain `<a>` branch, and React 19
   blocks `javascript:` URLs anyway.

4. **No CSP** (documented choice in `next.config.ts:24-25`), informational only. **No HSTS header**, neither in
   `next.config.ts` nor in `deploy/nginx/web-boris.conf`. The HTTPS block is added by certbot, so this depends on what
   certbot writes. Consider `add_header Strict-Transport-Security "max-age=31536000" always;` in the 443 block.

## Checked and SAFE

- JSON-LD `FAQPage` (`src/app/(wiki)/wiki/[slug]/page.tsx:82`): `serializeJsonLd` (`src/features/monsters/lib/faq.ts:42`) escapes `<`, `>` and `&` to `<`, `>` and `&`, so `</script>` and `<!--` cannot break out. U+2028/2029 do not matter in a non-executed `application/ld+json` block. The data is frontmatter only. It is the only `dangerouslySetInnerHTML` in `src/`.
- No `innerHTML`, `eval`, `new Function`, `rehype-raw` or `allowDangerousHtml` anywhere in `src/`. The `window.location` uses are only `reload()` and reads (`search`, `hash`, `origin`, `href`), never assignments.
- `remark-entity-links.ts`: it builds link nodes only with `url: /wiki/${slug}` from the entity index (repo slugs), so no raw HTML is produced.
- Arena `?a=`/`?b=` (`ArenaSimulator.tsx`, `resolve-pair.ts`): allowlisted against the fighter slugs, so an unknown value falls back to the defaults. The value is written back with `URLSearchParams` and `replaceState` (same origin) and is never rendered raw. `document.title` uses titles from the repo. The server never reads `searchParams` (static page with fixed metadata).
- Size game `?reto=` (`size-game.ts:129`): it must match `/^\d{1,3}$/` and fall within 1 to `MAX_RETO`.
- `/videos?orden=` (`videos-by-universe.ts:31`): only the enum values `recientes`, `historia` or `antiguos` are accepted.
- `WikiList` params (`search`, `universe`, `page`): they go through `URLSearchParams`, are shown as JSX text, and the server action validates them with Zod.
- Search palette navigation: `router.push` targets `/wiki/<indexed slug>` or `/wiki?search=${encodeURIComponent(q)}`. `querySelector` only gets a numeric index.
- Share text (`battleShareText`, `tournamentShareText`, `shareMessage`, `WikiArticleActions`): only `navigator.share` and the clipboard, built from repo titles, `location.origin` and `encodeURIComponent` slugs (`arena-battle.ts:196`). There are no X or WhatsApp intent URLs.
- OG images (`wiki/[slug]`, `wiki/arena`, `wiki/tamanos` `opengraph-image.tsx`): they take no query params. `[slug]` has `dynamicParams = false` plus `generateStaticParams`, and arena and tamanos are static. Fonts are read from local disk. `loadCover` (`og/cover.ts`) reads only local `public/` paths, guarded by `normalize` and a `startsWith(PUBLIC_DIR + sep)` check, with no remote fetch, so no SSRF and no arbitrary text.
- Article lookup: `getArticle(slug)` searches the in-memory list and never builds a file path from the URL, so there is no path traversal.
- localStorage `wb-registro`: `cleanSeen` keeps only string values, and the slugs are used only to intersect with repo entries (`progress`), never rendered as hrefs. A `__proto__` key is harmless.
- localStorage `wb-arena` (`parsePredictions`): integer counts only. `wb-tamanos` (`parseBest`): a positive integer only.
- YouTube: feed ids are checked against `/^[\w-]{11}$/` (`youtube-feed.ts`), and `canal.json` and `videos.json` against `YOUTUBE_ID_REGEX` (`schemas.ts:74`). The iframe host is fixed to `youtube-nocookie.com/embed/${id}` and thumbnails to `i.ytimg.com/vi/${id}`. Titles are entity-decoded and rendered as JSX text.
- News `enlace`: only internal `/…` (with `//` and `/\` rejected) or `https://` YouTube hosts with no userinfo or port (`schemas.ts:48-60`).
- Poll history (`PollHistoryTiles`): rendered slugs are filtered through the `fighters` map, and the `pollId`s in the database can only be the active poll's server-side id (`castVote` → `checkVote`).
- Redirects: the two `redirects()` entries are fixed internal paths. `/wiki/aleatorio` returns a relative `Location: /wiki/<registro slug>`, and the Referer is used only for exclusion, so there is no open redirect. `proxy.ts` redirects to a fixed `/api/auth/signin`. No `callbackUrl` handling and no `rewrites`.
- `next.config.ts`: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` and `Permissions-Policy` are set and `poweredByHeader` is false. There is no `dangerouslyAllowSVG` and no `productionBrowserSourceMaps`, so no browser source maps in production.
- Env exposure: no `'use client'` file reads `process.env`. The only `NEXT_PUBLIC_` variable is `NEXT_PUBLIC_SITE_URL`, which is public by design. `HERO_FORCE_SLUG` is server-only and checked against `HERO_POOL`. Error boundaries do not render `error.message` or `stack`.
- Image viewer and entity preview read `data-viewer-src` and `data-entity` attributes that the server rendered from repo content.
