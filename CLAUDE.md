# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Proyecto

Landing page + Wiki oficial de los universos narrativos del YouTuber **BorisaoBlois** (Universo Colosos, Capitán de Galeón, Ellos Llegaron). Todo el contenido de la wiki está en **español**. La estética es "Abyssal Submarine / Liquid Glass": fondo azul profundo, acentos naranja bioluminiscente, glassmorphism.

## Comandos

```bash
make dev          # levanta Postgres (docker compose) + next dev
npm run dev       # solo el dev server
npm run build     # OBLIGATORIO tras cambios: valida MDX + tipos TS
make start        # build + next start en :3131 (para demos; el dev server bloquea orígenes externos)
make share        # build + next start + túnel público con cloudflared (mostrar el sitio sin hosting)
npm run lint      # ESLint
npm test          # tests unitarios (node:test) de la lógica pura
npm run check:content  # valida MDX, navegación, assets, novedades y encuestas
make db-up        # solo la base de datos
make db-shell     # psql (user: root, db: webboris)
npx prisma generate / migrate dev / studio
```

Validación: `npm run lint`, `npm test` (node:test sobre `tests/**/*.test.ts`), `npm run check:content` y `npm run build` (parsea todos los MDX y chequea tipos). El CI ejecuta los cuatro.

## Stack

Next.js 16 (App Router) + React 19 · Tailwind CSS v4 (`@import 'tailwindcss'`) + shadcn/ui · Prisma v7 con driver adapter `@prisma/adapter-pg` (PostgreSQL) · Auth.js v5 (middleware en `src/proxy.ts`, convención Next 16) · TanStack Query v5 + Zustand v5 · Zod v4 · MDX vía `next-mdx-remote-client/rsc` + `gray-matter`.

Consulta la documentación oficial (context7 MCP o `node_modules/next/dist/docs/`) antes de implementar features con Next.js 16, Prisma v7 o Zod v4 — sus APIs difieren de versiones anteriores.

## Arquitectura

Dos grupos de rutas en `src/app/`: `(marketing)` (landing) y `(wiki)` (la wiki, con parallel route `@sidebar` en `/wiki`).

### Pipeline de contenido de la wiki (lo más importante)

El contenido NO está en la base de datos: son archivos MDX planos.

1. `src/content/*.mdx` — un archivo por artículo; el nombre del archivo es el slug de la URL (`/wiki/<slug>`).
2. `src/utils/mdx.ts` — `getArticleBySlug` / `getAllArticles` leen el archivo, parsean frontmatter con `gray-matter` y lo validan con `WikiFrontmatterSchema` (Zod) de `src/core/types/wiki.ts`. Si el frontmatter no pasa el schema, el artículo devuelve `null` (404 silencioso) — revisar la consola del server.
3. `src/app/(wiki)/wiki/[slug]/page.tsx` — renderiza vía `WikiArticleHeader` / `WikiArticleContent` / `WikiArticleFooter` (en `src/features/monsters/components/wiki/article/`).
4. `MdxRenderer.tsx` (`src/features/monsters/components/wiki/mdx/`) — registro de componentes disponibles dentro de los MDX: `WikiImage`, `WikiGallery`, `WikiQuote`, `WikiInfobox`, `InfoField`, `WikiTOC`, `AbyssalAlert`, `AbyssalTable`, `RegistroDelirium`, `Proximamente`. Un componente usado en un MDX pero no registrado ahí (y en `src/mdx-components.tsx`) rompe el render.

**La navegación del sidebar es manual**: `src/features/monsters/config/wiki-navigation.ts`. Al crear un artículo nuevo hay que añadir su entrada ahí; al añadir una entrada, debe existir el `.mdx` correspondiente o el link da 404. El orden de `WIKI_NAVIGATION` define también Anterior/Siguiente (`ArticleNeighbors`: hermanos dentro del grupo padre inmediato, con vuelta al principio; en un grupo de 2 solo hay «Siguiente»).

**Artículo de referencia**: `src/content/the-bloop.mdx` es el estándar de oro — frontmatter completo (infobox con secciones, description, imageCaption), secciones `##` (Características / Alimentación / Personalidad / Referencias), `WikiImage` con `align` alternado. Los artículos nuevos deben seguir ese formato.

