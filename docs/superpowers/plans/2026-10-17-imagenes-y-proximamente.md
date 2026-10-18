# Ola 5 — Imágenes correctas y "Próximamente"

**Pedido (Nelson, 2026-10-17):** en la wiki hay imágenes que no tienen que ver con el apartado. Poner la imagen correcta; si no existe una imagen concreta, un placeholder genérico con el estilo de la web. Para lore o apartados sin información disponible, un placeholder "Próximamente".

**Fuentes:** catálogo visual de los 48 assets (cada imagen abierta y descrita) e inventario de los 60 usos de imagen en `src/content/` (`.superpowers/sdd/ola5-imagenes/`). Canon: `docs/Frases y descripciones.docx` y `docs/Requerimientos Pagina.pdf`.

## Bloque 1 — Componentes (hecho)

- `<WikiImage>` sin `src` → marcador "Imagen pendiente" con el mismo layout/alineación.
- `<Proximamente titulo? >texto?</Proximamente>` → bloque para apartados sin lore (registrado en `MdxRenderer.tsx` y `src/mdx-components.tsx`).
- Frontmatter `status: proximamente` → chip en cabecera y tarjeta + bloque Próximamente tras la descripción.
- Portada ausente o logo de marca → `CategoryPlaceholder` en ficha, ficha compacta, destacado, Arena y landing.

## Bloque 2 — Decisiones de imagen

Regla: solo se cambia lo que está mal (sujeto distinto al del apartado, pie de foto falso, diagrama/logo como portada). Lo correcto aunque mejorable se queda.

### Portadas (frontmatter `image`)

| Artículo | Hoy | Problema | Decisión |
|---|---|---|---|
| animales-colosos | EsquemaSeccionColosos (mapa del sitio) | diagrama de texto | `Otros/Avistamiento_coloso_helicoptero.webp` — "Avistamiento de un coloso en superficie" |
| colosos | EsquemaSeccionColosos | diagrama | `The_Bloop/The_Bloop_emergiendo_helicopteros.webp` — "The Bloop Ojo Solo, uno de los Colosos más documentados" |
| categorias-monstruos | EsquemaSeccionColosos | diagrama | sin imagen (placeholder) |
| titanes | EsquemaSeccionColosos | diagrama; no hay arte de ningún Titán | sin imagen |
| ipcaro / organizaciones / naciones-rebeldes | logo de la marca | no representa a la organización | sin imagen |
| delirium | `Phillip_Forte_secundaria` (un ojo, 935×576) | no representa a la organización | `Vehiculos/Aodos_AY01.webp` (lleva la insignia DELIRIUM) — "Sumergible Aodos AY01 con la insignia de DELIRIUM" |
| phillip-forte | `Phillip_Forte_retrato` (media cara) | mejorable | intercambiar con el inline: portada `Phillip_Forte.webp`, inline `Phillip_Forte_retrato.webp` |
| el-destello-de-los-colosos / libros-colosos | renders de Vlad Julia | el libro no está ligado a Vlad Julia | sin imagen |
| garddiodon-typus | `Diente_triangular_ilustracion` + pie inventado | el canon no atribuye ese diente | sin imagen, sin `imageCaption` |
| slowdown-criyote / phiscanula-arcticum | `Avistamiento_coloso_helicoptero` | criatura sin identificar (parece labodótipo) | sin imagen, sin `imageCaption` |
| piratas-galeon | `Borisao_2_F_(1)` (navío de línea) | es un buque de guerra, no pirata | sin imagen |
| navios-galeon | `Naves/IMG_20230522_130038` (= portada de capitan-de-galeon) | duplicado | `Borisao/Borisao_2_F_(1).webp` (navío de línea a lápiz) |
| cronologia-wwii | `ellosllegaron1` (solo el Ángel) | no muestra la guerra | `ellosllegaron2.webp` (cazas de la IIGM bajo el Ángel) |
| breegard | pie "franja naranja de DELIRIUM" | el canon no liga Breegard a DELIRIUM | mantener imagen; pie "Submarino Breegard: casco negro remachado con franja naranja" |

