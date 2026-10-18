# QA — Imágenes y "Próximamente" (ola 5)

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-17.

| Captura | Qué verifica |
|---|---|
| `maja-placeholder-desktop.png` | `<WikiImage>` sin `src` ("Imagen pendiente") en *Conflicto con otras bestias* |
| `the-bloop-caracteristicas-desktop.png` | The Bloop ya no usa el boceto de Vlad Julia; placas dorsales en su lugar |
| `hub-tarjetas-desktop.png` | Chip "Próximamente" y placeholder por categoría en las tarjetas del explorador |
| `proximamente-articulo-desktop.png` | Chip en la cabecera y bloque Próximamente (versión previa: bloque antes del cuerpo) |
| `proximamente-articulo-mobile.png` | 390 px: lo conocido primero, después el bloque Próximamente |
| `ficha-sin-portada-mobile.png` | 390 px: ficha compacta con placeholder cuando no hay portada |

Resultados: 36/36 artículos responden 200; `/`, `/wiki`, `/wiki/arena` 200; consola sin errores ni avisos; todas las imágenes de `/wiki/the-bloop` y `/wiki/el-gran-maja` cargan (200, `naturalWidth > 0`); sin scroll horizontal a 390 px.
