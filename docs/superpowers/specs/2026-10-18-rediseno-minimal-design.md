# Rediseño minimalista — diseño (#55)

**Problema:** el estilo de consola (crystal look, #11 / PR #48) pone demasiadas tarjetas a la vez y tiene mucho ruido visual. Hay 9 tiles y 5 secciones en la landing, 10 tiles antes del catálogo en la wiki y 4 tiles decoradas en /comunidad, y cada tarjeta lleva eyebrow, icono, chips, contador y CTA.
**Objetivo:** mostrar lo esencial y llevar al fan, en el menor número de pasos posible, a su **criatura, personaje o universo**.
**Rama:** `feat/rediseno-minimal`, desde `main` (`4a8301e`).
**Decisiones del usuario:**
- portada con marca, buscador, universos y criatura de la semana;
- en la landing se quedan, cada una en su sección, personajes destacados, vídeos, comunidad y "Sobre Boris + contacto";
- wiki con buscador, accesos y catálogo;
- /comunidad en una columna por importancia;
- tarjeta sobria (C);
- hero con la criatura de fondo (C);
- accesos de la wiki como pestañas que filtran (A);
- ficha con la imagen arriba y los datos en línea (A);
- se implementa primero el rediseño, en una rama por páginas.

## Restricciones globales

- **Solo canon:** no se escribe lore nuevo. Los textos de interfaz sí. Los textos de personajes salen de `FEATURED_CHARACTERS` (PDF de Boris), sin parafrasear.
- **Sin dependencias nuevas.**
- **Accesibilidad:** Lighthouse 100 en accesibilidad, buenas prácticas y SEO en `/`, `/wiki`, una ficha y `/comunidad` (móvil y escritorio); un solo `h1` por página; texto ≥ 11 px; objetivos táctiles ≥ 44 px; foco visible (`focus-visible:outline-hidden` + `ring`); `motion-reduce:`.
- **Next 16:** `as Route` en los hrefs con query o con plantillas; `next/image` con `fetchPriority="high"` + `loading="eager"` en la imagen LCP (nunca `priority`).
- **Validación:** `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run check:content` y `npm run build`.

## 1. Reglas visuales (sustituyen al "modo consola")

1. **Una sección, un propósito.** Una sección tiene un `h2` (`section-title`), su contenido y, como mucho, un enlace "Ver todo ›".
   - No hay eyebrows de sección ni de tarjeta.
   - Por página, como mucho un eyebrow sobre el `h1`.
2. **Una sola tarjeta: `ContentCard`** (§2).
   - Superficie `crystal-surface`, con la imagen 16:9 a sangre arriba, el título display y una o dos líneas de texto.
   - Toda la tarjeta es el enlace.
   - Sin chips, sin "Ver detalles" y sin icono decorativo. La única marca de estado es "Próximamente": texto naranja de 11 px, en mayúsculas, sin píldora.
   - Hover y foco: `border-primary/40`; el foco añade `ring-2 ring-primary`. Sin elevación ni zoom.
3. **Iconos solo funcionales:** buscar, menú, cerrar, flechas, Arena, compartir y más. `IconChip` y los iconos decorativos desaparecen.
4. **Naranja con intención:** un CTA primario por pantalla, enlaces y hovers, e indicadores (amenaza, estado activo, "Próximamente").
5. **Más aire, menos fondos.** Las secciones de la landing usan `py-16 md:py-24` dentro de `container mx-auto px-6`.
   - Se quitan los resplandores difuminados decorativos de las secciones (`blur-[150px]` y similares), `BubbleTrail` (estela que sigue al cursor) y los `IconChip`.
   - La esencia abisal queda en el fondo `#00122E` con su degradado, en las imágenes canónicas y en la tipografía.
6. **Se mantiene:**
   - la tipografía: Unbounded en el `h1`, Barlow Condensed en `h2`/`h3` e Inter en el texto;
   - `.glass-liquid` solo en la navbar, el footer y el botón secundario;
   - superficie sólida `#061a2e` bajo el texto largo;
   - `crystal-surface` como superficie de tarjeta.

## 2. Componentes

| Componente | Ubicación | Contrato |
|---|---|---|
| `ContentCard` | `src/components/content/ContentCard.tsx` | Props: `href`, `external?`, `title`, `meta?`, `description?`, `lines?: 1 \| 2 \| 3` (por defecto 2), `image?`, `imagePosition?`, `category?` (placeholder), `aspect?: 'video' \| 'portrait'` (16:9 por defecto; 4:5 para retratos), `pending?`, `headingLevel?: 2 \| 3` (por defecto 3), `sizes?`, `eager?` (LCP) |
| `Section` | `src/components/content/Section.tsx` | Props: `id?`, `title`, `action?: { href; label }`, `className?` y `children`. Renderiza `<section aria-labelledby>` con `h2.section-title` y el enlace "Ver todo" alineado a la derecha |
| `FactsLine` | `src/components/content/FactsLine.tsx` | Props: `items: { label: string; value: string; tone?: ThreatTone }[]` (`'green' \| 'amber' \| 'red'`, de `lib/stats.ts`). Un `<dl>` en línea; la etiqueta va en 11 px uppercase `text-white/45` y el valor en blanco (o en el color del tono) |
| `tipos` | `src/core/search/tipos.ts` (puro) | `TIPOS`: lista ordenada `{ id, label, categories }`; `tipoOf(category)` → id o `null` |

**`ContentCard`, detalle:**
- **Sin imagen o con imagen de marca:** `CategoryPlaceholder` en su variante `corner`, ya existente.
- **Con `pending`:**
  - la imagen va en `grayscale` + `opacity-70`;
  - bajo el título aparece "Próximamente";
  - el nombre accesible añade "(próximamente)".
- **Con `external`:**
  - `target="_blank"` y `rel="noopener noreferrer"`;
  - el texto oculto "(se abre en YouTube)" solo si el `href` es de YouTube; si no, "(se abre en una pestaña nueva)".

**Grupos de `tipos.ts`:**

| `id` | Etiqueta | Categorías |
|---|---|---|
| `criaturas` | Criaturas | Coloso, Titán, Animal |
| `personajes` | Personajes | Humano, Entidad |
| `especies` | Especies | Especie |
| `organizaciones` | Organizaciones | Organización |
| `vehiculos` | Vehículos | Vehículo |
| `historia` | Historia | Historia, Libro |

`Directorio` y `Categoría` no pertenecen a ningún grupo.

**Se retiran** cuando quedan sin consumidores, lo que se verifica con `grep`:
- del sistema cristal: `Mosaic`, `CrystalTile` e `IconChip`;
- de la landing: `HomeMosaic`, `UniversePreviewSection`, `FlipCard`, `UniverseTile` y las tarjetas actuales de personajes y vídeos;
- de la wiki: `WikiHomeMosaic`, `CategoryTile` y `WikiArticleCard`;
- las tiles teaser: `ArenaTile`, `PollTeaserTile`, `LatestVideoTeaserTile`, `CreatureOfWeekTile` y `LatestVideoTile`; también `NewsTile` si /comunidad deja de usarla;
- `BubbleTrail`, que se desmonta de los layouts.

**Se reaprovechan:**
- la lógica: `pickFeatured`, `getWeeklyPoll`, `getLatestVideo`, `getFeaturedMatchup`, `getLoreStats`, `compareDiscovery` y `hasStats`/`getThreatLevel`;
- `PollTile` (§6);
- `CategoryPlaceholder`;
- `crystal-surface`.

## 3. Landing (`/`)

Orden del DOM igual al orden visual.

1. **`HeroBleed`** (`src/features/marketing/sections/HeroBleed.tsx`):
   - **Fondo:** la imagen de `pickFeatured(articles)` ocupa todo el fondo del hero (`object-cover` con su `imagePosition`, `eager`) y tiene un degradado hacia `#00122E` que garantiza ≥ 4.5:1 detrás de todo el texto. Si la criatura no tiene portada, el fondo es el degradado abisal sin imagen.
   - **Contenido:**
     - el `h1` "Explora la inmensidad **de mis universos**" (la segunda parte en naranja, en cursiva);
     - una línea: "Todo el lore oficial de BorisaoBlois en un solo archivo.";
     - el buscador grande: el `SearchBar` actual, sin glass y con superficie `#061a2e`;
     - la píldora "Criatura de la semana: \<Nombre\> ›", que enlaza a su ficha.
   - **Pie de la primera pantalla:** la fila de los 4 universos como `ContentCard`, con `meta` = época (`universe.era`). Enlazan al catálogo filtrado (`/wiki?universe=…#catalogo`). La Hecatombe va con `pending` y sin enlace mientras no tenga `universeKey`; en ese caso se renderiza como `<div>`, no como enlace.
   - **Encaje:** la fila es de 4 columnas desde md y de 2×2 en el móvil. La primera pantalla cabe en 1440×900 y 1280×800 (con la fila de universos visible entera). En el móvil, el hero mide ≤ 100svh hasta el buscador y los universos van justo después.
2. **"Personajes destacados"** (`Section`, `id="personajes"`): 3 `ContentCard` con `aspect="portrait"` y `lines={3}`, en el orden y con el texto de `FEATURED_CHARACTERS`. En el móvil, una columna; desde md, tres.
3. **"Vídeos"** (`Section`, `id="videos"`, acción "Ver canal ›" → YouTube): 4 tarjetas, el último del RSS (`getLatestVideo`) y los 3 de `FEATURED_VIDEOS`, sin duplicados por id.
   - Miniatura `mqdefault`, 16:9 sin bandas.
   - `meta` = la categoría del vídeo; para el último, "Último vídeo".
   - Enlazan a YouTube como `external`.
   - En el móvil, 2×2; desde lg, 4 columnas.
   - Los Shorts conservan la miniatura 16:9; no se embebe nada.
4. **Comunidad:** una franja `crystal-surface` de una línea, sin tarjetas.
   - Contenido: "Duelo de la semana: \<A\> vs \<B\>", con el enlace "Votar ›" → `/comunidad`, y a la derecha "Abrir la Arena ›" → `/wiki/arena`.
   - Sin encuesta, el texto es "Versus Arena: enfrenta a los colosos" con un solo enlace.
5. **"Sobre Boris"** (`id="contacto"` en el bloque del formulario):
   - una sección a dos columnas desde lg: a la izquierda, el contenido factual actual de `AboutBorisSection` (sin el resplandor ni el logo enorme; el logo pasa a 64 px junto al título); a la derecha, el formulario de `ContactSection`;
   - en el móvil, apiladas;
   - los anclajes `#contacto` y `#universos` del menú siguen funcionando: `#universos` apunta a la fila de universos del hero.
6. **Footer:** sin cambios.

**Altura orientativa a 390 px:** < 6 500 px (hoy, 12 909).

## 4. Portada de la wiki (`/wiki`)

- **Cabecera:** `h1` "Archivo", sin eyebrow, y la línea "Criaturas, personajes, organizaciones e historia de los universos de BorisaoBlois." Debajo va un **único buscador grande**: el campo del catálogo, que se mueve arriba y filtra en directo, como hoy, con 400 ms de espera. No hay hero aparte.
- **Pestañas** (`role="tablist"`, sin estado de pestaña ARIA: son enlaces que cambian la URL; usar `aria-current="page"` en la activa):
  - "Todo · N" y luego cada grupo de `TIPOS` con contenido, cada uno con su número. Los números cuentan las fichas que no son directorio, incluidas las Próximamente.
  - Viven en la URL (`?tipo=<id>`); "Todo" quita el parámetro.
  - En el móvil, la fila se desplaza en horizontal sin barra visible.
- **Junto a las pestañas,** el desplegable de universo (`?universe=`), que ya existe. El desplegable de categoría desaparece.
- **Catálogo** (`id="catalogo"`, que sustituye a `#explorar`; `#explorar` se mantiene como alias en el mismo elemento):
  - rejilla de `ContentCard` (`meta` = "Categoría · Universo", `description` en 2 líneas): 1 columna < sm, 2 desde sm y 3 desde lg;
  - orden de descubrimiento (Ola A);
  - los artículos con `category: 'Directorio'` se excluyen del catálogo;
  - paginación de 12 por página, con el componente de paginación actual.
- **Estado vacío:** "Ningún registro coincide" + "Limpiar filtros" (44 px).
- **Server action** (`getWikiArticles`):
  - acepta `tipo` en lugar de `category`;
  - excluye siempre los directorios;
  - `getFilterOptions()` devuelve `{ universes, tipos: { id, label, count }[] }`.
- **Se elimina:** el mosaico (criatura, Arena, encuesta y categorías).

## 5. Ficha (`/wiki/<slug>`)

1. **Cabecera** (`WikiArticleHeader`), de arriba abajo:
   - **Imagen a sangre:** solo si hay `image` que no es de marca. `aspect-[16/10]` en el móvil y `md:aspect-[21/9]` dentro del contenedor del artículo, con `object-cover` + `imagePosition`, `eager`, `rounded-2xl` y `alt` = título. Sin portada no hay imagen.
   - **Migas:** "Universo · Categoría" en 11 px, como enlaces del breadcrumb actual.
   - **`h1`.**
   - **`FactsLine`:** solo si `hasStats`, con hasta 3 datos en este orden:
     - Longitud (`stats.length` m);
     - Amenaza (`getThreatLevel(stats.hostility)`: su `label` con su `tone`);
     - Peso (`stats.weight`).
   - **Acciones:**
     - "Arena", el botón primario de la Ola A, solo con stats;
     - "Compartir", el actual;
     - un botón "⋯" (`aria-label="Más acciones"`) que despliega "Historial" e "Imprimir".
   - **Entradilla:** la `description` como párrafo `text-lg text-white/85`, sin la caja con borde naranja.
2. **Debajo de la cabecera** (`WikiArticleContent`):
   - **Sin rail (contenedor < `@5xl/article`):** una sola fila con dos desplegables, "Ficha completa ▾" (la infobox completa) y "Contenido ▾" (el índice). Sustituye a la ficha compacta y al índice inline como dos bloques separados.
   - **Con rail:** se quedan la infobox y el índice fijo, pero la infobox ya no muestra su imagen (está arriba) ni decoración extra (resplandores, iconos de sección).
   - Se elimina el "retrato arriba" de la Ola A dentro del cuerpo, porque la imagen de la cabecera ya lo cubre. La regla "no repetir si la imagen ya está en el cuerpo" se aplica a la imagen de cabecera: si la portada aparece en el MDX, la cabecera no la muestra.
3. **Cuerpo y Próximamente:** sin cambios.
4. **Relacionados** (`WikiArticleFooter`): `Section` "Archivos relacionados" con `ContentCard` (2 columnas en el móvil, 3 desde md), sin eyebrow "Navegación cruzada".
5. **Ficha sellada** (`status: proximamente`): la cabecera es igual (sin `FactsLine`) y sigue el bloque Próximamente actual.

## 6. Comunidad (`/comunidad`)

- **Una columna** (`max-w-3xl mx-auto`): `h1` "Comunidad" sin eyebrow y la línea de presentación actual.
- **1. Encuesta de la semana:** el `PollTile` actual, aligerado:
  - sin eyebrow ni `IconChip`;
  - el título "¿Quién gana?" (o la pregunta curada) como `h2`;
  - las dos imágenes, los botones de voto, los resultados y el enlace "Ver el duelo en la Arena" se mantienen;
  - se conservan todos los estados: cargando, sin votación, votado, límite y error.
- **2. "Criatura de la semana":** `h2` y una fila con miniatura de 64 px, el nombre, "Categoría · Universo" y "Ver ficha ›".
- **3. "Último vídeo":** `h2` y una `ContentCard` con `external`.
- **4. "Novedades":** `h2` y una lista `<ul>` con fecha (`time`), título enlazado y una línea de resumen. Sin tarjetas.

## 7. Relación con las olas B y C

- **Ola B (#50)** se retoma después de fusionar #55, sobre la nueva base. El núcleo WIP `75f15f5` (índice de entidades, búsqueda, apodos) se reutiliza sin cambios. Se mantienen:
  - los enlaces automáticos;
  - el grafo de relacionados;
  - la paleta global, a la que el buscador de la landing y el de la wiki pasan a abrir;
  - la barra de progreso y el chip de apartado;
  - el visor.
  El carrusel de relacionados usará `ContentCard`.
- **Ola C (#51)** se recorta:
  - **fuera:** hero móvil con imagen, tira de personajes, carrusel de universos y ocultar "Personajes destacados";
  - **ya absorbidos aquí:** filtro por tipo y taxonomía;
  - **siguen:** slug de Criyonte con redirección, siguiente/anterior, expediente aleatorio, vista previa, expediente sellado + medidor, página Registro y "Aparece en" (una fila de miniaturas en la ficha).
- Los specs de B y C se actualizan en su rama cuando se retomen.

## 8. Pruebas

- **`tests/search/tipos.test.ts`:** cada categoría usada en `src/content` pertenece como mucho a un grupo; `Directorio` y `Categoría` → `null`; los ids son únicos; el orden coincide con §2.
- **`tests/search/catalog.test.ts`:** función pura `catalogFilter(entries, { tipo?, universe? })` que excluye los directorios y filtra por tipo y universo. Se extrae de `getWikiArticles` a `src/core/search/catalog.ts` para poder probarla.
- Los tests existentes (52) siguen en verde.

## 9. QA (orquestador, Chrome DevTools, a 390 y 1440)

1. **Landing:**
   - hero con la criatura de fondo y contraste del texto ≥ 4.5:1 (comprobado con Lighthouse);
   - los universos visibles en la primera pantalla a 1440×900 y 1280×800;
   - secciones en orden: personajes, vídeos, comunidad, Sobre Boris + contacto;
   - altura a 390 < 6 500 px;
   - `#universos` y `#contacto` funcionan.
2. **Wiki:**
   - pestañas con su número;
   - `?tipo=criaturas` filtra, el número coincide con las tarjetas y la URL se puede compartir;
   - buscar "phillip" deja a Phillip Forte primero;
   - sin directorios en el catálogo;
   - el estado vacío con "Limpiar filtros".
3. **Ficha:**
   - El Gran Majá: imagen arriba, `FactsLine` (675 m · Extremo · No determinado), Arena, Compartir y "⋯";
   - Phillip Forte: imagen arriba sin `FactsLine`;
   - Cael Cortés: sellada;
   - en el móvil, la fila "Ficha completa ▾ · Contenido ▾".
4. **Comunidad:** una columna en el orden de §6; el voto funciona contra Postgres local (`make db-up`) o, sin base de datos, se ve el estado "Votación no disponible".
5. **Sin ruido:** `grep` sin usos de `IconChip`, `Mosaic` ni `BubbleTrail` en `src/app` y `src/features`; ni un eyebrow por sección en las 4 páginas.
6. **Lighthouse y consola:** 100/100/100 en `/`, `/wiki`, `/wiki/el-gran-maja` y `/comunidad`, en móvil y escritorio; consola limpia.
7. **Capturas** antes y después en `docs/audits/2026-10-18-rediseno-minimal/` (WebP + README).

## 10. Documentación

`CLAUDE.md`, "Estándares de diseño": la línea de superficies pasa a decir "Tarjetas: `ContentCard`; secciones: `Section`; datos: `FactsLine` (`src/components/content/`); superficie `crystal-surface`; `.glass-liquid` solo en navbar, footer y botón secundario; reglas de §1 (una sección = un propósito, sin eyebrows por tarjeta, iconos solo funcionales)". En "Otras piezas", `src/components/crystal/` se sustituye por `src/components/content/`.

## 11. Entrega

1. Un plan en `docs/superpowers/plans/2026-10-18-rediseno-minimal.md`, con las tareas en este orden:
   1. base (§2, §10);
   2. landing (§3), wiki (§4), ficha (§5) y comunidad (§6), en paralelo, con archivos disjuntos;
   3. limpieza de huérfanos;
   4. QA.
2. PR "Closes #55", CI, squash merge y borrar la rama.
