# IA / discoverability audit — first-time fan view
Repo: web-boris @ main (b0ea9e1). Read-only. Data computed with throwaway scripts (inventory over the MDX frontmatter and the real `getRelatedArticles` logic over the real nav). 37 articles. Today = 2026-W42.

Totals: Colosos 31 (5 prox, 14 no cover), Capitán de Galeón 3 (1 prox), Ellos Llegaron 2, La Hecatombe del Lapeón 1 (prox). 8 articles `status: proximamente`. 6 articles have `stats` (bogbo, el-gran-maja, le-mug, slowdown-criyote, the-bloop, vlad-julia). Zero `<WikiQuote>` in any article. 2 `<WikiGallery>` (the-bloop, vehiculos).

## 1. Inventory
Cols: cover = non-brand `image` in frontmatter; ib = infobox sections; prox = `<Proximamente>` blocks; out/in = in-body `/wiki/<slug>` links to/from other articles (related excluded); nav = in `wiki-navigation.ts`; land = landing links it directly (FeaturedCharacters section, `featured-characters.ts:9-27`).

| slug | title | universe | category | status | cover | stats | ib | words | prox | out | in | nav | land |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| animales-colosos | Animales del Universo Colosos | Colosos | Directorio | - | Y | N | N | 167 | 0 | 8 | 0 | Y | N |
| aodos-ay01 | Aodos AY01 | Colosos | Vehículo | prox | Y | N | N | 11 | 0 | 0 | 1 | Y | N |
| bogbo | Bogbo | Colosos | Coloso | - | Y | Y | N | 23 | 1 | 0 | 2 | Y | N |
| breegard | Breegard | Colosos | Vehículo | - | Y | N | N | 108 | 1 | 1 | 1 | Y | N |
| cael-cortes | Cael Cortés | Colosos | Humano | prox | N | N | N | 11 | 0 | 0 | 1 | **N** | N |
| capitan-de-galeon | Capitán de Galeón | Capitán de Galeón | Historia | - | Y | N | N | 154 | 1 | 0 | 0 | Y | N |
| categorias-monstruos | Categorías de Monstruos | Colosos | Directorio | - | N | N | N | 54 | 0 | 3 | 0 | **N** | N |
| colosos | Colosos | Colosos | Categoría | - | Y | N | N | 148 | 0 | 9 | 2 | Y | N |
| cronologia-wwii | Cronología de la WWII | Ellos Llegaron | Historia | - | Y | N | N | 89 | 1 | 1 | 0 | Y | N |
| delirium | DELIRIUM | Colosos | Organización | - | Y(*) | N | N | 122 | 0 | 0 | 2 | Y | N |
| el-angel | El Ángel | Ellos Llegaron | Entidad | - | Y | N | N | 65 | 1 | 0 | 1 | Y | N |
| el-destello-de-los-colosos | El Destello de los Colosos | Colosos | Libro | prox | N | N | N | 11 | 0 | 0 | 1 | **N** | N |
| el-gran-maja | El Gran Majá | Colosos | Coloso | - | Y | Y | 2 | 1183 | 0 | **0** | 4 | Y | **Y** |
| especies | Especies Identificadas | Colosos | Directorio | - | Y | N | N | 68 | 0 | 6 | 0 | **N** | N |
| garddiodon-typus | Garddiodon typus | Colosos | Especie | - | N | N | 3 | 764 | 0 | 0 | 3 | Y | N |
| humanos-colosos | Humanos del Universo Colosos | Colosos | Directorio | - | Y | N | N | 46 | 1 | 2 | 0 | Y | N |
| ipcaro | IPCARO | Colosos | Organización | - | N | N | N | 87 | 1 | 2 | 1 | Y | N |
| kaiserosteus-loricatus | Kaiserosteus loricatus | Colosos | Especie | - | Y | N | 2 | 173 | 0 | 1 | 2 | Y | N |
| la-hecatombe-del-lapeon | La Hecatombe del Lapeón | La Hecatombe del Lapeón | Historia | prox | N | N | N | 106 | 0 | 0 | 0 | Y | N |
| labodotype-macrostoma | Labodotype macrostoma | Colosos | Especie | - | Y | N | 3 | 731 | 0 | 0 | 2 | Y | N |
| lampasiteras | Lampasiteras | Colosos | Especie | - | N | N | 2 | 220 | 0 | 1 | 2 | Y | N |
| le-mug | Le'Mug | Colosos | Titán | - | N | Y | 2 | 438 | 0 | 0 | 3 | Y | N |
| libros-colosos | Libros del Universo Colosos | Colosos | Directorio | - | N | N | N | 14 | 1 | 1 | 0 | Y | N |
| medianos | Medianos | Colosos | Categoría | prox | N | N | N | 23 | 0 | 2 | 1 | Y | N |
| naciones-rebeldes | Naciones Rebeldes | Colosos | Organización | prox | N | N | N | 19 | 0 | 0 | 1 | Y | N |
| navios-galeon | Navíos del Siglo XVIII | Capitán de Galeón | Vehículo | - | Y | N | N | 34 | 1 | 0 | 0 | Y | N |
| organizaciones | Organizaciones | Colosos | Directorio | - | N | N | N | 59 | 1 | 3 | 0 | **N** | N |
| phillip-forte | Phillip Forte | Colosos | Humano | - | Y | N | N | 165 | 0 | **0** | 2 | Y | **Y** |
| phiscanula-arcticum | Phiscanula arcticum | Colosos | Especie | - | N | N | 2 | 150 | 1 | 1 | 2 | Y | N |
| piratas-galeon | Piratas y Bucaneros | Capitán de Galeón | Historia | prox | N | N | N | 17 | 0 | 0 | 0 | Y | N |
| porcia-la-gris | Porcia la gris | Colosos | Animal | - | Y | N | N | 21 | 1 | 0 | 1 | Y | N |
| slowdown-criyote | Slowdown Criyonte | Colosos | Coloso | - | N | Y | 2 | 598 | 0 | 0 | 3 | Y | N |
| supperbial-anguilla | Supperbial anguilla | Colosos | Especie | - | Y | N | 2 | 278 | 0 | 1 | 2 | Y | N |
| the-bloop | The Bloop Ojo Solo | Colosos | Coloso | - | Y | Y | 2 | 1072 | 0 | **0** | 2 | Y | **Y** |
| titanes | Titanes | Colosos | Categoría | - | N | N | N | 143 | 0 | 3 | 2 | Y | N |
| vehiculos | Vehículos y Tecnología | Colosos | Directorio | - | Y | N | N | 98 | 0 | 2 | 0 | **N** | N |
| vlad-julia | Vlad Julia | Colosos | Coloso | - | Y | Y | 2 | 379 | 0 | 0 | 3 | Y | N |

