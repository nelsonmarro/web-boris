# Editor del texto por apartados y vista previa en vivo (ola 2 de la auditoría del panel)

Auditoría: `docs/audits/2026-11-13-panel-boris/README.md`, puntos #4 y #10.

## Problema

El texto de la ficha se edita como MDX en bruto: Boris ve etiquetas (`<WikiImage src=… />`), `## ` y una caja
monoespaciada con su propio scroll. Nada indica en qué apartado está el cursor: en la prueba, un párrafo nuevo acabó
debajo de «Referencias». La vista previa exige guardar antes y se abre en otra pestaña.

## Diseño

### Modelo de bloques (`src/features/admin/lib/body-blocks.ts`, puro y probado)

- El MDX se analiza con `unified` + `remark-parse` + `remark-mdx`, los mismos que usa la web. Cada nodo de primer nivel
  conserva su **texto original** (`raw`, cortado por las posiciones del árbol) y el espacio que lo precede (`gap`).
- Documento: `leading` (lo que va antes del primer bloque), `intro` (bloques antes del primer `##`), `sections`
  (`{ title, blocks }`, uno por cada `##`) y `trailing`.
- Tipos de bloque:
  - `text`: párrafos, listas y demás Markdown consecutivo, fundidos en un solo bloque.
  - `subheading`: `###`.
  - `image`: `WikiImage`, con o sin `src`. Sin `src` es «Imagen pendiente».
  - `gallery`: `WikiGallery`, con solo `WikiImage` dentro.
  - `quote`: `WikiQuote`.
  - `alert`: `AbyssalAlert`.
  - `proximamente`.
  - `raw`: cualquier otra cosa, o un atributo que no sea literal. Se edita como código («Bloque especial»).
- **Ida y vuelta exacta**: un bloque sin tocar se escribe con su `raw`. Al editarlo, `raw` pasa a `null` y el bloque
  se genera desde sus campos. Un bloque nuevo o movido usa una línea en blanco como separación. El test exige que
  `serialize(parse(x)) === x` para todas las fichas de `src/content`.
- Atributos: se conservan todos en su orden. Los valores van entre comillas dobles; si llevan `"`, entre simples; si
  llevan ambas, la `"` pasa a `”`. Los saltos de línea pasan a espacios.
- Si el MDX no se puede analizar, el editor se queda en «Texto completo» y avisa.
- `blockAtLine(doc, line)` traduce la línea de un error de publicación al bloque que la contiene.

### Editor (`SectionsEditor`, cliente)

- Dos vistas: **Por apartados** (por defecto) y **Texto completo (avanzado)**, que es el `BodyEditor` de antes. Al
  volver a «Por apartados» se analiza de nuevo el texto.
- Un índice de apartados lleva a cada tarjeta. La «Introducción» recoge lo que va antes del primer apartado. Cada
  apartado es una tarjeta con:
  - su título;
  - subir y bajar;
  - «Marcar como Próximamente», que sustituye su contenido;
  - «Quitar apartado», con Deshacer.
  - Al final de la tarjeta, «Añadir»: Texto, Subapartado, Imagen, Galería, Cita, Aviso y Próximamente.
- Cada bloque lleva su nombre, subir y bajar (al pasar del primero o del último salta al apartado vecino) y quitar
  (con Deshacer).
  - **Texto**: caja que crece sola, con letra normal y botones Negrita, Cursiva y Enlace a ficha.
  - **Imagen**: miniatura, descripción, pie y posición (derecha, izquierda, centrada o a todo el ancho), más elegir o
    cambiar la imagen y «Dejar pendiente».
  - **Galería**: sus imágenes, con el mismo control para cada una.
  - **Cita**: texto, quién lo dice y fuente.
  - **Aviso**: tipo, título y texto.
- «Nuevo apartado» se añade antes de «Referencias» si existe.
- Los errores de publicar que dicen su línea llevan al bloque que la contiene, en las dos vistas (evento
  `panel:ir-al-texto`).

### Vista previa en vivo (#10)

- Acción `stashPreview(slug, datos)`: comprueba la sesión y valida con `parseArticleData`. Guarda los datos sin
  guardar en memoria del servidor (`globalThis`, por usuario y ficha, 30 min, como mucho 50). No toca el borrador.
- La ruta `/admin/vista-previa/[slug]` queda fuera del grupo `(panel)`, así que no lleva la cabecera del panel. Con
  `?vivo=1` pinta lo guardado en memoria; si no hay nada, el borrador o lo publicado. `?embed=1` quita la barra
  «Volver al editor». La ruta antigua `/admin/fichas/[slug]/vista-previa` redirige a la nueva.
- En el editor:
  - **Vista previa** está siempre disponible: guarda en memoria y abre una pestaña nueva.
  - En pantallas de 1280 px o más, **Vista previa al lado** parte la página en dos (`data-split`; el `main` del panel
    se ensancha con `has-[[data-split]]`). Un `iframe` fijo se recarga a los 800 ms del último cambio y conserva la
    posición del scroll.

## Fuera de alcance

- Un editor de texto enriquecido (WYSIWYG): el texto sigue con `**`, `_` y `[]()`, ayudado por los botones y la vista
  previa.
- Arrastrar y soltar.
