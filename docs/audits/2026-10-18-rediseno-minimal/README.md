# QA — Rediseño minimalista (#55)

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-18.
- **Capturas `antes-*`:** `main` con el crystal look, 4a8301e. La de la landing a 1440 se reutiliza de `docs/audits/2026-10-18-crystal-look/`, porque la captura nueva salió con un render parcial.
- **Capturas `despues-*`:** la rama `feat/rediseno-minimal`.

| # | Caso | Resultado |
|---|---|---|
| 1 | **Landing:** <ul><li>hero con la criatura de la semana de fondo; en escritorio se ve en el tercio derecho, con un velo horizontal bajo el texto;</li><li>fila de los 4 universos dentro de la primera pantalla (termina en y = 742 a 1440×900 y en y = 740 a 1280×800);</li><li>secciones en orden: Personajes destacados, Vídeos, franja de Comunidad y Sobre Boris + contacto.</li></ul> | ✅ |
| 2 | Landing a 390 px: **6 757 px** (antes 12 909, −48 %). Los universos empiezan en y = 476, dentro de la primera pantalla. Sin scroll horizontal | ✅ (el objetivo orientativo era < 6 500; los 3 retratos verticales son lo que más ocupa) |
| 3 | **Wiki:** <ul><li>"Archivo" con un solo buscador, pestañas Todo · 27 / Criaturas · 7 / Personajes · 3 / Especies · 6 / Organizaciones · 3 / Vehículos · 3 / Historia · 5 (Todo = suma) y catálogo de 12 tarjetas;</li><li>sin directorios ni páginas de categoría en el catálogo;</li><li>"phillip" → Phillip Forte;</li><li>`?tipo=criaturas&search=phillip` → estado vacío con "Limpiar filtros".</li></ul> | ✅ |
| 4 | **Ficha (El Gran Majá):** <ul><li>imagen arriba (en escritorio con un máximo de 380 px de alto), migas, `h1` y datos en línea "675 m · Extremo · No determinado";</li><li>Arena + Compartir + "⋯" (Historial, Imprimir);</li><li>entradilla sin caja;</li><li>en el móvil, "Ficha completa" y "Contenido" en una sola fila: solo uno abierto a la vez, 44 px, 7 enlaces de índice.</li></ul> A 1440×900, toda la cabecera, entradilla incluida, cabe en la primera pantalla | ✅ |
| 5 | **Comunidad:** una columna con la encuesta como protagonista (sin base de datos local: "Votación no disponible ahora"), la criatura de la semana en una fila, el último vídeo y las novedades en lista | ✅ |
| 6 | **Sin ruido:** `IconChip`, `Mosaic`, `CrystalTile`, `BubbleTrail` y las tiles de consola se borraron (25 archivos y −1 656 líneas). Un solo `h1` por página. Los únicos eyebrows que quedan en la landing son las etiquetas del formulario | ✅ |
| 7 | **Lighthouse:** accesibilidad, buenas prácticas y SEO a 100/100/100 en `/`, `/wiki`, `/wiki/el-gran-maja` y `/comunidad`, en móvil y escritorio | ✅ |

**Ajustes hechos durante la QA:**
- **Velo del hero:** horizontal en escritorio para que se vea la criatura, vertical en el móvil. El contraste del texto es ≥ 4.5:1.
- **Cover de la ficha:** como máximo 380 px de alto en escritorio.
- **Catálogo:** excluye también las páginas de categoría, para que "Todo" sea igual a la suma de las pestañas.
- **`FactsLine`:** etiqueta a `white/60`, porque con `white/45` quedaba en 4.48:1.

**Después de la revisión final** (`643c7a0..9a4e0a7`):
- **Hero a 1024 px con la criatura de la semana siguiente (El Gran Majá, boceto blanco):** se forzó la imagen en el DOM y todo el texto se lee (`despues-landing-1024-maja.webp`). El velo pasa a depender del breakpoint: 0.92 hasta el 82 % en `lg` y hasta el 60 % desde `xl`.
- **Pestañas:** siguen al filtro activo. `?universe=Ellos Llegaron` muestra Todo · 2 = Personajes · 1 + Historia · 1, sobre 2 tarjetas; las pestañas a 0 aparecen atenuadas.
- **Impresión:** la cabecera de la ficha (título, entradilla y portada) se imprime; solo se ocultan las migas y las acciones.
- **Lighthouse:** 100/100/100 de nuevo en `/` y `/wiki` (escritorio) y en El Gran Majá y `/comunidad` (móvil).