**Solo canon, nada inventado**: el texto, los pies de foto y las citas (`WikiQuote`) deben salir de `docs/Frases y descripciones.docx` o `docs/Requerimientos Pagina.pdf`. Si un apartado no tiene información, va `<Proximamente />`; si el artículo entero no la tiene, `status: proximamente` en el frontmatter: chip y, en lugar del bloque Próximamente, `ExpedienteSellado` (sello, «Boris aún no ha desclasificado este expediente.» y los enlaces «Pide que se desclasifique» —solo en la semana de su votación—, «Sigue el canal» y «Ver el registro»). Una ficha no sellada con ≥ 2 apartados `##` (sin contar Referencias), alguno de ellos solo con `<Proximamente />`, muestra `ArchivoMeter` («N de T apartados desclasificados»). Una imagen solo se usa si muestra lo que dice el apartado; si no hay imagen concreta, `<WikiImage alt="…" caption="…" />` sin `src` (marcador "Imagen pendiente") o portada omitida (placeholder por categoría). Nunca el logo ni el esquema del sitio como portada.

**Contenido del hub `/comunidad`**: `src/content/novedades/<fecha>-<slug>.md` (frontmatter `fecha`, `titulo`, `resumen` ≤ 160, `enlace` interno o https; sin cuerpo) y `src/content/encuestas.json` (votaciones curadas `{ semana: "YYYY-Www", tipo?, a, b, pregunta? }`; las semanas sin votación curada rotan solas con duelos). `tipo` es `duelo` (por defecto; a y b con `stats`) o `desclasificar`: en las semanas futuras, a y b deben tener `status: proximamente`; ese tipo de votación no lleva Arena, y la ficha sellada muestra «Pide que se desclasifique» esa semana. El id de la encuesta es `<semana>-<a>-vs-<b>`: renombrar un slug cambia el id de sus encuestas y sus votos. Se leen siempre vía `getContentRepository()` (`src/core/content/`), el punto de cambio para un futuro CMS. `check:content` valida ambos.

**Vídeos de «Aparece en»**: `src/content/videos.json`, `[{ id (11 caracteres), fichas: [slug…], titulo? }]`, son las relaciones manuales vídeo ↔ ficha. Las menciones en el título del vídeo se detectan solas (`linkVideos` con las reglas de `findMentions`). Un id que no está en `FEATURED_VIDEOS` (`src/features/marketing/config/videos.ts`) necesita `titulo`. Se lee con `getContentRepository().getVideoLinks()` y lo valida `check:content`.

Frontmatter (ver `WikiFrontmatterSchema`): `title` y `universe` obligatorios; opcionales `image`, `imageCaption`, `category`, `description`, `infobox` (récord de secciones → pares clave/valor) y `stats` (length, weight, intelligence 1-10, hostility 1-10, power/defense 0-100, biteType, specialAbilities).

Otros campos opcionales del frontmatter: `aliases` (apodos canónicos con los que la búsqueda y los enlaces automáticos reconocen la ficha; **solo con fuente canónica**, ver la spec de la Ola B §6, y las variantes sin confirmar no entran) y `related` (slugs de relacionados, con el orden fijado a mano; mandan sobre el ranking automático). `check:content` rechaza un apodo duplicado, un apodo igual al título de otra ficha, un apodo vacío y un `related` inexistente, repetido o que apunte a la propia ficha.

### Otras piezas

