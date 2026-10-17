# Auditoría UI/UX — landing + wiki (2026-10-17)

Revisión como lead de frontend sobre el build de producción (`npx next start -p 3131`), con Chrome DevTools a 1440×900 y 390×844, más Lighthouse (accesibilidad, buenas prácticas, SEO). Las capturas de esta carpeta son la evidencia; cada hallazgo tiene un issue en GitHub con la etiqueta `ux`.

## Lo que ya funciona (y hay que proteger)
- **Identidad clara**: azul abisal `#00122E`, naranja bioluminiscente `#FF7300`, cristal líquido en el chrome, display bold-italic-uppercase. Es reconocible y coherente con el logo de Boris.
- **Versus Arena** es la pieza más memorable del sitio: datos reales, radar, tipografía mono para cifras, jerarquía impecable.
- **Infobox + TOC sticky + artículos relacionados** dan a la wiki una estructura de referencia seria.
- La landing ya reproduce los textos y videos del PDF de Boris y no tiene datos inventados.

## Scores Lighthouse (escritorio)
| Página | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|
| `/` | 95 | 100 | 100 |
| `/wiki` | 88 | 100 | 100 |

Fallos: contraste (`text-white/30-40` a 10–11 px), orden de encabezados (h3 en el hero, h4 en footers), selects del explorador sin nombre accesible, 3 enlaces sin nombre en el footer de la wiki, desajuste label/nombre en el logo del sidebar y el botón ⌘K.

## Hallazgos priorizados
| # | Área | Severidad | Hallazgo | Evidencia |
|---|---|---|---|---|
| 1 | Wiki artículo (móvil) | 🔴 | Imágenes flotadas de 288 px en una columna de 358 px: quedan palabras huérfanas ("The") junto a la imagen | `wiki-articulo-mobile-float.jpg` |
| 2 | Wiki artículo (móvil) | 🔴 | La infobox (1 858 px de alto) se interpone entre el H1 y el primer párrafo: ~2 pantallas antes de leer | `wiki-articulo-mobile-top.jpg` |
| 3 | Landing hero (móvil) | 🔴 | Imagen y tarjeta "Último avistamiento" antes del titular; el H1 cae bajo el pliegue; la imagen choca con la barra de navegación; "BUSCAR" recortado | `landing-hero-mobile.jpg` |
| 4 | Landing hero | 🔴 | El buscador no hace nada (sin `onSearch`); la frase de marca de Boris está relegada a una cita; dos `<h1>`; emoji 🐳 como icono | `landing-hero-1440.jpg` |
| 5 | Wiki footer | 🔴 | `WikiFooter` conserva 3 iconos a `#`, enlaces de navegación a `#`, "Soporte Técnico nelsonmarro@dev.com", Privacidad/Términos muertos | `wiki-arena-1440.jpg` (pie) |
| 6 | Continuidad de marca | 🟡 | Dos cabeceras distintas; en la wiki móvil desaparece el nombre BorisaoBlois ("TERMINAL / ACCESO LORE") | `wiki-hub-mobile.jpg` |
| 7 | Wiki hub (móvil) | 🟡 | Banner de 900 px de texto antes de nada accionable; el explorador empieza a 3 300 px; filtros de 32 px sin nombre | `wiki-hub-mobile.jpg`, Lighthouse |
| 8 | Wiki explorador | 🟡 | Portadas oscuras/placeholder en directorios y organizaciones; "SIN IMAGEN"; 6 por página = 6 páginas; filtros no viven en la URL | `wiki-hub-1440.jpg` |
| 9 | Landing stats | 🟡 | Banda de 4 contadores (36/6/52/4) como segunda sección: patrón plantilla y cifras pequeñas | `landing-hero-1440.jpg` |
| 10 | Landing videos | 🟡 | Los dos shorts verticales van en marcos 16:9 con bandas negras | `landing-videos-1440.jpg` |
| 11 | Sistema visual landing | 🟡 | Radios 4rem/3rem/2.5rem fuera del sistema de 3 radios de la wiki; 35 eyebrows de 11 px; todo en italic-uppercase; 26 superficies con `backdrop-filter` | medición DOM |
| 12 | Sobre Boris | 🟡 | Copy inventado ("guardián de los archivos abisales…", "Código 343-B" a 8 px) en la única sección sobre el autor | `landing-hero-1440.jpg` |
| 13 | Tipografía | 🟢 | Inter para todo; una display face para H1/H2 reforzaría la marca sin perderla | — |
| 14 | Personajes / universos | 🟢 | Recortes de imagen sin punto focal (cabeza de Phillip cortada; Colosos casi negro) | `landing-personajes-1440.jpg`, `landing-universos-1440.jpg` |
| 15 | Arena | 🟢 | Sin URL compartible del enfrentamiento; sin prueba móvil | `wiki-arena-1440.jpg` |

Principio para todos los refactors: **conservar la esencia** (paleta, cristal en el chrome, display italic-uppercase, voz "DELIRIUM/archivo"), y gastarla con más intención: menos superficies de vidrio, más contenido de Boris, texto largo siempre sobre sólido.
