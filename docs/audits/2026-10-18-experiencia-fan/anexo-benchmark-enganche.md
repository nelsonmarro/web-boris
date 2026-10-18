# Engagement benchmark: lore sites and fan wikis (for BorisaoBlois wiki)

Method note: URLs marked [verified] were fetched/searched in this session. URLs marked [known, not re-verified] come from background knowledge of the sites; check them before citing to the client.
Constraint reminder: no invented lore. Every pattern below is rated against that rule. "Derived data" means facts already in the author's canon or in site structure (categories, stats, appearance order), not new story text.

Cost scale for a static Next.js + MDX site: S = under a day, M = 2-4 days, L = a week or more / needs new data or backend.

---

## A. Orientation and first-visit hooks

### 1. "Start here" reading paths / entry funnels
- Examples: Ishtar Collective organizes by Books, Categories and a Grimoire Archive, with a FAQ explaining how content is grouped [verified] https://www.ishtar-collective.net/faqs/ ; League of Legends Universe puts a universe-level hub in front of champions/regions/stories [verified] https://universe.leagueoflegends.com/en_US/champions/
- Mechanism: lowers the "where do I begin" cost. Newcomers get 3 curated doors (by universe, by creature, by video) instead of an index of 60 pages. Reading paths turn a flat wiki into a sequence, which pushes session depth.
- No-invent constraint: Yes. Paths are ordered lists of existing articles ("Start with The Bloop, then X"). Only the ordering is editorial. Better still if the order follows video release order.
- Cost: S (MDX/JSON list + a card component).

### 2. Hub-per-universe pages (regions as navigation)
- Examples: LoL region pages list "Champions of Ionia", locations and people on one page, and each champion links back to "View Region" [verified] https://universe.leagueoflegends.com/en_US/region/ionia/ ; Xerath page shows Role, Region, Related Champions [verified] https://universe.leagueoflegends.com/en_US/champion/xerath/
- Mechanism: a champion page is a door to a collection. Universe pages (Colosos / Capitán de Galeón / Ellos Llegaron) become the "region" layer: members, locations, entities, linked videos.
- No-invent: Yes. Membership comes from existing `universe` frontmatter. Empty sections show a teaser (see section F).
- Cost: S-M (filter by frontmatter, hub template).

### 3. Character/creature roster grid with filters ("find my favorite")
- Examples: LoL champion grid with region labels and role filter [verified] https://universe.leagueoflegends.com/en_US/champions/ ; Hollow Knight wiki enemies grid page [verified] https://hollowknight.wiki/w/Enemies_(Hollow_Knight) ; Eldenpedia Bestiary [verified] https://eldenring.wiki.gg/wiki/Bestiary
- Mechanism: browsing by face/silhouette is faster than text search. Filters by universe, category, hostility, size give "find your type" moments. Big cover tiles with a name and one stat chip create instant favorites.
- No-invent: Yes. Everything is existing frontmatter. Entries without art use the category placeholder.
- Cost: S (you already have a list action; add chips and a tile layout).

---

## B. Classification and "databank" framing (closest to DELIRIUM and the colossi)

### 4. Entity-class taxonomy as a navigation axis
- Examples: SCP Object Classes (Safe/Euclid/Keter etc.) as a rough difficulty indicator in every file [verified] https://scp-wiki.wikidot.com/object-classes ; Subnautica groups fauna into Carnivores / Herbivores / Leviathans with a behavior tag (Passive/Aggressive/Defensive) per creature [verified] https://wiki.subnautica.com/sn/Fauna and defines "Leviathan" as a size-based class [verified] https://wiki.subnautica.com/sn/Leviathans ; Monsterverse uses "Titanus <name>" classification in the infobox [verified] https://wikizilla.org/wiki/Godzilla_(Monsterverse)
- Mechanism: a class badge makes each entry feel like part of a system. Readers start asking "what class is the rest?", which drives lateral browsing. Class pages ("all Colosos") become natural landing pages.
- No-invent: Only with author content for NAMES of classes. You can use classes the author already uses (e.g. "coloso", "titan", category field). Do NOT create a threat scale like Safe/Euclid unless Boris defines it. Safe alternative: derive a visible tier from existing numbers (e.g. length bands) and label it neutrally ("Tamano: Gigante") rather than as lore.
- Cost: S (badge + class landing page); M if you derive tiers.

