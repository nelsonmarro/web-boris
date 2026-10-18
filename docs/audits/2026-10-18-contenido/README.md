# QA — Contenido "con lo que hay" (ola 6)

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-18.

| Captura | Qué verifica |
|---|---|
| `sobre-boris-desktop.webp` / `sobre-boris-mobile.webp` | "Sobre Boris" solo con hechos: universos desde `config/universes.ts`, biografía "Próximamente", logo como marca (sin recorte) |
| `universos-hecatombe-desktop.webp` | Tarjeta de La Hecatombe del Lapeón: sin arte, "Próximamente", enlaza a la wiki filtrada |
| `hecatombe-articulo-mobile.webp` | Artículo nuevo con sinopsis canónica, chip Próximamente y breadcrumb que parte por elementos |

Resultados: 37/37 artículos 200; `/wiki?universe=La+Hecatombe+del+Lapeón#explorar` muestra solo el artículo nuevo con el filtro aplicado; consola sin errores; sin scroll horizontal a 390 px.
