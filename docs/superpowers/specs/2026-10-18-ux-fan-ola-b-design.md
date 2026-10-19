# UX fan · Ola B (descubrimiento) — diseño

> **Actualización 2026-10-18 (tras #55):** el rediseño minimalista (PR #56) cambió la base. Prevalece el anexo `docs/superpowers/plans/2026-10-18-ux-fan-ola-b-ajustes.md`. Puntos clave: sin carrusel de relacionados (máximo 4); el buscador de `/wiki` sigue filtrando el catálogo con el nuevo motor y no abre la paleta; el chip de apartado se ancla a la fila de desplegables de la ficha; reglas visuales de #55 §1.

**Issue:** #50 (épica #52). **Auditoría:** `docs/audits/2026-10-18-experiencia-fan/README.md`, hallazgos #2, #3, #4, #11 y #12.
**Objetivo:** que ningún clic del fan termine en un callejón sin salida. Debe poder saltar de un nombre a su ficha, encontrar a su personaje como lo escriba y moverse por un artículo largo y por sus imágenes sin perderse ni salir del sitio.
**Rama:** `feat/ux-fan-ola-b`. La Ola C (#51) tendrá su propio spec después de esta.

## Restricciones globales

- **Solo canon:** no se escribe lore nuevo. Los apodos (`aliases`) solo entran con una fuente canónica citada en §6. Las etiquetas de interfaz sí se pueden escribir.
- **Sin dependencias nuevas:** `vaul` (hoja inferior), `zustand`, Base UI (`Dialog`) y TanStack Query ya están instalados.
- **Contrato visual ("ley Abisal"):**
  - superficies sólidas `#061a2e` bajo el texto;
  - `.glass-liquid` solo en navbar, footer y botón secundario;
  - naranja `#FF7300` solo para indicadores y estado activo;
  - texto ≥ 11 px y objetivos táctiles ≥ 44 px;
  - foco visible; en Tailwind v4, `outline-hidden` en lugar de `outline-none`;
  - `motion-reduce:` sin animaciones.
- **Next 16:**
  - `typedRoutes`: hay que hacer cast `as Route` en los hrefs con query o con plantillas;
  - `next/image` usa `fetchPriority`/`loading`, porque `priority` está obsoleto.
- **Lógica pura en `src/core/search/`:** sin imports de ejecución con alias `@/` (como mucho `import type`), para que `node:test` la ejecute con strip-types. Los tests importan por ruta relativa, como en `tests/community/*.test.ts`.
- **Validación:** `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run check:content` y `npm run build`.

## 1. Arquitectura

Hay un único **índice de entidades**. Lo construye el repositorio de contenido una vez y lo cachea. Lo consumen tres piezas: los enlaces automáticos, el grafo de menciones (relacionados) y la búsqueda. Así, la regla de qué cuenta como mención de una entidad es la misma en los tres sitios.

```
src/content/*.mdx ──► getAllArticles() ──► buildEntityIndex() ─┬─► remark-entity-links (MDX)
                                                               ├─► getMentionGraph() ─► rankRelated()
                                                               └─► getWikiIndex() ─► search() (paleta + explorador)
```

| Unidad | Ubicación | Responsabilidad |
|---|---|---|
| `entity-index.ts` | `src/core/search/` (puro) | Tipos y `normalize()`, `buildEntityIndex()` y `findMentions()` |
| `search.ts` | `src/core/search/` (puro) | `search()` y `suggest()` |
| `related-rank.ts` | `src/core/search/` (puro) | `rankRelated()` |
| `remark-entity-links.ts` | `src/utils/` | Plugin remark que enlaza la 1.ª mención en prosa |
| `getEntityIndex()` / `getMentionGraph()` | `src/core/content/` (en caché) | Construyen el índice y el grafo desde los artículos |
| `SearchPalette` + `useSearchPalette` | `src/components/search/` | Paleta global (Zustand) y disparadores |
| `ArticleProgress`, `SectionChip` | `src/features/monsters/components/wiki/article/` | Barra de progreso y chip de apartado con hoja inferior |
| `RelatedCarousel` | idem | Carrusel en móvil y rejilla en escritorio |
| `ImageViewer` + `ArticleImagesProvider` | `src/features/monsters/components/wiki/mdx/` | Visor de imágenes de la ficha |

## 2. Datos

- `WikiFrontmatterSchema` (`src/core/types/wiki.ts`) gana dos campos opcionales:
  - `aliases?: string[]`, con cadenas no vacías;
  - `related?: string[]`, con slugs.
- `aliases` se rellena con la tabla de §6. Fuera de esa tabla no se añade ningún apodo.
- `related` no se rellena de entrada; solo se usará si la QA encuentra un relacionado sin sentido.
- `check:content` (`scripts/check-content.mts` y `src/core/content/validate.ts`) añade tres comprobaciones:
  1. un apodo normalizado no puede apuntar a dos fichas distintas;
  2. un apodo no puede coincidir con el título normalizado de otra ficha;
  3. cada slug de `related` debe existir y no puede ser la propia ficha.

## 3. Índice de entidades y menciones (`entity-index.ts`)

- **`normalize(s)`:**
  - NFD sin diacríticos y en minúsculas;
  - apóstrofos eliminados: `le'mug` pasa a `lemug`;
  - guiones y signos de puntuación pasan a espacio;
  - espacios colapsados y recortados.
- **`buildEntityIndex(articles)`:** devuelve entradas con estos campos:
  - `slug`, `title`, `aliases`, `category`, `universe`, `status`, `image`, `description`;
  - `richness`, calculada con `richness()` de `src/features/monsters/lib/discovery-order.ts`; se mueve a `src/core/search/` y se reexporta desde la ubicación antigua;
  - `linkable`.
- **`linkable`:** es verdadero si `category` es uno de `Coloso`, `Titán`, `Animal`, `Especie`, `Humano`, `Organización`, `Vehículo`, `Entidad` o `Libro`. Los directorios, las categorías (`Categoría`) y las historias (`Historia`) no son enlazables.
- **`findMentions(text, index, { self })`:** devuelve `{ slug, start, end, name }[]` sin solapamientos, en orden de aparición.
  - Recorre los nombres de las entidades enlazables: título y apodos.
  - Prueba primero el nombre más largo: "El Gran Majá" gana a "Majá".
  - Exige límite de palabra en los dos extremos sobre el texto normalizado, con un mapeo de índices de vuelta al texto original.
  - **Regla del nombre propio:** si el nombre es de una sola palabra, la coincidencia en el texto original debe empezar en mayúscula. Los nombres de varias palabras valen en cualquier caso.
  - Nunca devuelve `self`.

## 4. Búsqueda (`search.ts`)

- **`search(query, index, { limit })`** devuelve `{ entry, score, matchedAlias? }[]`.
  - **Tokens:** se calculan con `normalize()`. Se descartan las palabras vacías `el la los las de del y the`, salvo que la consulta no tenga otra cosa.
  - **Coincidencia:** cada token debe coincidir con alguna palabra del título, de un apodo, de la descripción, de la categoría o del universo, de una de estas formas:
    - la palabra empieza por el token (vale para cualquier longitud);
    - si el token tiene 5 o más letras, la palabra está a distancia de Levenshtein ≤ 1 (errata).
  - **Puntuación base:**

    | Caso | Puntos |
    |---|---|
    | El título normalizado es igual a la consulta | 100 |
    | El título empieza por la consulta | 80 |
    | Todos los tokens están en el título | 60 |
    | Un apodo es igual a la consulta o empieza por ella | 50 |
    | Todos los tokens están entre el título y los apodos | 40 |
    | Cualquier otro caso con coincidencia | 10 |

  - Cada token que entró por errata resta 5 puntos.
  - **Desempate:** primero `richness` descendente y luego el título (`localeCompare` en español).
  - Los `status: proximamente` van detrás de los demás con la misma puntuación base, salvo que la puntuación sea 100.
  - `matchedAlias` es el apodo que dio la coincidencia, solo si el título no coincidía.
- **`suggest(query, index)`:** devuelve el título más cercano a distancia ≤ 2 de la consulta normalizada completa, o `null`. Es el "¿Quisiste decir…?".
- **Consulta vacía:** devuelve las fichas ordenadas por `richness`. La paleta muestra 8 bajo el rótulo "Populares".
- **Explorador:** `getWikiArticles` sustituye su filtro por `search()` cuando hay `search`. Sin búsqueda conserva el orden de descubrimiento de la Ola A. Los filtros de universo y categoría se aplican después.

## 5. Enlaces automáticos (`remark-entity-links.ts`)

- Es un plugin remark que recibe `{ index, self }`. Se registra en `MdxRenderer` (`options.mdxOptions.remarkPlugins`) junto a `rehypeHeadingIds`. El índice lo pasa `WikiArticleContent`, que lo recibe de la página (`getEntityIndex()`).
- **Recorre** nodos `text` dentro de:
  - `paragraph`, `listItem`, `blockquote`, `tableCell`;
  - `strong` y `emphasis`;
  - elementos JSX de prosa (`RegistroDelirium`, `AbyssalAlert`, `WikiQuote`).
- **No entra en** `heading`, `link`, `linkReference`, `code`, `inlineCode`, ni en los elementos JSX `WikiImage`, `WikiGallery`, `WikiTOC`, `Proximamente`, `WikiInfobox` e `InfoField`. Los atributos JSX, como los pies de foto, no son nodos de texto, así que nunca se tocan.
- **Enlaza** solo la primera mención de cada entidad en toda la ficha (`findMentions`). Divide el nodo `text` en `text` + `link` + `text`; si el nodo estaba dentro de un `strong`, el enlace queda dentro de la negrita.
- **Destino:** `/wiki/<slug>`. Hoy `MdxRenderer` no define un componente `a` y los enlaces heredan el estilo por defecto de `@tailwindcss/typography`. Se añade el componente `a`:
  - **enlaces internos** (`/…`): `next/link`, en blanco con subrayado `decoration-primary/50` y `underline-offset-4`, `hover:decoration-primary` y `hover:text-primary`, y foco visible;
  - **enlaces externos:** se renderizan como hoy, con `target="_blank"` y `rel="noopener noreferrer"`.
- **Si el destino es `status: proximamente`:** el enlace lleva la clase `entity-link-pending` (subrayado discontinuo) y un `<span class="sr-only"> (próximamente)</span>`.
- **Tests:** se escriben sobre árboles mdast construidos a mano, sin parser.

## 6. Apodos canónicos (únicos permitidos)

| Ficha | `aliases` | Fuente |
|---|---|---|
| `el-gran-maja` | Cranioplanus, anguila sonriente, anguila cráneo plano | `el-gran-maja.mdx` infobox "Otros nombres"; docx (l. 75): «se le llama simplemente "Cranioplanus", "anguila sonriente" o "anguila cráneo plano"» |
| `slowdown-criyote` | La Mancha Estrellada | `slowdown-criyote.mdx` infobox "Alias"; docx (l. 90, 168): «conocido también como La Mancha Estrellada» |
| `vlad-julia` | el pez cangrejo | `vlad-julia.mdx` infobox "Alias"; docx (l. 102): «Se le conoce también como "el pez cangrejo"» |
| `le-mug` | Señora de la Prole | `le-mug.mdx` infobox "Alias"; docx (l. 238): «llamada también "Señora de la Prole"» |
| `phiscanula-arcticum` | Fiscánula ártica | `phiscanula-arcticum.mdx` infobox "Nombre común"; docx (l. 90): «Fiscánula ártica» |

- Las variantes sin confirmar, como "The Bloop" (nombre corto) o "Criyote", **no** entran. Quedan pendientes de Boris (#41).
- "Cranioplanus" es un nombre de una sola palabra: solo se enlaza si aparece en mayúscula.

## 7. Grafo de menciones y relacionados

- **`getMentionGraph()`** (en `src/core/content/`, en caché) devuelve `{ out: Map<slug, Set<slug>>, in: Map<slug, Set<slug>> }`.
  - Aplica `findMentions` sobre el texto del cuerpo de cada MDX. El texto se obtiene con `extractBodyText()`:
    - quita los bloques de código;
    - quita las etiquetas JSX con sus atributos, pero conserva el texto de sus hijos;
    - quita el marcado de enlace `[texto](url)`, pero conserva el texto;
    - los títulos se conservan: una mención en un `##` cuenta como relación aunque no se enlace.
  - Los enlaces `/wiki/<slug>` que ya están escritos a mano también cuentan como arista.
- **`rankRelated({ slug, curated, out, in, siblings, sameCategory, sameUniverse, isDirectory, isStub, max = 6 })`** es pura.
  - Orden de los candidatos:
    1. `curated`;
    2. mutuas (presentes en `out` y en `in`);
    3. solo en `out`;
    4. solo en `in`;
    5. hermanos del menú;
    6. misma categoría;
    7. mismo universo.
  - Sin duplicados, sin directorios y sin la propia ficha. Los Próximamente van al final y el corte a `max` se hace después.
- **`getRelatedArticles`** (`src/features/monsters/lib/related.ts`) pasa a componer `rankRelated` con los datos reales. Mantiene su firma pública y devuelve hasta 6 resultados.

## 8. Paleta de búsqueda global

- **`SearchPalette`:**
  - Está en `src/components/search/` y se monta una vez en los layouts `(marketing)` y `(wiki)`. Sustituye a `WikiCommandPalette`, que se elimina; sus importadores pasan a la nueva.
  - Su estado vive en `useSearchPalette` (Zustand): `open`, `openPalette(initialQuery?)` y `close`.
  - Usa `search()` sobre `getWikiIndex()` (TanStack Query, `['wiki-index']`). El índice incluye ahora `aliases` y `richness`, y **ya no envía `stats` ni `infobox`**: con `richness` precalculada basta. El peso de la respuesta debe quedar por debajo de 30 KB.
  - **Disposición:** en móvil (< md) es un diálogo a pantalla completa con el campo arriba; en escritorio queda centrada, `max-w-xl`, como la paleta actual.
  - **Cada fila de resultado:**
    - miniatura de 40 px (o el placeholder por categoría);
    - título;
    - "Universo · Categoría";
    - "también: \<apodo\>" si `matchedAlias`;
    - `ProximamenteChip size="compact"` si procede.
  - **Navegación:** teclado ↑ ↓ Enter, ratón y táctil. La última fila, "Ver todos en el explorador →", lleva a `/wiki?search=<q>#explorar`.
  - **Sin resultados:** "Sin coincidencias para «q»", el "¿Quisiste decir X?" de `suggest()` (clicable) y 6 populares.
- **Disparadores:**
  - ⌘K / Ctrl+K en todo el sitio, con un listener en la paleta;
  - la píldora "Buscar ⌘K" (escritorio) y la lupa (móvil) en la cabecera de la wiki y en la navbar de la landing;
  - `SearchBar` de los heros (landing y portada de la wiki): se convierte en `<button type="button">` con el mismo aspecto de campo, que abre la paleta con el foco en el input. Se elimina su `id="hero-search"` fijo.
- **Explorador:** su campo de filtro se queda y usa el mismo `search()` por el server action. El estado vacío muestra "¿Quisiste decir…?", 6 populares y un botón "Limpiar filtros".

## 9. Orientación en artículos largos

- **`ArticleProgress`:** barra de 2 px en `bg-primary`, fija bajo la cabecera de la wiki (`top-16`) y en todos los anchos. Su ancho es el porcentaje recorrido del cuerpo del artículo, desde el inicio del contenido hasta el final de la última sección. Es `aria-hidden`.
- **`SectionChip`:**
  - **Cuándo se muestra:**
    - solo con el contenedor del artículo por debajo de `@5xl/article`, es decir, sin rail lateral;
    - solo si hay 3 o más `h2`;
    - después de que el índice inline salga de la pantalla;
    - se oculta al entrar "Archivos relacionados".
  - **Aspecto y contenido:** fijo abajo al centro, con `bottom: calc(1rem + env(safe-area-inset-bottom))`. Superficie `#061a2e`, borde `white/15`, sombra profunda y 44 px de alto. Texto: "☰ \<apartado actual\> · n/N".
  - **Al tocarlo:** abre una hoja inferior (`vaul` `Drawer`) con el índice completo y el apartado actual resaltado. Elegir uno hace scroll a esa sección y cierra la hoja.
  - **Implementación:** reutiliza `useActiveHeading` (`src/features/monsters/hooks/useActiveHeading.ts`) y `extractHeadings()`.
  - **Movimiento reducido:** el salto no tiene `behavior: 'smooth'`.

## 10. Carrusel de relacionados

- **`RelatedCarousel`:** sustituye a la rejilla de `WikiArticleFooter` y muestra hasta 6 fichas.
  - **Por debajo de md:** `<ul>` horizontal con `overflow-x-auto`, `snap-x snap-mandatory`, `scroll-px-4` y `gap-3`. Cada `<li>` mide `w-[75%]` con `snap-start`, para que la siguiente tarjeta asome.
  - **Desde md:** rejilla de 3 columnas.
  - **Tarjetas:** `WikiArticleCard` con una variante nueva `compact`:
    - imagen 16:9 o placeholder por categoría;
    - eyebrow con el universo;
    - título;
    - chip de categoría;
    - `ProximamenteChip`;
    - sin descripción ni "Ver detalles".
- El rótulo "Archivos relacionados" se mantiene.

## 11. Visor de imágenes

- **`ArticleImagesProvider`** (cliente) envuelve el cuerpo de la ficha en `WikiArticleContent`. `WikiImage` (con `src`) y cada imagen de `WikiGallery` se registran en orden de aparición con `{ src, alt, caption }`, a través de un hook, y reciben su índice.
- **Clic o toque en una imagen:** con JavaScript, `preventDefault` y se abre `ImageViewer` en ese índice. Sin JavaScript, el `<a href={src} target="_blank">` actual sigue funcionando como respaldo.
- **`ImageViewer`:**
  - **Contenedor:** Base UI `Dialog` a pantalla completa, fondo `#00122E` al 95 %, con título accesible "Imagen n de N" y `aria-modal`.
  - **Pista de imágenes:** horizontal, con `snap-x snap-mandatory` y una diapositiva por imagen (`w-full`). La imagen es `next/image` `object-contain` con `sizes="100vw"`; debajo van el pie de foto y el contador "n / N".
  - **Controles:**
    - botón cerrar de 44 px, arriba a la derecha;
    - botones anterior y siguiente desde md;
    - teclas ← → y Esc;
    - deslizar en táctil, que es scroll nativo.
  - **Historial:** abrir hace `history.pushState({ viewer: true }, '')` y `popstate` cierra. Cerrar con el botón o con Esc hace `history.back()` solo si la entrada fue suya.
  - **Foco:** al cerrar vuelve a la imagen de origen.
  - **Enlace al original:** "Abrir original" (enlace `text-[11px]`) al archivo, para la resolución completa.
  - **Zoom:** no hay zoom propio; se respeta el pellizco nativo del navegador.
  - **Movimiento reducido:** sin transiciones.

## 12. Pruebas

Se ejecutan con `node:test` en `tests/search/`.

- **`entity-index.test.ts`:**
  - `normalize`: tildes, apóstrofo, guiones;
  - el nombre más largo gana;
  - límites de palabra ("Bogbos" no coincide con "Bogbo");
  - regla del nombre propio ("majá" en minúscula no coincide con un nombre de una palabra; "anguila sonriente" en minúscula sí);
  - `self` excluido;
  - los no enlazables no se devuelven.
- **`search.test.ts`:**
  - "bloop solo" → the-bloop;
  - "philip" → phillip-forte, por errata;
  - "cangrejo" → vlad-julia, con `matchedAlias`;
  - "galeon" → capitan-de-galeon;
  - "la" sola no descarta todo;
  - el título exacto sale primero;
  - los Próximamente van detrás de su grupo;
  - `suggest("bloup")` → The Bloop Ojo Solo;
  - consulta vacía → orden por `richness`.
- **`remark-entity-links.test.ts`:**
  - solo la 1.ª mención;
  - nada dentro de `heading` ni de `link`;
  - `strong` con el enlace dentro;
  - `WikiImage` ignorado;
  - destino Próximamente marcado.
- **`related-rank.test.ts`:**
  - orden mutuas → salientes → entrantes → menú → categoría → universo;
  - `curated` primero;
  - directorios fuera;
  - Próximamente al final, sin perder el límite.
- **`extract-body-text.test.ts`:** JSX con atributos fuera e hijos conservados; enlace markdown reducido a su texto; código fuera.
- **`validate.test.ts`:** las tres comprobaciones nuevas de `check:content`.

## 13. QA (orquestador, Chrome DevTools sobre `next start -p 3131`, a 390 y 1440)

1. **El Gran Majá:** el cuerpo enlaza The Bloop Ojo Solo, IPCARO, DELIRIUM y Phillip Forte, cada uno una sola vez. No hay enlaces en los títulos ni en los pies de foto.
2. **Phillip Forte:**
   - el cuerpo enlaza DELIRIUM, IPCARO y El Gran Majá;
   - los relacionados empiezan por DELIRIUM y El Gran Majá;
   - Cael Cortés aparece, si aparece, al final.
3. **Le'Mug:** aparece en los relacionados de al menos otra ficha.
4. **Búsqueda:**
   - la tabla de casos de §12 se reproduce en la paleta;
   - "zzz" muestra el estado vacío con sugerencias;
   - la paleta se abre desde el hero de la landing, el hero de la wiki, la cabecera y ⌘K;
   - en móvil, a pantalla completa;
   - "Ver todos" lleva al explorador filtrado.
5. **Chip:** aparece y desaparece donde debe a 390; la hoja inferior salta al apartado; la barra de progreso avanza.
6. **Carrusel:** desliza con snap a 390 y es una rejilla de 3 a 1440.
7. **Visor:** se abre al tocar, desliza, responde a ← → y Esc, "atrás" lo cierra y el foco vuelve a la imagen.
8. **Lighthouse y consola:** accesibilidad 100 en `/`, `/wiki` y `/wiki/el-gran-maja`, en móvil y escritorio; consola sin errores.
9. **Peso:** la respuesta de `getWikiIndex` pesa menos de 30 KB.
10. **Evidencia:** capturas en `docs/audits/2026-10-18-experiencia-fan/ola-b/`.

## 14. Fuera de alcance (Ola C o posterior)

- vista previa al pasar el ratón;
- taxonomía tipo/tamaño y redirección de slugs (`slowdown-criyote`);
- mapa vídeo → ficha;
- registro de expedientes vistos;
- expediente aleatorio y "Siguiente en…";
- rediseño de la primera pantalla móvil de la landing;
- Próximamente como intriga.

## 15. Entrega

1. Un plan en `docs/superpowers/plans/2026-10-18-ux-fan-ola-b.md`. Primero va la tarea núcleo (§2–§4, §6); después las demás tareas, en paralelo cuando los archivos no se toquen:
   - enlaces y grafo (§5, §7);
   - paleta (§8);
   - orientación y carrusel (§9, §10);
   - visor (§11).
2. Revisión por tarea y QA del orquestador (§13).
3. PR "Closes #50", CI, squash merge y borrar la rama.