### 5. Databank / scanner-log presentation (entries as "records")
- Examples: Subnautica PDA Databank: all entries with verbatim texts, grouped by Blueprints / Data Downloads / Indigenous Lifeforms / Trivia [verified] https://wiki.subnautica.com/sn/Databank ; the Scanner creates a Databank entry when you scan a new organism [verified] https://wiki.subnautica.com/sn/Scanner_(Subnautica) ; SCiPNET framing in SCP glossary [verified] https://scp-wiki.wikidot.com/glossary-of-terms
- Mechanism: the container is the content. A file header (ID, status, classification line, "last updated") gives gravity to short texts. Fits your "console/databank" tile style.
- No-invent: Yes, if all header fields are real data (slug, universe, category, stats, appearance video). Avoid fake clearance levels or fake file numbers that imply lore. A neutral file number such as "Registro 007" based on list order is OK as UI, but mark it as an index, not canon.
- Cost: S-M.

### 6. Size comparison / scale view
- Examples: Fandom size charts for Godzilla/kaiju (sorted by meters, dozens of entries) [verified] https://gojipedia-book-crossover.fandom.com/wiki/Size_Chart_(Canon_monsters) ; Subnautica leviathans page lists each class by length (Sea Treader ~20 m to Sea Emperor 160-200 m) and even a "Gargantuan Fossil" [verified] https://wiki.subnautica.com/sn/Leviathans ; Wikizilla infobox shows height/weight/other stats with version variants [verified] https://wikizilla.org/wiki/Godzilla_(Monsterverse)
- Mechanism: scale is the strongest hook for giant-monster fans. It creates instant "wow" and shareable screenshots, and it supports rankings ("who is bigger").
- No-invent: Only with author content: needs canonical `length` per creature. Where a size is missing, show a "?" silhouette slot (see F). Human/submarine reference silhouettes are fine as units (a 1.8 m person is not lore); the submarine must be a canon asset or omitted.
- Cost: M (SVG/CSS horizontal or vertical scale bar from `stats.length`); L if you want art silhouettes.
- Note: your Versus Arena already compares stats; a size mode of the same component is a cheap extension.

### 7. Stats as a "scouting card" with comparison rankings
- Examples: Wikizilla infobox with numeric stats [verified] https://wikizilla.org/wiki/Godzilla_(Monsterverse) ; Subnautica behavior tags per creature [verified] https://wiki.subnautica.com/sn/Fauna
- Mechanism: numbers invite debate ("who wins?"), which is the main driver of comments and YouTube cross-over. Leaderboards (top 5 by length, by power) add free evergreen pages.
- No-invent: Only if stats exist in canon; do not invent missing numbers. Leaderboards must skip creatures with no data and say so.
- Cost: S (computed from frontmatter at build time).

---

## C. Collection and completion

