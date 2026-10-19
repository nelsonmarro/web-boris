# QA — Ola B (#50): descubrimiento

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-18. Sobre la base del rediseño minimalista (#55).

| Caso | Resultado |
|---|---|
| **Enlaces automáticos:** El Gran Majá enlaza Supperbial anguilla, Breegard, IPCARO, DELIRIUM, Phillip Forte y The Bloop Ojo Solo, una sola vez cada uno, sin enlaces en títulos ni en pies de foto. En los 37 artículos: 41 enlaces y ninguno duplicado con un enlace manual | ✅ |
| **Relacionados:** salen del grafo de menciones (mutuas, luego salientes y luego entrantes, con las fichas más completas primero). El Gran Majá → The Bloop, Supperbial anguilla, Breegard, Phillip Forte. Phillip → DELIRIUM, IPCARO, El Gran Majá, Bogbo | ✅ |
| **Paleta, cómo se abre:** desde el buscador del hero de la landing (con el foco ya en el campo), la lupa/píldora de la landing y de la wiki, y ⌘K/Ctrl+K | ✅ |
| **Paleta, búsquedas:** <ul><li>"cangrejo" → Vlad Julia ("también: el pez cangrejo"), `01-paleta-apodo.webp`;</li><li>"bloop solo" → The Bloop Ojo Solo;</li><li>"philip" → Phillip Forte;</li><li>"galeon" → Capitán de Galeón;</li><li>"le mug" → Le'Mug;</li><li>"anguila sonriente" → El Gran Majá;</li><li>"zzz" → "Sin coincidencias" y los populares;</li><li>"blopu" → "¿Quisiste decir The Bloop Ojo Solo?"</li></ul> | ✅ |
| **Explorador de `/wiki`:** filtra en directo con el mismo motor (apodos y erratas). Vacío: sugerencia, "Limpiar filtros" y los populares en lista de texto. Consulta limitada a 80 caracteres | ✅ |
| **Navbar de la landing:** a 800 y 1024 px desbordaba; ahora muestra los enlaces completos desde 1280 px y, por debajo, el menú y la lupa. Sin desbordes a 1024, 1280 ni 1440 | ✅ |
| **Barra de progreso y chip de apartado (390 px):** el chip aparece al pasar la fila "Ficha completa · Contenido" ("Apartado actual: Descubrimiento", 44 px). La hoja inferior muestra los 7 apartados y saltar a uno lo deja a 96 px de arriba (`02-chip-progreso-movil.webp`, `03-hoja-indice-movil.webp`) | ✅ |
| **Visor de imágenes:** "Imagen 1 de 5" con su pie de foto y "Abrir original". "Atrás" lo cierra sin salir de la ficha y el foco vuelve a la imagen (`04-visor-movil.webp`) | ✅ |
| **Lighthouse:** 100/100/100 en `/`, `/wiki`, `/wiki/el-gran-maja` y `/comunidad`, en móvil y escritorio | ✅ |
| **Pruebas:** lint, `npm test` (89/89), `check:content` y `build` en verde. Índice de la paleta: 10,8 KB | ✅ |

Fuera de la ola: durante el build, el feed RSS de YouTube devolvió 404, así que el "último vídeo" usa el respaldo del PDF.
