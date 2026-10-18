# Auditoría de experiencia del fan — landing + wiki (2026-10-18)

**Persona:** fan de BorisaoBlois que acaba de ver "Colosos 3: Tráiler oficial" en YouTube, entra desde el móvil por primera vez, quiere leer sobre sus personajes favoritos (Phillip Forte, El Gran Majá), descubrir otros y engancharse con el lore.

**Método:**
- Recorrido real sobre el build de producción (`next start -p 3131`, `main` @ `b0ea9e1`) con Chrome DevTools: primero móvil (390 × 844), luego escritorio (1440 × 900).
- Dos estudios de apoyo, incluidos aquí como anexos en inglés:
  - inventario de contenido, enlaces, navegación y búsqueda ([`anexo-ia-contenido.md`](anexo-ia-contenido.md));
  - benchmark de cómo enganchan Wookieepedia, SCP, Subnautica, Hollow Knight, League of Legends Universe, Ishtar Collective, Bulbapedia y Wikizilla ([`anexo-benchmark-enganche.md`](anexo-benchmark-enganche.md)).

**Regla que limita todas las propuestas:** solo canon. Nada de lo propuesto escribe lore nuevo; o es estructura, navegación, presentación o interacción, o se marca como **"necesita a Boris"**.

## Lo que ya engancha (proteger)

- **El Gran Majá es un artículo modélico:** ficha compacta arriba ("Ficha completa" desplegable), contenido plegado, 1 183 palabras de lore real y 6 imágenes con pie.
- **La Versus Arena** es lo más memorable: probabilidad, radar, fichas, botón "Compartir enfrentamiento" y enlaces a las fichas.
- **La paleta ⌘K** es la mejor búsqueda del sitio: ignora tildes ("maja" → El Gran Majá), muestra miniaturas, ordena por relevancia y también encuentra por descripción (`09-paleta-cmdk.webp`).
- **El mosaico** pone la criatura de la semana, la Arena y la encuesta en la primera pantalla de la wiki.
- **"Personajes destacados"** con retratos completos (Phillip se ve entero) es el gancho visual más fuerte de la landing.

## El recorrido del fan, momento a momento

| Momento | Qué hace el fan | Qué encuentra | Fricción |
|---|---|---|---|
| 1. Llega | Abre la landing en el móvil | Primera pantalla solo de texto: título, párrafo, buscador y botón. La primera imagen asoma abajo (`01`) | Ningún personaje ni criatura reconocible del vídeo |
| 2. Busca a su favorito | Escribe "phillip" | Primero sale el directorio "Humanos del Universo Colosos" con media cara recortada; su ficha es la 2.ª (`02`) | El nombre exacto no va primero |
| 3. Lee | Abre Phillip Forte | Retrato recortado (ceja, ojo y nariz), 165 palabras, menciona El Gran Majá, DELIRIUM e IPCARO **sin enlaces** (`03`) | Callejón sin salida |
| 4. Quiere más | Baja hasta "Archivos relacionados" | Cael Cortés (Próximamente), un directorio, Aodos AY01 (Próximamente) y Bogbo, en tarjetas de ~370 px cada una | Lo relacionado no está relacionado |
| 5. Prueba otra ruta | Abre el menú de la wiki | El panel del menú no tiene fondo: los enlaces flotan sobre el artículo borroso (`05`) | Cuesta leer el menú |
| 6. Va al explorador | Abre la portada de la wiki | Orden alfabético: primero un directorio, luego un "Próximamente", luego Bogbo… (`06`) | Lo primero que ve es lo más vacío |
| 7. Busca "bloop solo" | — | "Ningún registro coincide con la búsqueda" y nada más (`08`) | Callejón sin salida |
| 8. Vuelve a la landing | Busca más personajes | Los 3 personajes destacados están a ~5 000 px, detrás de un bloque de universos de 2 932 px que repite lo que ya muestra el mosaico (`07`) | El mejor gancho queda enterrado |
| 9. Ve el vídeo de la batalla | "The Bloop vs El Gran Majá – La Batalla" | El vídeo no enlaza a las fichas ni a la Arena, y las fichas no dicen en qué vídeos salen (`10`) | Canal y wiki desconectados |

## Hallazgos priorizados

🔴 = rompe el recorrido · 🟡 = frena el descubrimiento · 🟢 = oportunidad de enganche. Coste: S (horas) · M (1–2 días) · L.