(*) delirium's cover is the Aodos AY01 sub (same file as aodos-ay01.mdx), not DELIRIUM-specific. Kaiserosteus cover = Vlad Julia art; Supperbial cover = same file as El Gran Majá (acceptable: single member).
Quotes: 0 articles. Images in body: only the-bloop (7), el-gran-maja (6, 1 pendiente), el-angel (2), vlad-julia (2), vehiculos (2), others 0–1.

## 2. Dead ends and orphans
- **No inbound body links (12):** animales-colosos, capitan-de-galeon, categorias-monstruos, cronologia-wwii, especies, humanos-colosos, la-hecatombe-del-lapeon, libros-colosos, navios-galeon, organizaciones, piratas-galeon, vehiculos. Most are directories (reachable via nav/tiles), but the whole Capitán de Galeón / Ellos Llegaron / Lapeón set (5 articles) is only reachable by nav, universe filter or search; none link to each other. `capitan-de-galeon`, `navios-galeon`, `piratas-galeon`, `la-hecatombe-del-lapeon`, `el-angel` have 0 outbound body links.
- **Not in the sidebar (6):** cael-cortes, categorias-monstruos, el-destello-de-los-colosos, especies, organizaciones, vehiculos. Cael Cortés appears only as a link inside `humanos-colosos`; "Humanos" nav group lists only Phillip Forte (`wiki-navigation.ts:56-60`).
- **Nav entries that are only directories (url "#"):** Libros, Personajes, Especies, Categorías, Vehículos, Organizaciones (`wiki-navigation.ts:34,41,69,81,93,102`) — they only expand; no landing page for "Especies/Vehículos/Organizaciones" is linked from the group title although `especies`, `vehiculos`, `organizaciones` exist (orphaned from nav for exactly that reason). Libros child is labelled "El Destello de los Colos..." (hard-truncated, line 38) and points to `libros-colosos`, not `el-destello-de-los-colosos`.
- **Characters with 0 outbound body links (the main hooks):** el-gran-maja, the-bloop, phillip-forte, bogbo, vlad-julia, le-mug, slowdown-criyote, porcia-la-gris, delirium. E.g. `the-bloop.mdx:115` names "El Gran Majá" and DELIRIUM in the battle section with no link; `delirium.mdx:14` names Phillip Forte unlinked; `phillip-forte.mdx:10` says IPCARO/DELIRIUM unlinked. Cross-links exist only in directory pages and species pages.
- **Mostly-Próximamente:** 8 stub articles of 11–19 words (aodos-ay01 11, cael-cortes 11, el-destello 11, piratas-galeon 17, naciones-rebeldes 19, medianos 23, libros-colosos 14 with a Próximamente block, plus la-hecatombe 106 words but prox status). Real-content articles that are ≥50% Próximamente by words: bogbo (23 words + 1 block), porcia-la-gris (21 + 1), navios-galeon (34 + 1), humanos-colosos (46 + 1).
- **Thin universes:** Capitán de Galeón = 3 articles, 1 stub, no characters, no creatures (the "cran" and the captain are mentioned in `capitan-de-galeon` body but have no page). Ellos Llegaron = 2 articles (El Ángel 65 words, Cronología 89). Lapeón = 1 stub. Colosos humans: 2 (one stub). Colosos "Medianos" category empty (stub). Categories: Libro 1 stub, Entidad 1, Titán 1 (Le'Mug), Animal 1 (Porcia).

## 3. What "related" shows (real logic, max 4)
Logic: nav siblings in nav order, then same `category`, then same `universe` (`related.ts:41-69`).

| article | related shown |
|---|---|
| the-bloop | el-gran-maja, bogbo, slowdown-criyote, vlad-julia |
| el-gran-maja | the-bloop, bogbo, slowdown-criyote, vlad-julia |
| bogbo | el-gran-maja, the-bloop, slowdown-criyote, vlad-julia |
| vlad-julia | el-gran-maja, the-bloop, bogbo, slowdown-criyote |
| slowdown-criyote | el-gran-maja, the-bloop, bogbo, vlad-julia |
| le-mug | el-gran-maja, the-bloop, bogbo, slowdown-criyote |
| porcia-la-gris | el-gran-maja, the-bloop, bogbo, slowdown-criyote |
| phillip-forte | cael-cortes (stub), animales-colosos, aodos-ay01 (stub), bogbo |
| delirium | ipcaro, naciones-rebeldes (stub), animales-colosos, aodos-ay01 (stub) |
| el-angel | cronologia-wwii (only 1) |
| capitan-de-galeon | navios-galeon, piratas-galeon (stub), cronologia-wwii, la-hecatombe (stub) |

Assessment: for the 7 animals the cap of 4 against 7 siblings means the same first four (nav order) always win; Le'Mug and Porcia la gris are never shown on other animal pages, so they are only reachable via nav/directory/Arena. No reciprocal "species/organisation" link (Majá -> Supperbial anguilla; Bloop -> Labodotype; Phillip -> DELIRIUM/IPCARO; Criyonte -> Phiscanula) because those are not nav siblings. Phillip Forte's 4 slots go to 2 stubs, a directory and Bogbo (alphabetical universe fallback) — a poor next step. Cross-universe jumps never happen. Stub articles are surfaced as related without a visual caveat (cards do show Próximamente chip via `ProximamenteChip` in `WikiArticleCard`). Verdict: serviceable among the animals, but not a "keep reading" engine; related is a cluster of the same 4 famous names.

## 4. Search
Three entry points: (a) landing hero `SearchBar.tsx` (also reused in wiki mosaic `WikiHomeMosaic.tsx:79`), (b) explorer search box `WikiSearch` in `WikiList` (uses `getWikiArticles`), (c) palette `WikiCommandPalette` (⌘K, wiki layout only: `app/(wiki)/wiki/layout.tsx`).

| aspect | (a) hero | (b) explorer | (c) ⌘K palette |
|---|---|---|---|
| mechanism | no search itself; `router.push('/wiki?search=q#explorar')` (`SearchBar.tsx:13-14`); submit only, no suggestions | server action, 400 ms debounce, 9 per page (`WikiList.tsx:24-25`) | client filter on `getWikiIndex()`, max 10 (`WikiCommandPalette.tsx:15,18-38`) |
| fields | → (b) | title, universe, category, description (`get-wiki-articles.ts:51-56`) | same 4 fields |
| not searched | body text, infobox ("Otros nombres"), slug, stats | same | same |
| accents | → (b): NFD strip + lowercase both sides (`:35-40`), so Maja = Majá, Galeon = Galeón | yes | yes (own copy of normalize) |
| ranking | none | none; alphabetical by title (`mdx.ts` sort) | title-prefix 3 > title-contains 2 > meta 1 |
| partial words | substring; "blo" finds The Bloop | substring | substring + prefix boost |
| multi-word | whole string as one substring: "gran maja" ok, "maja gran" 0, "bloop solo" 0 ("bloop ojo solo" ok) | same | same |
| aliases | "Cranioplanus" 0 results (alias only in infobox `el-gran-maja.mdx:20`, `supperbial-anguilla.mdx:33`); "Criyote" (slug spelling) 0, "criyonte" ok; "la mancha estrellada" finds it (description); "Boris" etc 0 | same | same |
| typos | none (no fuzzy): "Philip Forte", "Bloup", "Maya" -> 0 | none | none |
| noise | "colosos" matches all 31 Colosos-universe articles via universe field; "coloso" matches category + descriptions | same | same (palette ranks title first) |
| zero results | → (b) | `WikiEmptyState`: "Ningún registro coincide... Prueba con otro nombre, o cambia el universo o la categoría del filtro." No clear button, no suggestions, no popular list | "Sin resultados en el archivo." dead text, no fallback |
| empty query | goes to /wiki | all articles A→Z (stubs first alphabetically: "Animales...", "Aodos AY01 (stub)") | first 10 A→Z (index.slice) - same stub-heavy opening |

Same behaviour between hero and wiki search (hero hands off to explorer). Palette is a different engine (ranked, 10 cap) and unavailable on the landing page (hero + nav have no ⌘K). Category/universe filters are exact-match against raw labels (`:59-65`), so a bad `?category=` in a URL is silently dropped (`WikiList.tsx:29`).

## 5. Paths from the landing
Landing entry points: hero search; "Acceder a la wiki" button; creature-of-the-week tile (rotates over the 6 `stats` creatures, `featured.ts:17-18`); poll teaser; Arena tile (Majá vs Bloop); universe tiles/flip cards -> `/wiki?universe=X#explorar`; "Personajes destacados" (Bloop, Majá, Forte); footer links (Wiki, Arena, universe filters).

| target | shortest path | clicks | notes |
|---|---|---|---|
| Phillip Forte | scroll to "Personajes destacados" -> "Abrir expediente" | 1 (+scroll) | only human reachable from landing |
| El Gran Majá / The Bloop | same featured section, or Arena tile -> fighter -> article | 1 | |
| Bogbo | Wiki mosaic category "Colosos" -> colosos page -> Bogbo (3), or sidebar Personajes>Animales>Bogbo (3-4), or search "bogbo" (type+submit+click = 2) ; weekly creature 1 week in 6 | 2-4 | |
| Capitán de Galeón (any) | universe tile -> filtered explorer (3 cards: 1 is a stub) -> card | 2 | no characters exist; "Piratas" is a stub |
| Cael Cortés | Wiki -> sidebar Personajes>Humanos (lists only Phillip) -> Humanos page -> Cael; or explorer category "Humano" | 4 | not in nav |
| Le'Mug / Porcia | sidebar Animales, or Arena (Le'Mug in W44 duel); never shown in related of other animals | 3-4 | |
| IPCARO/DELIRIUM | Organizaciones nav group (3) | 3 | |
| Lapeón | universe tile -> explorer -> single stub card | 2 | |

