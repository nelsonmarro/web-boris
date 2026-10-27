# Fichas con el mismo diseño — diseño

Fecha: 2026-10-27. Pedido por Nelson: «hay entradas de la wiki que no tienen el mismo diseño final que las más completas (The Bloop, El Gran Majá) … debemos ser coherentes y tener el mismo layout estándar para todas; las Próximamente serán algo diferentes en su contenido».

## Causa

`WikiArticleContent` solo pinta el rail (ficha + índice) si la ficha tiene `infobox` o `stats`, y el índice solo si hay apartados `##`. Una docena de fichas (Phillip Forte, Bogbo, DELIRIUM, IPCARO, El Ángel, Porcia la Gris, Navíos, Breegard, Capitán de Galeón, Cronología WWII…) no tiene ni lo uno ni lo otro y cae a una columna estrecha.

## Diseño

### 1. Marco común (código)

- Toda ficha que no sea índice (`isIndexCategory`) pinta siempre el rail. La ficha lateral empieza con una sección automática **«Expediente»**: `Universo` (frontmatter `universe`), `Categoría` (`category`, si hay) y, en las selladas (`status: proximamente`), `Estado: Sellado`. Luego, las secciones del `infobox` y `InfoStats`, como ahora. Nada de esto se inventa: sale del frontmatter.
- Los índices (`Directorio`/`Categoría`) no cambian.

### 2. Estándar de contenido (fichas no índice y no selladas)

- Frontmatter: `description`; si hay `image`, también `imageCaption` (describe lo que se ve, como el `alt`/pie que ya exista); `infobox` con al menos una sección propia de datos canónicos (además de la automática).
- Cuerpo: un párrafo de entrada y **al menos dos apartados `##`** según la plantilla de su tipo; un apartado sin información canónica lleva solo `<Proximamente />` (y así se enciende `ArchivoMeter`). `## Referencias` solo si el canon da una fuente concreta.
- Plantillas (títulos de los apartados; se mantienen además los apartados propios que ya tenga la ficha):
  - Coloso, Titán, Animal, Especie: Características · Comportamiento · Alimentación.
  - Humano: Biografía · Trayectoria · Relaciones.
  - Organización: Origen · Financiación y recursos · Miembros.
  - Vehículo: Características · Registro operativo.
  - Historia, Entidad: Sinopsis · Acontecimientos.
- **Solo canon:** el texto se reparte tal cual (mismas frases, reordenadas bajo su apartado); los datos de la ficha lateral salen del propio texto de la ficha o de `docs/Frases y descripciones.docx` / `docs/Requerimientos Pagina.pdf`. Nada inventado.
- Las imágenes del cuerpo alternan `align` como en `the-bloop.mdx`.

### 3. Selladas

Siguen con su `ExpedienteSellado` y su texto breve; ganan el mismo marco (rail con «Expediente» y `Estado: Sellado`). No se les exigen apartados.

### 4. Validación

`check:content` añade la regla: una ficha no índice y no sellada debe tener `description`, `imageCaption` si tiene `image`, `infobox` con al menos una sección y al menos dos apartados `##` (sin contar Referencias). QA visual: todas las fichas a 1280 y 390 px, rail presente, sin desbordes, axe 0.
