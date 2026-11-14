# Menú compacto, «Añadir al menú» y orientación del panel (ola 3 de la auditoría)

Auditoría: `docs/audits/2026-11-13-panel-boris/README.md`, puntos #6, #7, #12 y #13.

## #6 Editor del menú en árbol compacto

- Cada universo y cada grupo se pliegan (cerrados por defecto; «Desplegar todo» / «Plegar todo»).
- Cada entrada es **una línea**: icono, nombre, «Grupo» o la dirección, subir, bajar y «Editar». Al pulsar el nombre
  o «Editar» se despliega debajo su formulario: nombre, enlace, icono, **Mover a** (otro grupo o universo), «Añadir
  dentro» y «Quitar» (con Deshacer).
- «Mover a» resuelve lo que antes costaba cinco pulsaciones; subir y bajar quedan para el ajuste fino. Las
  operaciones son puras y probadas (`moveItemTo`, `moveTargets` en `lib/nav-tree.ts`): no se puede mover una entrada
  dentro de sí misma ni pasar de `NAV_MAX_DEPTH`.
- «Buscar en el menú» filtra por nombre o dirección y despliega lo que coincide.
- El estado de plegado y edición va por una clave estable de cada entrada (no por su posición), así que mover o
  renombrar no cierra ni cambia lo que se está editando. La clave no se publica.
- Sin arrastrar y soltar: los botones funcionan igual con teclado, ratón y en el móvil.

## #7 Añadir al menú desde la ficha

- En el editor de una ficha que se ve en la web y no sale en el menú: aviso «Esta ficha no sale en el menú
  lateral», selector «¿Dónde va?» y botón «Añadir al menú». Publica el menú al momento (con su versión en el
  historial y la misma comprobación que el editor del menú).
- El destino viene sugerido (`suggestDestination`, puro): el grupo donde ya están más fichas de su misma categoría
  y universo; si no hay ninguna, el universo con más fichas del mismo universo. La misma sugerencia aparece en «Fichas
  que no están en el menú» del editor del menú.
- Concurrencia: lleva la marca del menú; si cambió, pide recargar.
- `publishList` y la nueva acción comparten el guardado (`commitList` en `server/lists.ts`).

## #12 Listado de fichas

- Miniatura de la portada (o el marcador de su categoría).
- Etiquetas en llano: «Sin cambios», «Editada», «Borrador pendiente», «Nueva», «Retirada» y «Sellada»
  (`articleBadges`, puro).
- Filtros con chips (enlaces GET, combinables con la búsqueda): estado (todas, borrador pendiente, nuevas, editadas,
  selladas, retiradas) y universo. `filterArticles`, puro.
- Filas de al menos 56 px de alto (zona táctil, #24).

## #13 Inicio con lo pendiente

- «Pendiente»: borradores sin publicar (cada uno enlaza a su ficha), fichas que no salen en el menú (enlace al menú)
  y la votación de la semana que viene (elegida en Votaciones o duelo automático, con enlace).
- «Últimas fichas editadas» en el panel (5, con su hora local).
- La actividad de la cuenta pasa al final, plegada.
- Desaparecen las tarjetas que repetían el menú.
