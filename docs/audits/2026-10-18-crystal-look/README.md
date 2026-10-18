# QA — Rediseño "crystal look" (#11)

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-18. Capturas `antes-*` = `main` antes del rediseño; `despues-*` = rama `feat/crystal-look` tras la ronda final de correcciones.

| # | Caso | Resultado |
|---|---|---|
| 1 | El mosaico cabe en la primera pantalla. `/` acaba en 768 px a 1280 × 800 y en 868 px a 1440 × 900; `/wiki` en 794 y 876 (`despues-*-1280x800.webp`, `despues-*-1440.webp`) | ✅ |
| 2 | Categorías de la wiki: 6 columnas a 1280 y 1440 (container query según el espacio real junto al menú lateral), 3 a 1024; ninguna descripción canónica recortada | ✅ |
| 3 | 390 px: landing hero → criatura → encuesta → Arena → vídeo → universos; wiki archivo → criatura → categorías → Arena → encuesta; sin scroll horizontal (`despues-*-390.webp`, captura de página completa) | ✅ |
| 4 | 768 y 1024 px sin huecos ni recortes (`despues-landing-768.webp`, `despues-wiki-1024.webp`) | ✅ |
| 5 | Un solo `h1` por página en `/`, `/wiki`, `/comunidad`, `/wiki/the-bloop` y la Arena | ✅ |
| 6 | Contraste: el texto de las tiles con portada va sobre `#061a2e` al 94 %; "SIGLO XVIII" y "AÑOS 40" legibles sobre portadas claras | ✅ |
| 7 | Vídeo de YouTube sin bandas negras (miniatura 4:3 recortada) a 390, 768, 1280 y 1440 | ✅ |
| 8 | Chip "Próximamente" entero dentro de su tile: medido en la landing (La Hecatombe del Lapeón) a 390, 768 y 1280 px y en la wiki (Medianos) a 390, 1024 y 1280 px; a 1440 px comprobado en captura | ✅ |
| 9 | Teclado: foco en tile = anillo naranja 2 px + borde naranja + elevación + sombra (`foco-tile.webp`) | ✅ |
| 10 | Movimiento reducido: el CSS compilado incluye `motion-reduce:` sin elevación, zoom ni transiciones (la emulación de `prefers-reduced-motion` no está disponible en la herramienta; se verificó en el CSS) | ✅ |
| 11 | Lighthouse accesibilidad / buenas prácticas / SEO = 100 / 100 / 100 en `/`, `/wiki` y `/comunidad`, móvil y escritorio | ✅ |
| 12 | Artículo (`/wiki/the-bloop`) y Arena (`/wiki/arena?a=el-gran-maja&b=the-bloop`): sin imágenes rotas ni scroll horizontal | ✅ |

Pantallas bajas de escritorio (≤ 900 px de alto) usan la variante `short-screen` (`globals.css`): título de página un punto menor, tiles con `p-5` y menos margen superior en la landing.

Notas: en las capturas de página completa a 390 px, el fondo fijo deja una costura horizontal; es un artefacto de la captura, no del sitio. A 1024 px con el menú lateral, las columnas del mosaico de la wiki son estrechas (los eyebrows ocupan 2–3 líneas); está anotado como mejora pendiente.
