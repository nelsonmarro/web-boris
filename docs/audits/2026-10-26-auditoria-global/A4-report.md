# A4 · Versus Arena y /comunidad

## Cobertura
- `/wiki/arena` en los 8 viewports: `''`, `?a=the-bloop&b=bogbo`, `?a=bogbo`, `?a=zzz&b=qqq`, `?a=slowdown-criyote&b=the-bloop`. Se midió desbordes, radar, botones y selects. En cada viewport se probó: elegir con ratón, elegir con teclado (Enter/flechas/Escape), poner el mismo combatiente en A y B, Aleatorio ×4 y Compartir (Web Share ausente, cae al portapapeles y muestra el toast). Axe en el Simulador y en el Comparador (1280). Pestaña Comparador en 320/390/768 sin desbordes. Llegada desde la ficha `the-bloop` con el CTA «Enfrentar a…» (va a `?a=the-bloop` y B = Vlad Julia).
- `/comunidad` en los 8 viewports: desbordes, tamaños de botones, enlaces y fechas, axe, consola. Estado «Cargando la votación…» (ruta retenida), `route.abort`, respuesta 500. Votos reales con 3 contextos nuevos (390, 1280, 320): resultados, «Tu voto», recarga, barras. 3 votos emitidos en total (Bogbo 1, Le'Mug 2). Criatura de la semana comparada con el hero de la landing. Enlace «Ver el duelo en la Arena».
- Sin mirar: Web Share nativo real (solo la rama del portapapeles), lector de pantalla real, votar en los 8 viewports (límite de 5 votos por IP), `prefers-reduced-motion`.

## Hallazgos

### A4-1 · URL y título dicen «X vs X», pero la pantalla muestra otro rival
- Severidad: media
- Dónde: `/wiki/arena?a=the-bloop&b=bogbo`. En el select A elegir «Bogbo» (cualquier viewport).
- Esperado / observado: B se reasigna en silencio a «El Gran Majá». La URL pasa a `?a=bogbo&b=bogbo` y `document.title` a «Bogbo vs Bogbo | Versus Arena», mientras la pantalla muestra Bogbo vs El Gran Majá (con «Favorito»). Si B era un caso así, lo mismo ocurre al elegir en B el valor de A. Además la frase «Un coloso contra sí mismo: empate técnico. Elige dos combatientes distintos.» es código muerto: `slugA === slugB` nunca se cumple porque `slugB` se normaliza antes, así que nunca se ve el mensaje. Al recargar la URL se ve otro rival distinto del que había al elegir (el estado y la URL no coinciden).
- Evidencia: `shots/a4-arena-same-390.png` (URL en el log de la prueba: `?a=bogbo&b=bogbo`, título «Bogbo vs Bogbo»).
- Causa probable: `ArenaSimulator.tsx` l. 36-40 (normaliza `slugB`) frente a `writePair` l. 44-52 (escribe `nextA`/`nextB` sin normalizar), y la rama muerta de las l. ~143.
- Arreglo propuesto: en `writePair`, si `nextA === nextB`, cambiar el otro lado al primer combatiente distinto (o intercambiar A/B, que es lo que espera el fan) antes de escribir URL y título; eliminar la rama «contra sí mismo» o mostrar un aviso breve cuando se intercambie.

### A4-2 · Selects de combatiente de 32 px de alto (no 48) en todos los viewports
- Severidad: media (objetivo táctil)
- Dónde: `/wiki/arena`, móvil 320–390 (y todos).
- Esperado / observado: la clase `h-12` (48 px) pretendida, pero el alto medido es 32 px (`getComputedStyle().height`). Por debajo de 44 px de objetivo táctil, y más pequeño que los botones Aleatorio/Compartir (36–37 px en móvil, 48 px en escritorio).
- Evidencia: `shots/a4-arena-320-top.png` (selects visiblemente más bajos que lo previsto).
- Causa probable: `src/components/ui/select.tsx` l. ~42 `data-[size=default]:h-8` gana por especificidad a `h-12` de `triggerClass` en `ArenaSimulator.tsx` l. 15.
- Arreglo propuesto: en `triggerClass` usar `data-[size=default]:h-12` (o `!h-12`) y subir los dos botones a `min-h-11`.

### A4-3 · Etiquetas del radar ilegibles en 320/360
- Severidad: baja
- Dónde: `/wiki/arena`, 320×640 y 360×740, tarjeta «Perfil comparado».
- Esperado / observado: el SVG escala a 206 px en 320 (×0.74) y 246 px en 360 (×0.88), así que las etiquetas de 10 px quedan en ~7.4 px y ~8.8 px, en blanco al 55 % sobre fondo oscuro. En 390 son ~9.9 px.
- Evidencia: `shots/a4-arena-320-radar.png`.
- Causa probable: `RadarChart.tsx` (`fontSize={10}`, `fill rgba(255,255,255,0.55)`, `viewBox` fijo con `w-full`).
- Arreglo propuesto: `fontSize` ~13 en el viewBox y `fill` a `rgba(255,255,255,.75)` (contenido: el radio deja sitio, `radius + 18`; comprobar «Inteligencia» a 13 px).

### A4-4 · Pestañas Simulador / Comparador apiladas en 320 y 360 con el subrayado en la equivocada
- Severidad: baja
- Dónde: `/wiki/arena`, 320 y 360 de ancho.
- Esperado / observado: las dos pestañas (117 + 216 px) no caben en una fila y se apilan (tops 483 y 523). La pestaña activa es «Simulador» (arriba), pero el subrayado naranja aparece bajo «Comparador de escala» (la de abajo, al pie de la lista), lo que sugiere que la inactiva está seleccionada. En 390+ van en una fila.
- Evidencia: `shots/a4-arena-320-top.png`.
- Causa probable: `WikiTabs`/`WikiTab` (`wiki/mdx/WikiTabs`): el indicador se pega al borde inferior de la lista sin seguir a la pestaña activa cuando hay salto de línea.
- Arreglo propuesto: reducir el padding horizontal de las pestañas para que quepan en 320 o dibujar el subrayado en cada `[role=tab][aria-selected=true]` (borde inferior propio) en vez de un indicador absoluto.

### A4-5 · `/comunidad`, error de red: sin reintento ni salida
- Severidad: baja
- Dónde: `/comunidad` con `/api/comunidad/encuesta` abortado o respondiendo 500 (390).
- Esperado / observado: tras el fallo (React Query `retry: 1`, ~3 s) los dos botones quedan desactivados con el texto «Votación no disponible ahora.» (correcto y sin romper la página), pero no hay botón «Reintentar»: el fan debe recargar a mano. No hay errores de consola salvo los `net::ERR_FAILED` del propio fallo simulado.
- Evidencia: `shots/a4-com-neterr-390.png`.
- Causa probable: `PollTile.tsx` l. ~101-105 (`status`), sin acción de `refetch`.
- Arreglo propuesto: junto al mensaje, un botón de texto «Reintentar» que llame a `refetch()` (con `min-h-11`).

### A4-6 · Fila «Criatura de la semana» recorta el dato en 320
- Severidad: baja
- Dónde: `/comunidad`, 320×640. «Titán · Colosos» se recorta a «Titán · C…» y el nombre «Le'Mug» queda estrecho.
- Esperado / observado: la meta pierde la mitad del texto (`.truncate` con `scrollWidth > clientWidth`) y no tiene `title`.
- Evidencia: `shots/a4-com-320.png`.
- Causa probable: `CommunityCreatureRow.tsx`: la miniatura 64 px, el hueco y «Ver ficha ›» (shrink-0) dejan ~90 px a la meta.
- Arreglo propuesto: en `<sm`, permitir dos líneas en la meta (`sm:truncate`, `line-clamp-2`) o ocultar el «›» y reducir el padding.

### A4-7 · Con `?a=` solo o slugs inválidos, URL y metadatos no reflejan lo que se muestra
- Severidad: baja
- Dónde: `/wiki/arena?a=bogbo` (se ve Bogbo vs Vlad Julia, título genérico «Versus Arena | Wiki BorisaoBlois») y `/wiki/arena?a=zzz&b=qqq` (se ve El Gran Majá vs Vlad Julia; la URL conserva `zzz`/`qqq`).
- Esperado / observado: la vista cae a los valores por defecto sin error (bien), pero la URL compartida desde el navegador no es canónica y la vista previa del enlace (og:title) es la genérica. «Compartir» sí genera una URL correcta (`a` y `b` mostrados).
- Causa probable: `arena/page.tsx` `generateMetadata` (exige a y b válidos), y no se reescribe la URL en `ArenaSimulator` salvo para el slug antiguo (l. 59-64).
- Arreglo propuesto: ampliar la reescritura del efecto `hasLegacyParam` a «cualquier param ausente/ inválido» y que `generateMetadata` resuelva el B por defecto como hace el cliente.

### Nota para el consolidador (fuera de mi área)
- Navbar a 320 px: el logo «BORISAOBLOIS» queda cortado contra el borde y el icono de búsqueda se corta a la derecha (`shots/a4-com-320.png`, cabecera). Lo verá quien audite la navbar; se menciona por si no.
- Axe en `/wiki/arena`: `region` (moderada, 9 nodos: contenido del sidebar `.group-data-[collapsible=icon]:px-3` sin landmark). En `/comunidad` axe da 0 violaciones en los 8 viewports.

## Lo que está bien
- Arena: sin desbordes horizontales en los 8 viewports (`scrollWidth == clientWidth`), también con el Comparador. Consola sin errores ni avisos. Navegación por teclado de los selects (Enter, flechas, Escape devuelve el foco al trigger). Aleatorio nunca da a == b (24 sorteos). Compartir copia `…/wiki/arena?a=&b=` correcto y avisa con toast. El slug antiguo `slowdown-criyote` se reescribe a `slowdown-criyonte` (URL y título). Llegada desde la ficha: CTA con `?a=the-bloop`, B por defecto distinto de A. Barras y tarjetas legibles en móvil; el radar cabe en su tarjeta.
- Comunidad: criatura de la semana = hero de la landing (Le'Mug). Enlace «Ver el duelo en la Arena» → `/wiki/arena?a=bogbo&b=le-mug` (44 px de alto). Vídeo de respaldo («Vídeo destacado») con enlace externo `_blank`/`noopener`; novedades con fechas en español («18 de octubre de 2026») y enlace interno/externo correctos. Estado «Cargando la votación…» con botones desactivados y `aria-busy`. Votar: resultados con porcentajes, «Tu voto» y total («1 voto»/«3 votos»), persisten tras recargar (cookie), barras coherentes (100/0, 50/50, 33/67), botones de 48 px, sin desbordes y sin errores de consola.