- `src/features/` — módulos por dominio (`monsters` es el de la wiki; también `marketing`, `auth`, `payments`, `community` (hub /comunidad)).
- `src/features/monsters/actions/get-wiki-articles.ts` — server action de listado con búsqueda/filtros/paginación (filtra en memoria sobre los MDX).
- `src/core/` — server actions globales, config de Auth.js, tipos.
- `src/core/search/` — lógica pura (imports relativos `.ts`, probada con node:test): `tipos` (agrupación de categorías: una categoría nueva del frontmatter debe añadirse a `TIPOS`, lo exige `tipos.test.ts`) y `catalog` (el catálogo excluye las páginas `Directorio`/`Categoría`). La `image` del frontmatter se muestra como imagen de cabecera de la ficha salvo que el cuerpo MDX ya la use o la ficha sea un índice (`Directorio`/`Categoría`). Además:
  - `entity-index`: índice de entidades (título, apodos, categoría, `richness`…) y `findMentions`. La regla del nombre propio: un nombre de una sola palabra solo cuenta si en el texto empieza en mayúscula; los de varias palabras valen siempre. Solo se enlazan las categorías de `LINKABLE_CATEGORIES`. Las contracciones «del» / «al» cuentan con los nombres que empiezan por «El» si la palabra siguiente va en mayúscula: «del [Ángel]», «al [Gran Majá]».
  - `search`: la búsqueda única de la paleta (⌘K) y del explorador (`getWikiArticles`): palabras en cualquier orden (tokens), apodos y erratas (distancia de edición 1 desde 5 letras); `suggest` da el «¿Quisiste decir…?». `MAX_QUERY_LENGTH` acota la consulta.
  - `mention-graph` + `related-rank`: el grafo «quién menciona a quién» y el orden de los relacionados de la ficha (`related` a mano → menciones → hermanos del menú → categoría → universo; las Próximamente al final). Los construyen `getEntityIndex()` / `getMentionGraph()` (`src/core/content/entities.ts`, en caché por petición).
  - `extract-body-text`: saca la prosa de un MDX (sin código, etiquetas JSX ni imágenes) y sus enlaces manuales `/wiki/…` para el grafo de menciones.
  - `registro` (`registroEntries` / `registroSlugs` / `progress`): cuentan las fichas que no son índice ni `proximamente`, y es el mismo conjunto que usa el aleatorio.
  - `section-completeness`: apartados `##` con contenido frente a los que solo llevan `<Proximamente />` (alimenta `ArchivoMeter`).
  - `nav-neighbors` (+ `groupLabel`): fichas vecinas en el menú para Anterior/Siguiente.
  - `random-pick`: el sorteo del expediente aleatorio (con la ficha de origen excluida).
  - `video-links`: relaciona vídeos y fichas (`linkVideos`).
  - **Regla:** una categoría nueva del frontmatter debe añadirse a `TIPOS` **y** decidirse en `LINKABLE_CATEGORIES` (si tiene nombre propio y se enlaza, o no).