Effectively undiscoverable without search/deep nav: Le'Mug, Porcia la gris, Cael Cortés (stub), Garddiodon, Lampasiteras, Kaiserosteus, Phiscanula (only species group in nav + species links from directory pages), Codateo/Caletonia are mentioned but have no page. Landing never exposes "all characters"; there is no "characters index" link from landing (only generic `/wiki` and filters).

## 6. Naming consistency
| issue | evidence |
|---|---|
| Slug vs title: `slowdown-criyote` vs "Slowdown Criyonte"; also `criyote` in `featured.ts`/arena URLs/encuestas.json (`"b": "slowdown-criyote"`) | frontmatter title/nav title "Criyonte" (`wiki-navigation.ts:46`) |
| Title "The Bloop Ojo Solo" vs nav "The Bloop" vs one body "The Bloop (Ojo Solo)" | `the-bloop.mdx` title; nav line 44; palette/explorer show full title |
| "Fiscánula" in prose vs "Phiscanula" article/nav ("fiscánulas árticas") | `phiscanula-arcticum.mdx:19` |
| "Lapeón" vs "Lapeon" (2) | content grep |
| Universe label: `universe` values "Colosos", "Capitán de Galeón", "Ellos Llegaron", "La Hecatombe del Lapeón" vs nav headers "UNIVERSO COLOSOS"/"CAPITÁN DE GALEÓN"/... vs directory titles "del Universo Colosos" (Animales/Humanos/Libros) vs tile "Colosos". "Universo" prefix only on Colosos. | `wiki-navigation.ts:23,95,...` |
| Category labels mix: singular nouns (Coloso, Titán, Especie, Humano, Animal, Vehículo, Organización, Libro) with abstract ("Categoría", "Directorio", "Historia", "Entidad"). "Categoría" is a category of the pages that describe categories; "Coloso" is both category tile label ("Colosos") and the category page's own category ("Categoría") — fan filter dropdown shows 12 values. Porcia is "Animal" while Majá/Bloop are "Coloso" — Animal/Coloso overlap. Dropdown shows singular ("Coloso") while tiles show plural ("Colosos"). | `WikiHomeMosaic.tsx:19-26`; counts: Directorio 7, Especie 6, Coloso 5, Historia 4 |
| "Historia" used as category for Capitán de Galeón, Cronología WWII, Hecatombe, Piratas — covers lore overview, timeline and stub alike | frontmatter |
| Nav: "Organizaciones" group and directory "Organizaciones" and tile "Organi­zaciones" (soft hyphen) fine; nav "Versus" vs footer "Versus Arena" vs route /wiki/arena; "Wiki" nav entry points to explorer | `wiki-navigation.ts:106` |
| Majá alt names: "Cranioplanus", "anguila sonriente", "anguila cráneo plano" (canon, in infobox/species) not searchable | see §4 |