### 8. Discovery log / Pokédex-style "seen vs unseen" with completion %
- Examples: Pokédex: seen = silhouette, caught = colored, neither = number only; completion percent displayed [verified] https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9dex and https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/124-viewing-the-pokedex/ ; Hollow Knight's Hunter's Journal: 168 entries, entries deepen as you encounter more, completion reward (Hunter's Mark) [verified] https://hollowknight.wiki/w/Hunter%27s_Journal_(Hollow_Knight) ; Destiny Grimoire cards that third-party apps show as unlocked vs not yet [verified] https://www.bungie.net/en/Forums/Post/242710339
- Mechanism: the oldest completion loop. A visitor marks entries "visited"; locked ones show silhouettes; a counter "12/40 registros" and badge at milestones. Hunter's Journal also shows a layered reveal (more text after more kills).
- No-invent: Yes. Progress is stored in localStorage (no accounts needed), entries come from your list. Silhouettes use existing art; entries without art use placeholder. Do not gate canon text behind progress (accessibility and SEO); gate only the extras like badges.
- Cost: M (client component + localStorage; optional later sync to account).

### 9. "Seen in" / video-linked appearance index
- Examples: Hunter's Journal ties entries to where you meet them [verified above]; Ishtar Collective links each card/item to the Book or Category it belongs to, with confidence levels [verified] https://www.ishtar-collective.net/faqs/
- Mechanism: connects the wiki to the channel. "Appears in: video X, video Y" gives a reason to watch and a reason to return. Also a natural "watch next" loop for the YouTube feed you already have.
- No-invent: Only with author content: needs a map creature -> videos. Can be a simple manual list in frontmatter.
- Cost: S-M (frontmatter field + link component).

---

## D. Relationships, discovery of new entries

### 10. "Related / you might also like" blocks
- Examples: LoL champion page "Related Champions" row plus Region link [verified] https://universe.leagueoflegends.com/en_US/champion/xerath/ ; Ishtar Collective categories with Level 1/2/3 relation confidence (loosely/somewhat/definitely related) [verified] https://www.ishtar-collective.net/faqs/
- Mechanism: a card row at the bottom of each page keeps the reader moving without search. LoL's relations are editorial, which implies story links.
- No-invent: Yes if relatedness is derived from shared data (same universe, category, similar size/hostility) and the label says "Del mismo universo" or "Tamano similar", not "enemigo de". Editorial relationships ("rival", "aliado") only with author content.
- Cost: S (computed) / S (manual frontmatter `related`).

### 11. Relationship web / mini-graph
- Examples: LoL region pages show people and places per region [verified]; Wookieepedia links articles heavily with continuity tabs [verified] https://starwars.fandom.com/wiki/Forum:CT:Tab_system ; Critical Role Wiki and Eldenpedia lore index pages [verified] https://eldenring.wiki.gg/wiki/Lore (topic index pointing to text passages per faction/character)
- Mechanism: exploration as play. Clicking a node moves to its neighbors; reveals hubs that nobody noticed.
- No-invent: Only with author content. Edges must be canon relationships. A graph of "appears in the same video" or "same universe" is safe because it is derived.
- Cost: M-L (needs edge data; a force graph is heavy on mobile, so prefer a simple list of "Conexiones").

### 12. Random entry / "Descubrir" button, creature of the week
- Examples: MediaWiki "Random page" in all Fandom/wikis (Wookieepedia, Hollow Knight wiki, Subnautica wiki) [known, not re-verified]; Wookieepedia has featured/good/comprehensive article statuses highlighted on pages [verified] https://starwars.fandom.com/wiki/Wookieepedia:Layout_Guide
- Mechanism: serendipity, zero-effort next step, easy to share ("me toco X"). Featured badges tell new readers where the best pages are.
- No-invent: Yes. You already have creature of the week; add a random button and "Destacado" chip for completed articles only (not Proximamente).
- Cost: S.

### 13. Continuity / universe tabs and a clear canon label
- Examples: Wookieepedia Canon vs Legends tab system with banners [verified] https://starwars.fandom.com/wiki/Forum:CT:Tab_system and https://starwars.fandom.com/wiki/Wookieepedia:Canon_policy
- Mechanism: reduces confusion and supports the trust that fans have in "what is official". For you it validates the "only canon" promise.
- No-invent: Yes. Add a small "Fuente: video X / documento del autor" line on pages (provenance chip). That feeds trust and the share card.
- Cost: S.

---

## E. Sharing, timelines and spoiler care

### 14. Spoiler gating and timeline-aware disclosure
- Examples: Wookieepedia spoiler policy: spoiler tags for new releases up to a month after (two for films), and "Did you know" may not use spoilers [verified] https://starwars.fandom.com/wiki/Wookieepedia:Spoilers ; Destiny apps let players hide locked cards so they are not spoiled [verified] https://www.bungie.net/en/Forums/Post/242710339 ; Hunter's Journal reveals extra notes progressively [verified above]
- Mechanism: gives newcomers and recent viewers safety to browse, and makes returning after each new video feel like an event ("nuevo desde el video X").
- No-invent: Only with author content for release order. Safe form: a "Nuevo" / "Actualizado" tag keyed to publication date, plus an optional "ocultar spoilers del ultimo video" toggle where the author flags sections.
- Cost: S (tags) / M (toggle with flagged sections).

### 15. Share cards and per-entry social previews
- Examples: Pokédex-like entry cards are screenshot-bait; Wikizilla infoboxes are routinely cropped for size debates [verified] https://wikizilla.org/wiki/Godzilla_(Monsterverse) ; Ishtar Collective posts "Archive Updates" announcing new additions in-character [verified] https://www.ishtar-collective.net/announcements
- Mechanism: a generated OG image (creature art + name + 2-3 stats + site name) turns every share in WhatsApp/Discord/X into an ad. The Versus Arena result as a card ("X gana a Y") is the strongest viral object.
- No-invent: Yes: use art, name, stats already in frontmatter.
- Cost: M (Next.js `opengraph-image` route per slug; Versus card via query params). Also benefits SEO.

### 16. Changelog / "Archive Updates" feed
- Examples: Ishtar Collective Archive Updates, written in-world as recovery logs ("We have successfully recovered 11 new Grimoire Cards ...") listing exactly what was added [verified] https://www.ishtar-collective.net/announcements
- Mechanism: shows the archive is alive and gives returning readers a reason to open the site after each upload. List form scales with "Novedades" which you already have under /comunidad.
- No-invent: Yes. In-world flavor like "Registro actualizado" is UI voice; avoid writing narrative. Keep it factual: "Nuevo articulo: X. Actualizado: Y".
- Cost: S (already have novedades; auto-generate from article dates).

---

## F. Patterns that turn "Proximamente" gaps into curiosity instead of disappointment

Real examples of withheld content done well:
1. SCP redaction vocabulary: [REDACTED] (reader lacks clearance, available to others), [DATA EXPUNGED] (permanently removed), censor bars (small items like dates/numbers); each has a different meaning and tone [verified] https://scp-wiki.wikidot.com/glossary-of-terms ; the community also has a style essay on when blackboxing helps or hurts [verified] https://scp-wiki.wikidot.com/avoid-the-blackbox . Takeaway: redaction works when the visible part is strong and the missing part is clearly bounded. Do not redact whole pages.
2. Pokédex silhouettes and "???" entries: unknown shapes are the hook; neighbors of seen entries are shown as blank slots [verified] https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9dex . Takeaway: show a locked silhouette with the real name hidden or with name + "Sin registro".
3. Hollow Knight Journal: entries can show a partial state until you do more, with an explicit "number needed" per entry [verified] https://hollowknight.wiki/w/Hunter%27s_Journal_(Hollow_Knight) . Takeaway: say what unlocks it.
4. Ishtar Collective's Grimoire: cards "recovered" in batches with dated announcements [verified] https://www.ishtar-collective.net/announcements . Takeaway: coming-soon content is a dated release, not a hole.
5. Subnautica "Cut or Currently Unobtainable Databank Entries" page: even unobtainable content is catalogued and linked from the Databank [verified] https://wiki.subnautica.com/sn/Databank . Takeaway: a visible index of what is missing builds trust.

Recommended mechanics (all consistent with no-invention):
- **Proximamente card with structure, not an apology.** Keep the section skeleton (Caracteristicas / Alimentacion / Personalidad) visible with a per-section chip "En archivo" or "Pendiente de registro". The reader sees the shape of what will exist.
- **"Archivo incompleto" progress meter per article** (for example 3 of 6 sections complete). Completion is a number fans can watch rise, and it is honest.
- **Silhouette + known facts only.** If an entity has a name and a single canon quote or image, show them; leave everything else as a locked silhouette. Never fill with filler copy.
- **"Avisame" / follow-up hook.** Low-cost: a link to the channel's latest video or a "Suscribete para ver cuando se revele" CTA, or a vote in the weekly poll ("cual quieres que se revele primero"). The poll already exists; reuse it as a demand signal. Only vote options from existing Proximamente entries.
- **Redaction bars on UI labels only, never on canon text.** A style like SCP's censor bar over a stat value that is unknown ("Longitud: ████ m") reads as intentional. Use it only where the author has not published the value, and add a tooltip "Aun no revelado por Boris". Do not imply the redaction hides specific secret content.
- **Public coming-soon index** ("Registro pendiente: 14 entradas") listing names with locked status, like Subnautica's cut/unobtainable catalog. Ties into completion (pattern 8).
- No-invent risk: low if wording stays factual ("No publicado") and does not hint at plot ("clasificado por su peligro"). Avoid in-fiction explanations of why something is hidden unless Boris supplies them. Cost: S-M.

---

## G. Mobile-first patterns (audience arrives from YouTube on phones)

1. **Deep-link landing from video descriptions.** Each video's description can link straight to the creature/character page (and the page links back to the video). YouTube viewers should land on the entity, not the home page. Cost S. Needs the video -> entry map (pattern 9).
2. **Sticky bottom bar** with Search, Random, Universes, Arena (thumb reach), replacing hover/sidebar navigation. The wiki's parallel-route sidebar should become a bottom sheet/drawer on phones. LoL's Universe site also leads with a short list of top-level sections and a grid [verified] https://universe.leagueoflegends.com/en_US/champions/ . Cost S-M.
3. **Tile grids over tables.** 2-column cover tiles with one stat chip; infobox collapsed to the 4-5 key stats with "Ver todo". Wikizilla-style long infobox tables are unusable on small screens. Cost S.
4. **Short first screen.** Name, class badge, one-line description, 3 stats and the main image above the fold; the TOC is a collapsible chip row (not a sidebar). Progressive disclosure for the rest. Cost S.
5. **Swipe/next-previous within a category.** "Siguiente: X" at the bottom of an article and swipe between siblings reduces taps. Cost S-M.
6. **Arena as a phone-native flow.** Two big slots, tap to choose, result card with share button (pattern 15). Cost S given existing Arena.
7. **Weight discipline.** Lazy images, small WebP thumbnails, no heavy graph or 3D by default (pattern 11 and 6 should degrade to lists/bars). Cost S.
8. **Share via native share sheet** (`navigator.share`) with the OG card. Cost S.
9. **Return trigger without accounts.** localStorage-based "continuar donde lo dejaste" and discovery counter (pattern 8) on the home page. Cost S.

---

## Priority suggestion (value vs. cost under no-invention)

1. Do first (S, high impact): 1 Start-here paths, 3 roster grid with chips, 10 related blocks (derived), 12 random + featured, 16 changelog, F Proximamente skeleton + progress meter, G mobile nav/bottom bar.
2. Next (M): 8 discovery log / completion, 6 scale view, 15 OG share cards and Arena result card, 9 video-linked appearances.
3. Only with author input: 4 class naming beyond what the author already uses, 11 relationship web, 14 spoiler toggle, 7 leaderboards where stats are missing.

## Caveats
- League of Legends, Subnautica, Hollow Knight, SCP, Wookieepedia, Ishtar Collective and Bulbapedia pages above were read this session. Pages for Critical Role wiki, Arcane, and MediaWiki's "Random page" were not opened; treat those references as general knowledge.
- Fan wikis on Fandom are community-written; some features (continuity tabs, spoiler policy) rely on moderator workflow. For a single-author site the equivalent is a small `status` + `updated` field in frontmatter, which you already partly have.
