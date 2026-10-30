# Arena más divertida — diseño

Fecha: 2026-10-29. Pedido por Nelson: mejorar la Versus Arena para hacerla más divertida, a criterio de Claude. Hoy es estática: se eligen dos combatientes y se ve un porcentaje, un radar y la escala. Reglas: solo canon (los resultados nunca contradicen un enfrentamiento del lore), «ley Abisal», accesible y rápida.

## 1. Combate por rondas
- Botón **«¡Combatir!»** que revela el combate en 5 asaltos, uno por eje (Poder, Defensa, Hostilidad, Inteligencia, Escala), con marcador A–B y el veredicto final. Animación breve por asalto (≈ 0,6 s) con `prefers-reduced-motion` → todo a la vez; botón «Saltar al resultado».
- **Factor sorpresa:** cada asalto compara el valor del eje con una variación aleatoria pequeña (±8 %), así que un combate igualado puede cambiar de ganador al repetirlo; uno muy desigual no. Gana quien gane más asaltos (empate → mayor puntuación total). La barra de probabilidad sigue mostrando la probabilidad esperada (`computeMatchup`) y se rotula así.
- **Canon manda:** si la pareja tuvo un enfrentamiento real en el lore, el ganador es siempre el del canon (sin aleatoriedad) y se muestra la insignia del punto 3.
- Lógica pura en `src/features/monsters/lib/arena-battle.ts` (rondas, jitter con generador inyectable para tests, canon), probada.

## 2. «¿Quién crees que gana?»
- Antes de combatir, el usuario puede elegir su favorito (dos botones). Al acabar: «¡Acertaste!» / «Fallaste». Aciertos e intentos en `localStorage` (`wb-arena`, con try/catch), mostrados como «Tus predicciones: 7/10». Opcional: se puede combatir sin predecir.

## 3. «Ocurrió en el canon»
- Config `CANON_BATTLES` (`src/features/monsters/config/canon-battles.ts`) con los enfrentamientos reales entre combatientes de la Arena, cada uno con ganador, una frase **literal** de la ficha y el enlace a la sección. Mínimo: The Bloop vs El Gran Majá → gana El Gran Majá («El Gran Majá le otorgó la derrota», `/wiki/the-bloop#…`). Revisar las fichas de los combatientes (the-bloop, el-gran-maja, bogbo, slowdown-criyonte, vlad-julia, le-mug) por otros enfrentamientos o datos canónicos de rivalidad (p. ej. «ningún labodótipo macho ha desafiado a Slowdown Criyonte») y mostrarlos como «Dato del archivo» cuando la pareja coincida, sin forzar un resultado si no hubo combate.
- Insignia visible en la tarjeta de resultado y en el estado previo al combate.

## 4. Duelo de la semana
- Si la pareja es el duelo de la votación semanal (`getWeeklyPoll`, tipo `duelo`), banda «Este es el duelo de la semana · Vota en Comunidad ›». La página pasa la encuesta vigente desde el servidor (sin volverla dinámica: ISR como ahora).

## 5. Torneo rápido
- Pestaña o botón «Torneo rápido»: 4 combatientes al azar (o elegidos), semifinales y final con el mismo combate por rondas; cuadro visual; campeón con «Compartir». Con menos de 4 combatientes, no se ofrece.

## 6. Compartir
- Texto del combate: «A vs B — ganó X por 3-2 en la Versus Arena. ¿Estás de acuerdo? <url>» (sin spoilers innecesarios); torneo: «Campeón del torneo: X». Tarjeta para compartir estática de `/wiki/arena` reutilizando `src/features/monsters/og/`.

## Verificación
Tests de la lógica; QA a 320/390/1440 (combate, predicción, canon, torneo, teclado, lector, reduced motion); axe 0; sin errores; la página sigue estática/ISR.