- `src/utils/remark-entity-links.ts` — plugin remark que `MdxRenderer` aplica al MDX: enlaza la 1.ª mención en prosa de cada entidad en toda la ficha. No entra en títulos, enlaces, código ni en `WikiImage`/`WikiGallery`/`WikiTOC`/`Proximamente`/`WikiInfobox`/`InfoField`, ni en `<a>`, `<code>`, `<pre>` o `h1`-`h6` escritos como JSX. Un enlace manual a la misma ficha gana: no se añade otro.
- `src/components/search/` — la paleta de búsqueda: `SearchPaletteHost` (montado una vez en el layout raíz; atiende ⌘K / Ctrl+K y carga `SearchPalette` con `next/dynamic` en la primera apertura; si ese chunk no llega, cierra y avisa con «Recargar» en lugar de romper la página; no se abre encima de otro modal), `SearchTrigger` (los disparadores del layout de la wiki, la navbar y el hero de la landing; precargan la paleta al pasar el ratón o el foco) y `useSearchPalette` (estado Zustand).
- Visor de imágenes de la ficha — `ArticleImagesProvider` / `ViewerLink` en `src/features/monsters/components/wiki/mdx/ArticleImages.tsx`: reúne las imágenes del cuerpo (`data-viewer-src`) y abre `ImageViewer`; empuja una entrada al historial para que «atrás» lo cierre.
- Estado del fan — `useRegistro` (`src/features/monsters/store/registro-store.ts`), en `localStorage` con la clave `wb-registro`, solo en el cliente. Se pinta con `useSeen` / `useIsSeen`, que muestran el estado neutro hasta hidratar; nunca se lee en el servidor. Lo escribe `MarkSeen` en la ficha, y solo en las no selladas.
- Rutas propias de la wiki — `/wiki/registro`: página con ISR de 1 h. `/wiki/aleatorio`: route handler `force-dynamic` que responde 307 con `no-store`; nunca lleva a índices ni a sellados, ni a la ficha de origen, y todo `<Link>` a esta ruta lleva `prefetch={false}`. `arena`, `registro` y `aleatorio` son nombres reservados (`RESERVED_SLUGS`, `src/core/search/wiki-routes.ts`): ningún MDX puede usarlos, lo comprueba `check:content`. En ese mismo archivo vive `WIKI_LINK`, la forma de una URL interna de ficha (`/wiki/<slug>` con `/`, `?` o `#` detrás): la comparten el plugin de enlaces y el grafo de menciones.
- Ficha `[slug]/page.tsx` — `revalidate = 3600`, por la encuesta semanal y el RSS. Orden de montaje: `ArticleProgress`, `MarkSeen`, cabecera, contenido (`ArchivoMeter` / cuerpo / `ExpedienteSellado`), `SectionChip`, `EntityPreview` y un bloque de cierre `data-related` (`ApareceEn`, `ArticleNeighbors`, pie); ese `data-related` es donde se oculta `SectionChip`. `EntityPreview` previsualiza los `a[data-entity]` y comparte la consulta `['wiki-index']` con la paleta. «Aparece en» sale de `getVideosForSlug` (`src/features/community/data/channel-videos.ts`); `youtube-rss.ts` es el fetch compartido del feed y recuerda un fallo 60 s (`memoizeFailure`).
- Renombrar un slug — `git mv` + `redirects()` en `next.config.ts` + `LEGACY_SLUGS` en `ArenaSimulator` + actualizar encuestas, vídeos, navegación y enlaces de los MDX.
- `src/components/content/` — primitivas del rediseño minimalista (#55): `ContentCard`, `Section`, `FactsLine` y `PendingLabel` (el rótulo de texto «Próximamente»). La portada de una tarjeta o ficha sale de `coverOf(image)` (`CategoryPlaceholder.tsx`), que descarta las imágenes de marca. Para vídeos y fechas: `youtubeWatchUrl` / `youtubeThumbUrl` (`src/utils/youtube.ts`) y `formatFecha` (`src/utils/format-date.ts`).
- `src/lib/prisma.ts` — cliente Prisma (instanciar siempre con el driver adapter).
- Base de datos y migraciones: migraciones en `prisma/migrations` (la primera, `hub_comunidad`, crea también las tablas de Auth.js). Producción: `npx prisma migrate deploy` sobre una base vacía; una base local creada antes con `db push` necesita `npx prisma migrate reset` (borra datos). `VOTE_SECRET` (≥ 32 caracteres) habilita la votación de /comunidad; `DB_PORT` cambia el puerto publicado por docker compose. `YOUTUBE_FEED_URL` (opcional) sustituye al RSS del canal.
- Material fuente del lore en `docs/` (`Frases y descripciones.docx`, `Requerimientos Pagina.pdf`, `HANDOVER.md`, `CLAUDE_HANDOVER.md`).

## Estándares de diseño ("ley Abisal")

- Paleta: primario `#FF7300` (naranja), fondo `#00122E`, gradientes `#00203F`→`#00162D`, cian `#0064A0`, texto blanco/70%.
- Tarjetas: `ContentCard`; secciones: `Section`; datos: `FactsLine` (`src/components/content/`). Una sección = un propósito (h2 + contenido + como mucho "Ver todo"); sin eyebrows por tarjeta ni por sección; iconos solo funcionales. Superficie `crystal-surface`; `.glass-liquid` solo en navbar, footer y botón secundario; superficie sólida `#061a2e` bajo texto largo.
- Headers MDX (`h2`/`h3`) deben mantener `clear-both` (evita solaparse con `WikiImage` flotados).
- Las imágenes llenan su contenedor edge-to-edge, sin padding interno.
- Assets físicos en `public/assets/` usan guiones bajos, nunca espacios (`The_Bloop`, `El_Gran_Maja`, …), organizados por entidad del lore.
