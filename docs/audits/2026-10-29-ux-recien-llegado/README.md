# Auditoría UX: un recién llegado descubre la web — 2026-10-29

Pedido por Nelson: ponerse en el lugar de alguien que no sabe nada de BorisaoBlois ni de su lore, recorrer la web de verdad y ver si es intuitiva, llamativa, engancha, da ganas de saber más y lleva bien a los vídeos de Boris; y contrastarlo con webs parecidas.

**Método:** build de producción de `main` (`9bcdeb5`) recorrido con Chrome a 390×844 (móvil, el caso típico de quien llega desde un vídeo) y a 1440×900, pantalla a pantalla, midiendo dónde aparece cada cosa. Persona: vio un short de Boris, pulsa el enlace del canal y aterriza sin contexto; otra variante llega desde Google a una ficha («the bloop ojo solo»). Benchmark de 11 webs comparables en [`benchmark.md`](benchmark.md).

## Lo que funciona

- **El arte engancha.** El hero con un monstruo distinto en cada visita, las portadas nuevas (Criyonte, Vlad Julia) y las tarjetas de universos transmiten «aquí hay algo grande».
- **La ficha es de wiki seria.** Infobox con datos, índice lateral, chip de apartado flotante en móvil, imágenes intercaladas, relacionados, anterior/siguiente y botón a la Arena. Los textos nuevos (El Gran Majá, The Bloop) tienen gancho de misterio («El enigma de la batalla»).
- **Hay mecánicas de juego que pocas wikis tienen:** registro de expedientes abiertos, expediente aleatorio, expedientes sellados con «Pide que se desclasifique», votación semanal y Arena.
- Accesibilidad, rendimiento y responsive están en verde (auditorías anteriores).

## Lo que falla, en el orden en que lo vive el recién llegado

### 1. No se entiende qué es esto ni quién es Boris (landing)
- El hero dice «Explora la inmensidad **de mis** universos» y «Todo el lore oficial de BorisaoBlois en un solo archivo»: no dice que Boris es un creador de **vídeos animados en YouTube**, ni qué son los Colosos. La primera pantalla no tiene ningún enlace a YouTube ni a un vídeo.
- La imagen del hero, según el sorteo, se ve apagada en móvil (El Gran Majá al amanecer es casi un borrón violeta): el gancho visual depende de la suerte.
- La landing mide **10 pantallas** en móvil; los vídeos aparecen en la **pantalla 5,3**. Universos (2 pantallas) y Personajes destacados (2 pantallas, tarjetas enormes) van antes.
- «Sobre Boris» enseña «Biografía: **Próximamente**»: transmite sitio a medio hacer justo en la sección que debería presentar al autor.
- No hay **ningún «Suscríbete»** en toda la web (comprobado en el código).

### 2. La wiki no tiene puerta de entrada (/wiki)
- «Archivo — Criaturas, personajes… de los universos de BorisaoBlois»: no hay «empieza aquí», ni orden recomendado, ni «qué es un Coloso». La lista empieza por **Bogbo** (una ficha casi vacía) y no por The Bloop / El Gran Majá; son 29 tarjetas en 3 páginas.
- Los ganchos (registro 0/23, expediente aleatorio) son dos enlaces de texto pequeños.

### 3. La ficha no conecta con los vídeos ni da contexto
- Quien llega desde Google a una ficha no lee en ningún sitio que esto es de una **serie de YouTube**: el breadcrumb «Wiki › Colosos › Coloso» no lo explica.
- **El vídeo de la ficha («Aparece en») está al final:** pantalla 15,9 de 19 en El Gran Majá y 14,5 de 17,6 en The Bloop. Casi nadie llega ahí; el embudo hacia YouTube está roto justo en las fichas más visitadas.
- Fichas largas sin resumen: El Gran Majá son **1.964 palabras (~10 min), 19 pantallas** en móvil. Arriba solo hay 3 datos (longitud, amenaza, peso) y la descripción.
- Las fichas sin vídeo no proponen ningún otro vídeo del canal.

