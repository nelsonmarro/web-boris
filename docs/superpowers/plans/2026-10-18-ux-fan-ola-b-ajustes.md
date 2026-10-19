# UX fan · Ola B — ajustes tras el rediseño minimalista (#55)

La Ola B se diseñó antes del rediseño minimalista (PR #56, `c44a65f`). Este anexo **prevalece** sobre el plan `2026-10-18-ux-fan-ola-b.md` y la spec `2026-10-18-ux-fan-ola-b-design.md` donde se contradigan. Aplica la spec del rediseño `2026-10-18-rediseno-minimal-design.md`: §1 son reglas vinculantes y §7 resume qué se mantiene de la Ola B.

## Reglas visuales vinculantes (spec #55 §1)

- Tarjetas solo con `ContentCard`; secciones con `Section` (`src/components/content/`).
- Sin eyebrows por sección ni por tarjeta, e iconos solo funcionales.
- "Próximamente" se marca como texto naranja de 11 px en mayúsculas, sin píldora (`ProximamenteChip` no se usa en piezas nuevas).
- Superficie `crystal-surface` o `#061a2e` sólido, y foco con `focus-visible:outline-hidden` + `ring`.

## Estado

- **Tarea 1 (núcleo):** hecha en WIP (`ff2318c`, rebasada sobre `main`). Contiene `entity-index`, `search`, `discovery-order` movido al core, `aliases`/`related` en el esquema, los 5 apodos y `crossCheckEntities`. **Falta su revisión.** `src/core/search/` ya contenía `tipos.ts` y `catalog.ts` del rediseño, y conviven sin problema.

## Cambios por tarea

### Tarea 2 (enlaces, grafo, relacionados)

- Sin cambios de fondo.
- `WikiArticleContent.tsx` cambió en #55: ahora tiene `WikiArticleDisclosures` en móvil y no tiene caja de descripción. Añade `data-article-body` al contenedor que envuelve `<MdxRenderer …/>` y pásale `entityIndex` y `slug`.
- `getRelatedArticles` mantiene **`max = 4`** (no 6): el pie de #55 es una rejilla de 2×2 en móvil y de 3 columnas desde md, y la 4.ª tarjeta lleva `md:hidden`.
- El componente `a` de `MdxRenderer` sigue el §1: enlace blanco con subrayado `decoration-primary/50` y hover naranja.

### Tarea 3 (búsqueda)

- **Paleta global** (`SearchPalette`) en el layout raíz, que sustituye a `WikiCommandPalette` (se borra). Se abre con:
  - ⌘K / Ctrl+K;
  - la lupa o píldora de la cabecera de la wiki (`src/app/(wiki)/wiki/layout.tsx`), que hoy renderiza `WikiCommandPalette`;
  - **una lupa nueva en la navbar de la landing**: localiza el componente de navbar del layout `(marketing)` y añade `SearchTrigger` (`icon` en móvil, `pill` desde lg). No dupliques nada en la cabecera de la wiki;
  - **el buscador del hero de la landing** (`SearchBar` en `HeroBleed`), que pasa a ser disparador (`SearchTrigger variant="hero"`, mismo aspecto).
- **El buscador de `/wiki` ("Archivo") NO abre la paleta:** sigue filtrando el catálogo en directo. En `getWikiArticles`, cuando hay `search`, se ordena y filtra con `search()` del core (ranking, apodos, erratas) y **después** se aplica la lógica de #55: `catalogFilter` por universo, `counts` antes del `tipo` y luego `tipo`. Conserva intacta la forma de `counts` y de `GetWikiArticlesResult` de #55, y añade solo `suggestion?` y `popular?`.
- **Estado vacío del catálogo** (`WikiEmptyState` de #55: "Ningún registro coincide" + "Limpiar filtros"). Se añaden:
  - "¿Quisiste decir **X**?" (enlace que pone la búsqueda a X), si hay sugerencia;
  - "Populares": **lista de texto** de 6 enlaces a fichas, sin tarjetas.
- **Filas de la paleta:**
  - miniatura de 40 px (o `CategoryPlaceholder` con `variant="corner"`), título, "Categoría · Universo" y "también: \<apodo\>";
  - "Próximamente" como texto naranja de 11 px;
  - sin chips.
- **Vacío de la paleta:** "Sin coincidencias para «q»", "¿Quisiste decir X?" y 6 populares como filas.
- `getWikiIndex()` pasa a devolver las entradas del índice de entidades (con `aliases` y `richness`; sin `stats` ni `infobox`) y debe pesar < 30 KB.

### Tarea 4 (orientación)

- **El carrusel de relacionados se elimina del alcance:** el pie de #55 ya es compacto. No crees `RelatedCarousel` y no toques `WikiArticleCard`, que ya no existe.
- **`ArticleProgress`:** igual que en el plan; usa `[data-article-body]`.
- **`SectionChip`:**
  - **Cuándo es visible:** cuando no hay rail y la fila de desplegables de #55 (`WikiArticleDisclosures`, al que añades `data-article-disclosures`) ha salido de la ventana por arriba. Se oculta cuando entra `[data-related]` (añádelo a la `<section>` de `WikiArticleFooter` o a su contenedor). Solo con 3 o más `h2`.
  - **Al pulsarlo:** abre la hoja inferior (`vaul`) con el índice. Reutiliza `WikiTOC` con `variant="panel"`, si encaja, o una lista propia.
- **Archivos de la tarea:**
  - `ArticleProgress.tsx` y `SectionChip.tsx` (nuevos);
  - `WikiArticleDisclosures.tsx` (solo el atributo);
  - `WikiArticleFooter.tsx` (solo el atributo).
  - No toques `page.tsx` ni `WikiArticleContent.tsx`.

### Tarea 5 (visor)

Sin cambios: `WikiGallery.tsx` no cambió en #55.

### Tarea 6 (orquestador)

- Cablear en `page.tsx`: `ArticleImagesProvider`, `ArticleProgress` y `SectionChip`.
- QA de la spec B §13, salvo el punto 6 (carrusel), con estos cambios:
  - en el punto 4 la paleta se abre desde el hero de la landing, la lupa de la landing, la cabecera de la wiki y ⌘K, y el buscador de `/wiki` filtra con apodos y erratas;
  - Lighthouse 100 en las 4 páginas, en móvil y escritorio.