### Imágenes en el cuerpo

| Artículo · sección | Hoy | Decisión |
|---|---|---|
| the-bloop · Características (2.ª) | `The_Bloop_estudio_lapiz` = el mismo boceto que `Vlad_Julia_estudio_cuerpo` (otra criatura) | `The_Bloop_profundidades_drones.webp` — "Placas de piel irregulares en el dorso: un patrón único que lo identifica". Borrar el asset duplicado. |
| the-bloop · Personalidad | `The_Bloop_profundidades_drones` | `The_Bloop_sombra_barco_pequeno.webp` — "Curioso y confiado: The Bloop observa de cerca una lancha de pesca" |
| the-bloop · Historia conocida (galería) | barco pequeño + carguero + petrolero | carguero + petrolero |
| el-gran-maja · Descubrimiento (2.ª) | `Submarino_impacto_torpedo` (explosión en el submarino) | `Vehiculos/Submarinos_combate_torpedos.webp` (torpedos + drones, como en el canon) — "Recreación: andanada de torpedos guiados durante el ensayo del Golios 7" |
| el-gran-maja · La audición excepcional | `El_Gran_Maja_diente` (un diente en la sección del oído) | mover a Características Físicas, junto al párrafo de los dientes — "Estudio de un diente: largo, afilado y extremadamente resistente" |
| el-gran-maja · Conflicto con otras bestias | `El_Gran_Maja_superficie_amanecer` (bajo el agua, con un dron; pie "cerca de la superficie") | mover a Características Físicas, junto a "rastrearlo… es de las tareas más costosas para DELIRIUM" — "Un dron de rastreo sigue de cerca a El Gran Majá". En Conflicto: `<WikiImage>` sin `src` — "La batalla contra The Bloop Ojo Solo" |
| breegard · Registro operativo | galería de 3 submarinos que **no** son Breegard | `Vehiculos/Flota_submarina_ventanilla.webp` (sí muestra un Breegard) — "Un Breegard y un sumergible menor vistos desde una ventanilla" |
| vehiculos | — | galería con `Submarino_patrulla_abisal` e `Submarino_impacto_torpedo` (pies neutros) para no perder el arte de Boris |
| capitan-de-galeon · intro | `Borisao_2_F_(1)` con pie "El capitán inglés" (es un barco) | mantener imagen; alt/pie "Un navío de línea de la era náutica" |
| cronologia-wwii · línea de tiempo | `ellosllegaron1.1` con pie "conflictos de la guerra" (solo el Ángel) | mantener; pie "La aparición del Ángel: el cielo tapado como un velo" |
| el-angel · intro (2.ª) | `ellosllegaron3` = la misma que la portada | `ellosllegaron1.1.webp` — "El Ángel lo mira todo" |
| el-angel · intro (1.ª) | `ellosllegaron2`, pie "tapa el cielo como un velo" | pie "Cazas de la Segunda Guerra Mundial bajo la mirada del Ángel" |

## Bloque 3 — Lore sin información → "Próximamente"

Regla: el texto que no esté respaldado por el canon se quita; en su lugar, `<Proximamente />` (o `status: proximamente` si el artículo entero carece de canon). Lo canónico se conserva tal cual.

- Sin canon (→ `status: proximamente`): cael-cortes, aodos-ay01, el-destello-de-los-colosos, piratas-galeon (y las que la auditoría confirme).
- Canon escaso (→ conservar lo canónico + bloque Próximamente al final): bogbo, porcia-la-gris, breegard, navios-galeon, cronologia-wwii, naciones-rebeldes, libros-colosos, humanos-colosos…
- Corregir títulos con guion bajo: "Libros del Universo_Colosos", "Humanos del Universo_Colosos".

## Bloque 4 — Verificación

`npm run lint` · `npm run check:content` · `npm run build` · QA Chrome DevTools (1440 y 390): portada sin imagen, `WikiImage` sin src, bloque y chip Próximamente, tarjetas del listado, consola sin errores, red 200.
