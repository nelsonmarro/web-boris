# QA — Imágenes y "Próximamente" (ola 5)

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-17.

| Captura | Qué verifica |
|---|---|
| `maja-placeholder-desktop.webp` | `<WikiImage>` sin `src` ("Imagen pendiente") en *Conflicto con otras bestias* |
| `the-bloop-caracteristicas-desktop.webp` | The Bloop ya no usa el boceto de Vlad Julia; placas dorsales en su lugar |
| `hub-tarjetas-desktop.webp` | Chip "Próximamente" y placeholder por categoría en las tarjetas del explorador |
| `proximamente-articulo-desktop.webp` | Chip en la cabecera y bloque Próximamente (bloque tras el cuerpo) |
| `proximamente-articulo-mobile.webp` | 390 px: lo conocido primero, después el bloque Próximamente |
| `ficha-sin-portada-mobile.webp` | 390 px: ficha compacta con placeholder cuando no hay portada |

Resultados: 36/36 artículos responden 200; `/`, `/wiki`, `/wiki/arena` 200; consola sin errores ni avisos; todas las imágenes de `/wiki/the-bloop` y `/wiki/el-gran-maja` cargan (200, `naturalWidth > 0`); sin scroll horizontal a 390 px.
