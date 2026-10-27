# A3 — Fichas /wiki/<slug> (37)

## Cobertura
- Las 37 fichas a 390x844, 1440x900, 768x1024 y 1024x768 (y 320x640 para el solape de flotados): HTTP, consola (error/warning), imágenes rotas tras hacer scroll, desbordamiento horizontal (documento y elementos), tablas, `clear-both` en h2/h3 del cuerpo, solape de flotados con títulos, un único h1. 65 enlaces internos únicos recogidos de todas las fichas y comprobados: 0 con 4xx/5xx. `/wiki/no-existe` da 404 real.
- Interacciones en the-bloop: móvil (TOC desplegable, salto, SectionChip n/N, hoja de índice, salto con foco al h2, ocultación al llegar a `[data-related]`, ArticleProgress), visor (abrir, flechas, teclado, deslizar, Esc, atrás, «Abrir original») en escritorio y móvil; EntityPreview (hover, foco, Esc, salir); Arena, Compartir (copia el enlace + aviso), menú ⋯; MarkSeen.
- Capturas revisadas a ojo: the-bloop (móvil), medianos, especies, colosos, cael-cortes (móvil).
- Axe en the-bloop, medianos, especies, phillip-forte a 1440 y 390.
- Sin mirar a fondo: cada ficha visualmente una a una (solo muestra); EntityPreview en táctil; swipe real con gestos (se simuló con scrollTo del carrusel).

## Hallazgos

### A3-1 · Sello del expediente con contraste insuficiente
- Severidad: baja
- Dónde: toda ficha `status: proximamente` (medianos, cael-cortes, piratas-galeon, …), 390 y 1440. Axe `color-contrast` serious.
- Observado: contraste 3.47 (texto #b4520e sobre #061a2e, 12 px); el sello es `aria-hidden` y decorativo.
- Evidencia: salida de axe.
- Causa probable: `src/features/monsters/components/wiki/article/ExpedienteSellado.tsx:35` (`text-primary/70` con borde `border-primary/70`).
- Arreglo: subir a `text-primary` (o ≥ 4.5:1). Al ser decorativo y rotado, es de baja prioridad.

### A3-2 · Etiquetas de la infobox («Amenaza», «Habilidades») con contraste 3.78
- Severidad: baja
- Dónde: criaturas con stats (the-bloop…), solo escritorio (rail), 1440. Axe `color-contrast` serious, 2 nodos.
- Observado: `text-white/40` a 12 px sobre #061a2e = 3.78:1 (mínimo 4.5).
- Causa probable: `src/features/monsters/components/wiki/mdx/InfoStats.tsx:32` y `:83`.
- Arreglo: `text-white/60` o más.

### A3-3 · Salto de nivel de encabezado en `especies` (h1 -> h3)
- Severidad: baja
- Dónde: /wiki/especies, ambos viewports. Axe `heading-order`.
- Causa: `src/content/especies.mdx:11` usa `### Clasificaciones Principales` sin `##` previo.
- Arreglo: cambiar a `##` (sin tocar texto). Revisar si otros directorios hacen lo mismo (axe solo lo marcó en este de los 4 probados).

### A3-4 · Entradilla (`description`) repetida literalmente en el cuerpo de las fichas selladas
- Severidad: baja
- Dónde: medianos («Una de las tres categorías… junto a los Titanes y los Colosos.» arriba y «Los Medianos son una de las tres categorías…» justo debajo); cael-cortes («Personaje humano del universo Colosos.» + «Cael Cortés es uno de los personajes humanos…»). Se ve en las capturas a 390.
- Causa: frontmatter `description` + primer párrafo del MDX casi idénticos.
- Arreglo: dejar solo uno (quitar el párrafo del cuerpo o acortar la descripción). No añade lore.

### A3-5 · Dos encabezados h2/h3 dentro del cuerpo sin `clear-both` (falso positivo probable)
- Severidad: baja (informativo)
- «Hallazgos del sistema auditivo» (el-gran-maja) y «Estado del expediente: la bata» (the-bloop) no computan `clear: both`, ni «Expediente sellado» (h2 del componente). Probablemente son títulos de componentes (tabs/alert/sello), no del MDX. No hay solape medido: 0 solapes flotado-título en 320/390/1440 (en 390 y 320 no hay flotados por diseño; a 1440 hay 5-6 en bloop/gran-maja y no pisan nada).

## Comprobado y correcto
- HTTP 200 en las 37 fichas y 4 viewports; consola limpia (0 errores/warnings) en todas; 0 imágenes rotas; 0 desbordamiento horizontal (documento y elementos) a 320/390/768/1024/1440; ninguna tabla desborda; un h1 por ficha.
- Cabecera: `FactsLine` (Longitud/Amenaza/Peso), acciones Arena/Compartir/⋯ (Historial, Imprimir) bien en móvil y escritorio; Compartir copia la URL y avisa; Arena enlaza a `/wiki/arena?a=<slug>`.
- Fichas sin imagen concreta usan placeholder por categoría (visible en tarjetas relacionadas); ninguna usa el logo como portada (el `logo.webp` detectado es el de la navbar).
- TOC móvil (desplegable «Contenido»), SectionChip: aparece tras la fila de desplegables, «Apartado actual: X · n/N», hoja con los 7 apartados, saltar enfoca el h2 y desplaza; se oculta al llegar a `[data-related]`. ArticleProgress avanza.
- Visor: abre con +1 entrada de historial; flechas y teclado (←/→) funcionan; en móvil las flechas están ocultas y se desliza (scroll-snap OK); «Atrás» y Esc cierran sin dejar entradas huérfanas; «Abrir original» abre en pestaña nueva con la ruta del asset.
- Enlaces automáticos: 4 en the-bloop apuntan a fichas existentes; EntityPreview aparece en hover y foco, se cierra al salir y con Esc.
- ExpedienteSellado (sello, texto, «Sigue el canal», «Ver el registro»), ArchivoMeter, Anterior/Siguiente (con vuelta al principio, en grupos de 2 solo «Siguiente»), relacionados (5-7 tarjetas) y «Aparece en» (sale en the-bloop/gran-maja) presentes. Las fichas selladas no muestran elementos sin sentido (ni medidor ni infobox vacía). Índices (`Directorio`/`Categoría`) sin portada ni stats ni elementos huérfanos.
- MarkSeen: visitar bogbo escribe `wb-registro`; visitar la ficha sellada (medianos) no la marca.
- Axe: 0 críticos; salvo A3-1..A3-3 solo `region` moderate en el sidebar (x10, el pase de axe del aside; no es de la ficha) a 1440. the-bloop y phillip-forte a 390 sin violaciones.
