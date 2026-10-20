# QA — Pendientes menores (#57, #58)

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-19. Plan en `docs/superpowers/plans/2026-10-19-pendientes-menores.md`.

Se comprobó en un contexto de navegador aislado. La caché HTTP de las sesiones anteriores servía prefetch RSC y chunks de builds viejos, que el servidor actual ya no tiene (404 con `curl`), y eso falseaba las medidas.

| Caso | Resultado |
|---|---|
| **Paleta, carga diferida:** al cargar `/` y `/wiki/el-gran-maja` no se pide ningún chunk con el código de la paleta, ni siquiera entre las rutas precargadas. ⌘K / Ctrl+K funciona antes de cargarla: pide el chunk, abre el diálogo y deja el foco en el campo (`combobox`). Al pasar el ratón por el buscador de la portada, el chunk se precarga sin montar el diálogo. Un clic en el buscador de la portada abre la paleta con el foco en el campo (`01-paleta-1440.webp`) | ✅ |
| **Paleta, accesibilidad:** sin consulta, el árbol muestra `listbox "Populares"` → `group "Populares"` con sus 8 opciones. Sin coincidencias, `listbox "Sugerencias"` → `group "Populares"` (`aria-labelledby`) con 7 opciones. Con resultados, opciones dentro de `ul role="presentation"`, y `aria-activedescendant` apunta a la fila 0 | ✅ |
| **Paleta, estado:** en una ráfaga de 5 consultas cada 80 ms, `role="status"` cambia solo cuando el texto lleva 300 ms sin variar («10 resultados» y luego «Sin coincidencias para zzzq»). No anuncia cada tecla | ✅ |
| **Visor:** en El Gran Majá, con el foco en «Abrir original» de la imagen 1, → lleva el foco al de la imagen 2 («Imagen 2 de 5», con `:focus-visible`). Con el foco en «Siguiente», el clic avanza a la 3 y el foco se queda en el botón | ✅ |
| **Chip de apartado:** en Vlad Julia (390 px), el nombre accesible es «Apartado actual: Anatomía · 1/3 . Abrir índice» y contiene el texto visible «Anatomía · 1/3». No cambia de aspecto (`02-chip-390.webp`) | ✅ |
| **`outline-hidden`:** la regla `.outline-hidden` y sus variantes `focus:` y `focus-visible:` ponen `outline-style: none`, y en `@media (forced-colors: active)` un contorno transparente de 2 px que el sistema pinta. Ya no queda ningún `outline-none` en `src` | ✅ |
| **Portada de la ficha:** `sizes="(min-width: 1408px) 1088px, (min-width: 1024px) calc(100vw - 20rem), (min-width: 768px) calc(100vw - 19rem), calc(100vw - 2rem)"`. A 390 px con DPR 3 pide `w=1080` | ✅ |
| **Helpers comunes:** en `/comunidad`, el vídeo y las novedades usan `youtubeWatchUrl` y `youtubeThumbUrl`, y las fechas salen en español («13 de diciembre de 2025»). Los rótulos «Próximamente» de la landing, el registro y la paleta se ven igual | ✅ |
| **Relacionados (decisión D1):** Vlad Julia sigue mostrando «Colosos · Categoría» entre sus relacionados. Las migas no enlazan la categoría, así que es el único camino a esa página fuera del menú | ✅ |
| **Lighthouse:** 100/100/100 en `/` (escritorio), `/wiki/vlad-julia` (móvil) y `/comunidad` (móvil). Consola sin errores ni avisos | ✅ |
| **Pruebas:** lint, `npm test` (188/188), `check:content` y `build` en verde | ✅ |

**Después de la revisión final** (`cb5fbcc`):
- **Chunk de la paleta caído:** sin red, la primera apertura con Ctrl+K deja la página intacta y muestra el aviso «No se pudo abrir la búsqueda.» con «Recargar». Antes de arreglarlo, un fallo de carga dejaba la pantalla «Application error» de Next.
- **Grupos:** sin consulta y sin coincidencias, el listbox se llama «Sugerencias» y el grupo «Populares» solo contiene las fichas. «Expediente aleatorio» queda en una lista aparte. Con resultados, el listbox se llama «Resultados».
- **Estado:** al cerrar y reabrir, `role="status"` sale vacío desde los primeros 50 ms y no repite el anuncio anterior.
- **Colores forzados:** `outline-none focus-visible:outline-hidden` en el campo, el área de texto, el desplegable, los diálogos, las pestañas, el campo de la paleta y el visor. El contorno solo aparece con foco, en lugar de verse siempre.

**Feed de YouTube:** el RSS del canal funciona, pero de forma intermitente. En 12 peticiones seguidas, con Node y con `curl`, respondió 200, 404 o 500 al azar. Si acierta durante el build, «Último vídeo» muestra «Colosos 3: Tráiler Oficial»; si falla, la app usa el respaldo y la revalidación de 1 h lo corrige sola. El 404 de las olas anteriores era esta intermitencia, no una caída.
