# QA — Ola C (#51): enganche

Build de producción (`next start -p 3131`), Chrome DevTools, 2026-10-19, sobre la base de la Ola B (#59). El alcance es el que quedó tras el rediseño minimalista (ver `docs/superpowers/plans/2026-10-19-ux-fan-ola-c.md`).

| Caso | Resultado |
|---|---|
| **Expediente sellado (Cael Cortés):** <ul><li>lo conocido arriba;</li><li>después, el bloque con el sello "Expediente sellado" y "Boris aún no ha desclasificado este expediente.";</li><li>enlaces "Sigue el canal" y "Ver el registro" (44 px).</li></ul> "Pide que se desclasifique" solo aparece en la semana en que la encuesta es de tipo `desclasificar` e incluye la ficha. Se comprobó forzando temporalmente esa encuesta a la semana actual (`01-sellado-1440.webp`, `02-sellado-390.webp`) | ✅ |
| **Registro del archivo:** con el registro vacío se abrieron The Bloop, Bogbo y Cael Cortés. Resultado: "Has abierto 2 de 21 expedientes", porque la sellada no cuenta. Las tarjetas sin abrir se ven atenuadas y llevan el texto "Sin abrir"; al final, "Pendiente de desclasificar" con las 6 selladas en lista de texto (`03-registro-1440.webp`, `04-registro-390.webp`). Hay entradas en el menú lateral ("Tu archivo", en todos los tamaños) y bajo "Archivo" ("Tu registro · N/T"; tras abrir también El Gran Majá, 3/21) | ✅ |
| **Expediente aleatorio:** `curl -sI /wiki/aleatorio` → 307, `Cache-Control: no-store`. En 12 peticiones salieron 10 fichas distintas y ninguna sellada. Desde el menú lateral, 4 clics seguidos llevaron a 4 fichas distintas (navegación sin recarga). La fila "Expediente aleatorio" de la paleta (⌘K) también funciona | ✅ |
| **Siguiente/anterior:** en El Gran Majá, "‹ Porcia la gris" y "Siguiente en Animales: The Bloop ›" (44 px). En el móvil va el siguiente primero (`06-…-1440.webp`, `07-…-390.webp`) | ✅ |
| **Vista previa de enlaces:** <ul><li>con el ratón sobre "Breegard" sale, tras 300 ms, una tarjeta con la imagen, "Vehículo · Colosos" y la descripción (`05-vista-previa-1440.webp`);</li><li>Esc la cierra;</li><li>con el foco de teclado sobre "Phillip Forte" aparece al momento;</li><li>`aria-describedby` está mientras se ve.</li></ul> | ✅ |
| **"Aparece en":** El Gran Majá y The Bloop muestran "Colosos - The Bloop vs El Gran Majá - La Batalla". The Bloop aparece por la relación manual de `videos.json`, porque el título nombra a "The Bloop" y no a "The Bloop Ojo Solo" | ✅ |
| **Voto "desclasificar" (forzado temporalmente a la semana actual):** <ul><li>en `/comunidad`, "¿Qué expediente quieres que Boris desclasifique primero?", con Cael Cortés y Aodos AY01 como "Próximamente", sin Arena, y la nota "Tu voto es una señal para Boris, no una promesa de publicación." (`08-encuesta-desclasificar-390.webp`);</li><li>en la landing, "Votación de la semana: ¿qué expediente se desclasifica primero? Votar ›".</li></ul> `encuestas.json` se restauró después | ✅ |
| **Slug canónico:** `/wiki/slowdown-criyote` → 308 a `/wiki/slowdown-criyonte`. `/wiki/arena?a=slowdown-criyote&b=the-bloop` reescribe la URL al slug nuevo | ✅ |
| **Lighthouse:** 100/100/100 en `/wiki/registro`, `/wiki/cael-cortes` y `/wiki/el-gran-maja` (móvil y escritorio), y en `/wiki` y `/comunidad` (móvil) | ✅ |
| **Pruebas:** lint, `npm test` (154/154), `check:content` y `build` en verde. `/wiki/[slug]` pasa a ISR de 1 h | ✅ |

**Medidor de apartados:** no aparece en ninguna ficha hoy. Ningún apartado `##` tiene solo `<Proximamente />`: Bogbo y Porcia no tienen apartados `##`, y los demás tienen texto canónico junto al aviso. El componente queda listo para cuando un apartado esté pendiente.

**Fuera de la ola:** el feed RSS de YouTube sigue devolviendo 404, y es un problema de YouTube. "Aparece en" y el "último vídeo" usan los vídeos destacados.

**Después de la revisión final** (`4251c2d..c3063ca`):
- **Bloque de cierre de la ficha:** "Aparece en", Anterior/Siguiente y "Archivos relacionados" van en un único `data-related`. En Vlad Julia (390 px, sin vídeos), con el foco en el enlace de cierre, el chip de apartado ya no está y no lo tapa. A mitad de la ficha sigue apareciendo ("Apartado actual: Anatomía (1 de 3)").
- **Grupos de 2:** Cael Cortés muestra solo "Siguiente en Humanos: Phillip Forte". Ya no se repite el mismo enlace como anterior y siguiente.
- **Registro:**
  - una ficha sellada ya no se marca como abierta;
  - el enlace bajo "Archivo" se anuncia "Tu registro: 8 de 21 expedientes abiertos";
  - el registro y el aleatorio usan el mismo conjunto de fichas.
- **Aleatorio:**
  - `Location` relativo (`/wiki/<slug>`), así que no depende del host del proxy;
  - con `Referer: /wiki/the-bloop`, 8 peticiones y ninguna vuelve a The Bloop;
  - un `Referer` malformado se ignora.
- **Contenido:**
  - `check:content` acepta novedades que enlacen a `/wiki/registro` y `/wiki/aleatorio`;
  - rechaza los slugs reservados (`arena`, `registro`, `aleatorio`);
  - solo exige "sellada" en las encuestas `desclasificar` de semanas futuras;
  - pide `titulo` en `videos.json` para vídeos que no son destacados.
- **Lighthouse:** 100/100/100 en Vlad Julia y `/comunidad` (móvil) y en `/wiki/registro` (escritorio). 178 tests.