### 4. Detalles visuales
- La navbar al hacer scroll se vuelve una franja clara/translúcida sobre contenido claro (bocetos a lápiz, botones naranjas) y sus enlaces se leen mal.
- En escritorio hay huecos verticales muy grandes entre secciones de la landing (entre Universos y Personajes, y antes del pie).
- En escritorio, el scroll-spy marca «Universos» estando en Personajes destacados.

## Lo que hacen otras webs (resumen del benchmark)

Detalle, URLs y esfuerzo en [`benchmark.md`](benchmark.md). Hallazgo clave: la gente ya busca «¿El Gran Majá es real?» en varios idiomas y otras webs se llevan ese tráfico con datos erróneos (450 m, Bloop 215 m, nacionalidad de Boris equivocada); la wiki oficial no compite por esas búsquedas.

| # | Idea | Quién lo hace | Esfuerzo |
|---|---|---|---|
| 1 | «Suscríbete» (`?sub_confirmation=1`) en landing, fichas y sellados + último vídeo primero | creadores, Monster Hunter | S |
| 2 | FAQ oficial en las fichas virales («¿Existe de verdad?», «¿Cuánto mide?», «¿En qué vídeo sale?») con datos estructurados | Trevor Henderson, GabSolf | S (texto de Boris) |
| 3 | Página «Empieza aquí»: qué es en 2 frases, los 4 universos, el vídeo que ver primero, 5 fichas esenciales | SCP, Hollow Knight | S–M |
| 4 | Escala de tamaño en cada ficha y página `/wiki/escala` con siluetas | Wikizilla, Monarch | S + M |
| 5 | Vídeo de la primera aparición embebido arriba en la ficha (carga al pulsar) | Wikizilla, Backrooms | M |
| 6 | «Ver en orden» por universo, vídeos enlazados a sus fichas | Backrooms, LoL | M |
| 7 | Frase/dato desclasificado del día en landing y comunidad | SCP, Pokédex | S |
| 8 | Rangos de acceso según el registro (Civil → Acceso total) | SCP, Destiny | M |
| 9 | Imagen para compartir por ficha (retrato, stats, sello) | Pokédex, LoL | M |
| 10 | Juego «¿Quién es más grande?» en la Arena, con racha y compartir | Monster Hunter | M |

## Recomendación: hoja de ruta

**Fase 1 — embudo y contexto (sin material nuevo de Boris; S/M):**
1. Landing: subtítulo que diga quién es Boris («creador de los universos animados de…, en YouTube») y botones **Ver el último vídeo** / **Suscríbete** en el hero; vídeos justo después del hero; Personajes destacados más compactos; quitar «Biografía: Próximamente».
2. Ficha: **bloque de vídeo arriba** (primera aparición, embebido al pulsar) cuando exista; si no, «Más vídeos del canal»; **línea de contexto** bajo el título («Personaje de *Colosos*, la serie de BorisaoBlois en YouTube · Ver la serie») y «Suscríbete».
3. Ficha: **«En 30 segundos»** arriba (4–5 datos clave del infobox + escala «≈ N ballenas azules») para no obligar a leer 10 minutos.
4. Wiki: **«Empieza por aquí»** en /wiki con las 5 fichas estrella y orden destacado primero.
5. Arreglar navbar al hacer scroll, huecos de escritorio y scroll-spy.

**Fase 2 — enganche (M):** página «Empieza aquí», escala `/wiki/escala`, «Ver en orden», rangos del registro, imágenes para compartir, juego de tamaños.

**Fase 3 — con Boris:** FAQ «¿Es real?» con datos estructurados (SEO), orden de la historia, biografía, y enlazar la ficha en la descripción de cada vídeo (con parámetros de seguimiento), que no requiere código y es lo que más tráfico mueve.