## 7. Engagement hooks present vs missing
| hook | present where | missing where |
|---|---|---|
| Infobox | 15 articles (animals, species with 2–3 sections) | all humans, orgs, vehicles, Bogbo, Porcia, Le'Mug has, Capitán/Ellos Llegaron/Lapeón (0), Phillip Forte (no infobox) |
| Stats / threat bars | 6 creatures (Bogbo, Majá, Bloop, Vlad Julia, Le'Mug, Criyonte) | Porcia, Garddiodon, Lampasiteras, Phiscanula species; all non-creatures |
| Arena (Versus) | `/wiki/arena`, nav "Versus", footer, landing tile, wiki mosaic tile; only the 6 stats creatures can fight | no button from a creature article to "pit this creature vs another" is evident in the related logic (not audited in UI); stats-less animals excluded |
| Creature of the week | landing mosaic + wiki mosaic + hub; rotates over 6 creatures (6-week cycle) | not shown on article pages |
| Polls / hub /comunidad | landing teaser, hub, curated duels only for W42–W44 then auto-rotate | polls link to Arena but not to creature pages (`PollTile.tsx:156`) |
| Related | every article footer | see §3 |
| Quotes (`WikiQuote`) | **none** — 0 of 37 | everywhere (the component exists; Boris must supply canon quotes) |
| Galleries | the-bloop, vehiculos | all others |
| Cover image | 23 of 37 (excl. stubs) | no cover: garddiodon, lampasiteras, le-mug, slowdown-criyote (stats creatures -> weak thumbnails in palette/week tile), ipcaro, phiscanula, cael, destello, libros, medianos, naciones, organizaciones, piratas, categorias, lapeón |
| Body images | the-bloop 7, majá 6, others ≤2 | bogbo 1, phillip 1, most articles 0 |
| Novedades (news) | 2 items in hub | not on wiki pages |
| Search ⌘K | wiki layout | landing, hub |

## 8. Top 10 problems
1. 🔴 **Protagonist pages are dead ends.** A fan reading El Gran Majá / The Bloop / Phillip Forte / DELIRIUM can't click through to mentioned entities: 0 outbound body links on 9 main character pages (e.g. `the-bloop.mdx:115` names Majá + DELIRIUM unlinked; `delirium.mdx:14` Phillip unlinked). Fix: link existing names inline to existing pages (pure markup, no new text); add the same for species pages.
2. 🔴 **"Related" is the same four animals everywhere and ignores real relations.** Phillip's related = 2 stubs + directory + Bogbo; Le'Mug/Porcia never shown; no species/organisation reciprocity. Fix: add optional frontmatter `related: [slugs]` (curated, structural), fall back to nav; exclude `status: proximamente` unless nothing else; random/rotating sample of sibling set instead of first 4 by nav order.
3. 🔴 **Search misses names a fan would type.** Only title/universe/category/description; no aliases ("Cranioplanus", "Criyote"), no body/infobox, no word-order tolerance ("bloop solo"), no typo tolerance; zero-results pages are dead text. Fix: index infobox values + slug + token-based AND matching; accent+word-order insensitive scoring; `aliases` frontmatter (from canon "Otros nombres") ; zero-result state with 6 popular creatures + clear-filter button. Same module should drive explorer and ⌘K.
4. 🔴 **Capitán de Galeón / Ellos Llegaron / Lapeón are thin and nearly unreachable.** 3+2+1 articles, 0 inbound links, 0 outbound links, no characters, one is a stub; a fan of the other universes hits 2-card pages. Fix (structure only): cross-link these 6 articles to each other and hub-style landing per universe ("Universe home" article with sections list and Próximamente blocks); ask Boris for character lists (cran, captain) for new pages.
5. 🟡 **No "all characters" browse on landing.** From landing only 3 featured characters are one click away; Le'Mug, Porcia, Cael, species need 3-4 clicks. Fix: add "Todos los personajes" link/tile (explorer pre-filtered) and extend FEATURED_CHARACTERS with a rotating strip using existing descriptions.
6. 🟡 **Sidebar nav gaps and misleading entries.** Cael Cortés, Especies, Organizaciones, Vehículos, Categorías de Monstruos, El Destello not in nav; group headers are `#` expanders only; "Libros" child truncated "El Destello de los Colos..." and points to the directory (`wiki-navigation.ts:38`); "Humanos" lists one person. Fix: make group titles link to their directory page, add missing entries, fix label/target.
7. 🟡 **Category taxonomy is confusing in the filter.** 12 values: singular vs plural (Coloso vs Colosos tile), mixed meaning (Categoría/Directorio/Historia/Entidad/Animal vs Coloso). Fan sees "Directorio" (7) and "Categoría" (3) as filters. Fix: split `kind` (Personaje/Especie/Organización/Vehículo/Lugar/Historia) from `size` (Coloso/Titán/Mediano); hide Directorio pages from the filter; align labels plural in UI.
8. 🟡 **Stub articles pollute discovery.** 8 `proximamente` articles appear in alphabetical empty-query lists (palette opens with "Animales…", "Aodos AY01"), in related, in universe-filtered lists, and in universe counts on landing tiles. Fix: sort stubs last in explorer/palette, show a "Próximamente" chip in the palette, exclude from "lore entries" counts or label them, collapse into a "En camino" shelf.
9. 🟡 **Naming drift.** slug `criyote` vs title "Criyonte" (and Arena/poll URLs), "The Bloop Ojo Solo" vs "The Bloop", "Fiscánula/Phiscanula", "Lapeon". Fix: add `aliases` and redirect/alias slug (keep old for links); normalise nav label; confirm spelling with Boris.
10. 🟢 **Engagement hooks thin on the article page.** 0 quotes, 2 galleries, 15 infoboxes, Arena only for 6 creatures; no "Versus this creature" or "creature of the week" link on pages; some stats creatures (Le'Mug, Criyonte) lack a cover so palette/week tile show placeholder. Fix: a "Enfrentar en Arena" CTA on `stats` pages; "Lee a continuación" sequence (prev/next within category); Boris to supply covers + canon quotes (`docs/Frases y descripciones.docx`).

## Evidence pointers
- Related logic: `src/features/monsters/lib/related.ts:41-69`; nav `src/features/monsters/config/wiki-navigation.ts`.
- Search: `src/features/monsters/actions/get-wiki-articles.ts:35-56,102-112`; `WikiCommandPalette.tsx:15-38`; `SearchBar.tsx:13-14`; `WikiEmptyState.tsx`.
- Landing links: `src/features/marketing/config/featured-characters.ts`, `sections/HomeMosaic.tsx`, `components/Footer.tsx:9-13`, `FlipCard.tsx:144`.
- Featured: `src/features/monsters/lib/featured.ts:17-18`; Arena pair `data/featured-matchup.ts`.