| # | Sev. | Hallazgo | Evidencia | Propuesta | Coste |
|---|---|---|---|---|---|
| 1 | 🔴 | El menú lateral de la wiki en móvil (panel de 293 px) tiene fondo transparente: los enlaces se leen sobre el artículo borroso. Su título accesible está en inglés ("Sidebar / Displays the mobile sidebar") | `05`; fondo computado `rgba(0,0,0,0)` | Panel sólido `#061a2e` con borde, y título y descripción accesibles en español | S |
| 2 | 🔴 | Las fichas protagonistas son callejones sin salida: 9 páginas principales (Majá, Bloop, Phillip, DELIRIUM, Bogbo, Vlad Julia, Le'Mug, Criyonte, Porcia) tienen **0 enlaces** en el cuerpo. Los nombres van en **negrita** (parecen enlaces) pero no llevan a ninguna parte, aunque la ficha exista | `04`; anexo IA §2 | Enlazar la primera mención de cada entidad que ya tiene ficha (marcado, sin texto nuevo). Opcional: un plugin remark que autoenlace títulos y alias conocidos, con lista de exclusiones | S–M |
| 3 | 🔴 | "Archivos relacionados" muestra siempre los mismos 4 animales (por orden del menú). Le'Mug y Porcia nunca aparecen. A Phillip le salen 2 "Próximamente", un directorio y Bogbo. No hay relaciones reales (Majá ↔ Supperbial anguilla, Phillip ↔ DELIRIUM/IPCARO) | `03`; anexo IA §3 | `related:` curado en el frontmatter; los "Próximamente" van al final; rotar entre hermanos; mezclar tipos (criatura, especie, organización) | M |
| 4 | 🔴 | Hay tres buscadores con tres comportamientos distintos. El de la landing y el del explorador no ordenan por relevancia (el directorio sale antes que Phillip) y exigen el orden exacto de las palabras ("bloop solo" da 0). Ninguno conoce los alias canónicos ("Cranioplanus", "anguila sonriente", "el pez cangrejo", "Señora de la Prole"). Sin resultados no se ofrece nada | `02`, `08`; anexo IA §4 | Un único motor (el de ⌘K, mejorado) para los tres: tokens en cualquier orden, ranking por título, `aliases:` desde el canon, búsqueda también en la ficha. Estado vacío con criaturas populares y "limpiar filtros". ⌘K también en la landing | M |
| 5 | 🔴 | Primera impresión en móvil: la primera pantalla es solo texto. La landing mide 12 909 px. Los universos salen dos veces (4 tiles en el mosaico + sección de 2 932 px con tarjetas que ocultan la sinopsis tras "toca para ver"). Los personajes aparecen a ~5 000 px y son solo 3, sin "ver todos" | `01`, `07` | En móvil, la criatura de la semana con imagen en la primera pantalla y una tira deslizable de personajes justo debajo; reducir la sección de universos a una fila o fusionarla con las tiles; añadir "Todos los personajes" (explorador filtrado) | M |
| 6 | 🟡 | La ficha de Phillip no tiene retrato arriba: la imagen del cuerpo está recortada a media cara, mientras la landing usa su retrato completo. Faltan portadas en Le'Mug, Slowdown Criyonte, Garddiodon, Lampasiteras, IPCARO y Phiscanula | `03`; anexo IA §7 | Imagen principal con `imagePosition` arriba del artículo en móvil; corregir el encuadre de Phillip; pedir portadas a Boris | S + Boris |
| 7 | 🟡 | Canal y wiki desconectados: el vídeo de la batalla no lleva a las fichas ni a la Arena, y las fichas no muestran "Aparece en" | `10` | `videos:` en el frontmatter → bloque "Aparece en" en la ficha; cada tarjeta de vídeo con "Lee el expediente" / "Recrea el duelo en la Arena". El mapa vídeo → entidad es un hecho, no lore (validar con Boris) | S–M |
| 8 | 🟡 | Las fichas con `stats` no invitan a la Arena (solo existe el enlace del menú) | anexo IA §7 | Botón "Enfrentar en la Arena" en las 6 fichas con stats, que abra `/wiki/arena?a=<slug>` | S |
| 9 | 🟡 | Los "Próximamente" ensucian el descubrimiento: abren el explorador y la paleta (orden alfabético), salen en relacionados y cuentan en "37 expedientes" | `06`; anexo IA §8 | Orden por defecto "más completos primero" (portada + stats + palabras); los Próximamente al final, en una balda "En camino"; chip en la paleta; contadores que los separen | S |
| 10 | 🟡 | Huecos en el menú: los títulos de grupo solo despliegan (no enlazan a su directorio); faltan Cael Cortés, Especies, Organizaciones, Vehículos y Categorías; "Libros" está truncado ("El Destello de los Colos…") y apunta a otra página; "Personajes" contiene "Animales" | anexo IA §2 | Grupos enlazables a su directorio, entradas que faltan, etiqueta y destino de Libros corregidos | S |
| 11 | 🟡 | Los artículos largos desorientan en móvil: El Gran Majá mide 13 465 px; el índice solo está arriba (plegado); no hay barra de progreso ni "volver arriba"; cada tarjeta relacionada ocupa ~370 px (5 ≈ 1 800 px); hay ~200 px vacíos antes del pie | anexo IA; captura completa | Chip flotante "Contenido" con el apartado actual y barra de progreso; relacionados en carrusel horizontal o filas compactas; quitar el hueco | S–M |
| 12 | 🟡 | Tocar una foto abre el archivo `.webp` suelto en otra pestaña: el fan sale del sitio | recorrido | Visor dentro de la página con pie, deslizar entre las imágenes del artículo y cerrar con atrás o Esc | M |
| 13 | 🟡 | Capitán de Galeón (3 artículos, 1 vacío), Ellos Llegaron (2) y La Hecatombe (1, Próximamente) no tienen enlaces entre sí ni personajes; su "página de universo" es una lista filtrada | anexo IA §2, §5 | Portada de universo con estructura (sinopsis canon, secciones y esqueleto Próximamente) y enlaces entre esas páginas. Personajes y lugares: **necesita a Boris** | M + Boris |
| 14 | 🟢 | "Próximamente" se vive como un muro, no como intriga | benchmark F | Esqueleto visible de los apartados con "Pendiente de registro"; medidor "Archivo 3/6"; índice público "Registro pendiente: N entradas"; encuesta "¿Qué expediente quieres que se desclasifique primero?" (solo opciones Próximamente reales). Nunca insinuar trama | M |
| 15 | 🟢 | Faltan bucles de descubrimiento | benchmark 8, 12, 6 | "Expediente aleatorio"; "Siguiente en Colosos ›" al final de cada ficha; registro tipo Pokédex "Has visto 12/37 expedientes" (localStorage, sin cuentas); destacar el "Comparador de escala" de la Arena (el tamaño es el gancho número uno con monstruos gigantes); "Novedades del archivo" en la portada de la wiki | M |
| 16 | 🟢 | Deriva de nombres y categorías: `slowdown-criyote` frente a "Criyonte"; "The Bloop Ojo Solo" frente a "The Bloop"; Fiscánula frente a Phiscanula. El filtro de categorías mezcla 12 valores (Directorio, Categoría, Historia, Entidad… en singular, mientras las tiles van en plural) | anexo IA §6 | `aliases:` y redirección de slug; separar "tipo" (Personaje, Especie, Organización, Vehículo, Historia) de "tamaño" (Coloso, Titán, Mediano); ocultar los directorios del filtro; confirmar con Boris las grafías | S + Boris |
| 17 | 🟢 | Hay dos logos juntos en la cabecera de la wiki en escritorio (el del menú lateral y el de la cabecera) | `08` | Mostrar solo uno cuando el menú está abierto | S |

## Propuesta de olas

1. **Ola A — Arreglos rápidos (S):** #1, #8, #9, #10, #17, más el encuadre de Phillip (#6). Arregla lo roto sin rediseñar.
2. **Ola B — Descubrimiento (M):** #2, #3, #4, #11 y #12. Ningún clic termina en un callejón sin salida.
3. **Ola C — Enganche (M):** #5, #7, #14, #15 y #16. Más ganas de volver y de compartir.
4. **Contenido de Boris (en paralelo, #41):**
   - frases canónicas: el docx tiene la "Frase principal" vacía y hay 0 `WikiQuote` en los 37 artículos;
   - portadas que faltan;
   - personajes y lugares de Capitán de Galeón y Ellos Llegaron;
   - el mapa vídeo → criatura;
   - las grafías dudosas.

Las capturas `01`–`11` de esta carpeta son la evidencia, numeradas como en el recorrido. Los datos de inventario (portada, stats, palabras, enlaces de entrada y salida por artículo) están en el anexo IA §1.
