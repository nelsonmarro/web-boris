# QA — Ola A (#49)

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-18.

| Hallazgo | Comprobación | Resultado |
|---|---|---|
| #1 Menú móvil | Panel a 390 px: fondo `rgb(6, 26, 46)` (antes transparente); título accesible "Menú de la wiki" (`01-menu-movil.webp`) | ✅ |
| #17 Un solo logo | 1440 px: con el menú expandido, 0 logos en la cabecera; con el menú colapsado, 1 | ✅ |
| #6 Retrato | Phillip Forte, El Ángel y Porcia la gris muestran su portada arriba; el primer plano de Phillip ya no corta la cara (`02-phillip-retrato.webp`, `05-el-angel-escritorio.webp`) | ✅ |
| #8 Arena | "Enfrentar en la Arena" en las fichas con stats (`03-cta-arena-movil.webp`). `?a=bogbo` → Bogbo vs Vlad Julia; `?a=vlad-julia` → Vlad Julia vs El Gran Majá (el rival nunca es el mismo) | ✅ |
| #9 Orden | "phillip" → Phillip Forte antes que el directorio. ⌘K vacío empieza por El Gran Majá, The Bloop y Vlad Julia (`04-paleta-vacia.webp`). Chip "Próximamente" en Aodos AY01. Relacionados de Phillip: Bogbo, Breegard, Colosos, DELIRIUM (sin directorios ni Próximamente). La landing cuenta 30 expedientes (antes 37, contando los Próximamente) | ✅ |
| #10 Menú | Índices de Especies, Categorías, Vehículos, Organizaciones y Libros; Cael Cortés en Humanos; "El Destello de los Colosos" con su nombre y destino; `check:content` valida 38 entradas | ✅ |
| Calidad | Lint, `npm test` (34/34), `check:content` y `build` en verde. Lighthouse 100/100/100 en `/wiki/phillip-forte` (móvil) y `/wiki/bogbo` (escritorio) | ✅ |
