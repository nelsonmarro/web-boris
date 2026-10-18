# QA — Hub de la comunidad `/comunidad` (#10)

Build de producción (`next start -p 3131`) contra Postgres desechable (`docker compose -p webboris-hub`, puerto 5433) con `VOTE_SECRET` temporal. Chrome DevTools, 2026-10-18.

| # | Caso | Resultado |
|---|---|---|
| 1 | `/comunidad` 200; 4 tiles; lg: criatura en 2 filas, vídeo y encuesta arriba, novedades abajo (`comunidad-desktop.webp`) | ✅ |
| 2 | 390 px: orden criatura → encuesta → vídeo → novedades, sin scroll horizontal (`comunidad-mobile.webp`) | ✅ |
| 3 | Criatura de la semana = la de la landing (Bogbo, `pickFeatured`) | ✅ |
| 4 | Encuesta curada W42 Vlad Julia vs El Gran Majá; votar → 100 % / 0 %, "Tu voto", "1 voto" | ✅ |
| 5 | Recargar → mismos resultados (cookie `wb_voter` httpOnly, invisible para JS) | ✅ |
| 6 | 5 dispositivos (contextos aislados) votan; el 6.º → "Se alcanzó el límite de votos desde esta red" (`encuesta-limite.webp`) | ✅ |
| 7 | Base de datos parada → API `unavailable`, tile "Votación no disponible ahora", botones desactivados, página 200, consola limpia; vuelve al arrancarla | ✅ |
| 8 | Feed RSS inválido (`YOUTUBE_FEED_URL`) → vídeo de respaldo "La Batalla"; el build registra el fallo | ✅ |
| 9 | Navbar "Comunidad" activo; también en menú móvil y footer; landing conserva sus 3 vídeos | ✅ |
| 10 | Lighthouse `/comunidad`: accesibilidad 100, buenas prácticas 100, SEO 100 (móvil y escritorio) | ✅ |

Hallazgo corregido durante la QA: el botón del menú móvil no tenía nombre accesible (Lighthouse `button-name`, 95 → 100).
