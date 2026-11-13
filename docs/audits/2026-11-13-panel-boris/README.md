# Auditoría del panel /admin desde los ojos de Boris (2026-11-13)

Recorrido completo del panel en local, en el papel de Boris (no programa, conoce su lore y graba vídeos), sobre el build de producción de `main` (`39f1ff4`) con una base aislada. Escritorio a 1366 px y móvil a 390 px, con Chrome headless propio (`playwright-core`).

Flujo recorrido: primera entrada con la contraseña temporal → configurar contraseña y 2FA → códigos de recuperación → entrar con 2FA → buscar y editar una ficha (The Bloop) → guardar con Ctrl+S → vista previa → publicar → provocar errores → historial → descartar → crear una ficha nueva → portada con una foto del móvil → desclasificarla y publicarla → añadirla al menú → biblioteca de imágenes → listas de Contenido (novedades, votaciones, vídeos, orden de la historia, empieza por aquí) → todas las páginas en móvil.

**Lo que funciona bien**: el alta con 2FA se entiende; los mensajes de error están en lenguaje llano («Falta la descripción corta», «Las llaves { } con código no están permitidas»); publicar tarda ~150 ms y se ve en la web al momento; si no se puede publicar, el trabajo queda como borrador; la subida de imágenes (2,3 s para una foto de 4000 px) recodifica y quita el GPS; las votaciones pasadas están bloqueadas con su motivo; nada desborda en móvil y no hubo errores de consola.

## Fallos (P0)

| # | Dónde | Qué pasa | Arreglo |
|---|---|---|---|
| 1 | Contenido → Novedades | Recién abierta, sin tocar nada, dice **«Hay cambios sin publicar»** y avisa al salir de la página. Después de publicar sigue igual. | `ListShell` compara con `JSON.stringify`, que depende del orden de las claves: las novedades de los archivos llevan `id` al final (`readers.ts`) y Postgres (`jsonb`) reordena las claves al guardar. Comparar con una serialización canónica (claves ordenadas). |
| 2 | Portada / imágenes | El **nombre del archivo** se usa como texto alternativo y como pie de la portada: una foto «Foto del movil 2026.jpg» deja «Foto del movil 2026» como pie **visible en la web**. | No deducir el texto del nombre del archivo: pedir una descripción al subir (o dejarla vacía y que la comprobación de publicar la pida). |
| 3 | Inicio | El título dice **«Qué podrás editar»**, en futuro: es un resto de la fase 1 y hoy todo está disponible. | «Qué puedes editar», o mejor, sustituirlo por «Pendiente» (ver #13). |

Aparte, y solo para Nelson: el `AUTH_SECRET` del `.env` local tiene 30 caracteres (el mínimo es 32). Con él el panel queda cerrado en desarrollo y el login solo dice «Datos incorrectos». En producción no pasa: `setup-vps.sh` genera uno largo.

## Fricción alta (P1): lo que hará que Boris llame a Nelson

**4. El texto de la ficha es MDX en bruto.** Boris ve `<WikiImage src="/assets/Universo_Colosos/The_Bloop/…" alt="…" caption="…" align="right" />`, `<WikiGallery>` y `## ` en una caja monoespaciada de 32 rem con su propio scroll, dentro de una página de 4800 px. En la prueba, un párrafo añadido con Ctrl+Fin acabó **debajo de «Referencias»**, porque nada indica en qué apartado está el cursor. Es el mayor punto de dolor.
- *Propuesta*: editor **por apartados**. Cada `##` se convierte en una tarjeta con su título y su texto (párrafos, negrita, cursiva y enlaces). Las imágenes, citas, avisos y «Próximamente» son bloques visuales que se insertan, se mueven y se quitan con botones, sin etiquetas. Encaja con la ficha estándar (apartados fijos por tipo) y el MDX se sigue generando por debajo. Una pestaña «Avanzado» conserva el texto en bruto para Nelson.
- *Mínimo inmediato*: a la derecha del texto, un índice de apartados que lleve el cursor a cada uno, y la vista previa en vivo al lado en escritorio.

**5. «Enlace a ficha» inserta `[texto](/wiki/direccion-de-la-ficha)`.** Boris no conoce las direcciones. Debería abrir un buscador de fichas, igual que el de «Fichas relacionadas».

**6. Editar el menú lateral es inmanejable.** La página mide **9700 px en escritorio y 20 800 px en móvil**: cada entrada es un formulario completo (nombre, enlace, icono, subir, bajar, quitar, añadir dentro). Mover una ficha cinco puestos son cinco pulsaciones buscando su fila.
- *Propuesta*: árbol compacto, una línea por entrada con su icono, y los grupos plegables (cerrados por defecto). La entrada se edita al pulsarla. Se ordena arrastrando y también con teclado.

**7. Una ficha nueva no aparece en el menú hasta que se va a otra pantalla.** La guía lo explica, pero es un paso que se olvida.
- *Propuesta*: tras publicar una ficha que no está en el menú, mostrar el aviso «Esta ficha no sale en el menú lateral» y un selector «¿Dónde va?». Ese selector tendría el destino ya sugerido según la categoría (Coloso → Personajes, Especie → Especies…). Hoy ofrece 13 destinos sin sugerir ninguno.

**8. Los errores al publicar no dicen dónde.** Aparecen en una lista arriba («Texto de la ficha: En `<div>`, el atributo «onclick» no está permitido»), pero no llevan al campo ni marcan la línea. Cada error debería ser un enlace que lleve y enfoque su campo, y el campo debería quedar marcado.

**9. Tras publicar no hay «Ver en la web».** El aviso dice «Publicada. Ya se ve en la web.», pero no enlaza a la ficha. Añadir el enlace al aviso.

**10. La vista previa exige guardar antes y se abre en otra pestaña.** «Guarda para ver la vista previa» es un paso de más. Que el botón esté siempre disponible y guarde el borrador al pulsarlo, o la vista previa en vivo de #4.

**11. El buscador de Fichas es literal.** «el bloop» da 0 resultados (la ficha se llama «The Bloop Ojo Solo»). La wiki ya tiene una búsqueda tolerante (`src/core/search/search`: palabras en cualquier orden, apodos y erratas) que el panel no usa.

**12. El listado de fichas es una lista plana de 39.** No hay filtros (universo, sellada, con borrador sin publicar, creada en el panel), no hay miniaturas, y la etiqueta «Original» no le dice nada a Boris. Hacen falta filtros con chips, una miniatura de la portada y etiquetas en su idioma: «Sin cambios», «Editada», «Borrador pendiente», «Nueva», «Retirada».

**13. La pantalla de inicio no dice qué hay pendiente.** Hoy muestra cinco tarjetas de navegación (repiten el menú) y una «Actividad reciente» que en la prueba eran casi solo entradas al panel. Lo útil sería:
- borradores sin publicar;
- fichas que no salen en el menú;
- si la votación de la semana que viene está elegida;
- las últimas fichas editadas.

**14. Las horas están en UTC.** Así salen en la actividad, el historial («a las 20:51 UTC») y las votaciones («empieza el lunes a las 00:00 UTC»). Para Boris son horas que no corresponden a su reloj: mostrarlas en su hora local, y dejar UTC solo donde es la regla (el cambio de semana), con su equivalencia local.

## Fricción media (P2)

**Alta y entrada**
- 15. **Códigos de recuperación** sin «Copiar», «Descargar .txt» ni «Imprimir»; solo «Ya los guardé». La gente los pierde.
- 16. Si el código de 6 dígitos falla al configurar, **se borran las dos contraseñas** y hay que escribirlas otra vez.
- 17. Tras configurar, obliga a **entrar otra vez** y esperar a que la app cambie de código. Podría entrar directamente, ya que acaba de demostrar el 2FA.

**Imágenes**
- 18. En el selector, las imágenes de la web se nombran por su ruta (`Universo_Capitán_de_Galeón/Naves/IMG_20230522_130038.webp`). Habría que agruparlas por universo o ficha y mostrar un nombre legible.
- 19. «Copiar ruta» y «Texto alternativo por defecto» son jerga. Proponemos «Descripción de la imagen (la leen quienes no pueden verla y los buscadores)». Además, cada imagen debería mostrar en qué fichas se usa (el dato ya existe: `mediaUsage`).
- 20. **Encuadre** es un texto libre («50% 12%»). Sería mejor pulsar sobre la miniatura para elegir el punto que debe quedar a la vista, viendo el recorte de la tarjeta y de la cabecera.
- 21. **Datos de la Arena** van en campos de texto libres: deberían ser campos numéricos con su rango (o deslizadores). El «Peso» se repite con la ficha lateral.

**Seguridad ante errores**
- 22. «Quitar sección» (ficha lateral), «Quitar» en las listas y «Quitar» en el menú actúan sin confirmar y sin deshacer. Basta con un aviso «Quitada · Deshacer» durante unos segundos.

**Móvil**
- 23. La cabecera del panel mide 141 px y ocupa tres filas. En móvil debería ser un menú compacto.
- 24. El listado de fichas tiene 39 zonas táctiles de menos de 40 px de alto.
- 25. Los 10 botones del texto ocupan cuatro filas.
- 26. La caja de texto tiene su propio scroll dentro de la página: en el móvil es fácil quedar atrapado en ella.

## Plan propuesto

1. **Ola 1, fallos y arreglos rápidos (pequeña)**: #1, #2, #3, #5, #8, #9, #11, #14, #15, #16 y #22.
2. **Ola 2, el texto de la ficha (grande)**: #4 (editor por apartados con bloques visuales y vista previa en vivo) y #10.
3. **Ola 3, menú y orientación**: #6 (árbol compacto), #7 (añadir al menú desde la ficha), #12 (filtros y estados) y #13 (inicio con lo pendiente).
4. **Ola 4, pulido**: #17–#21 y el móvil (#23–#26).

Capturas y scripts del recorrido: en el scratchpad de la sesión (`boris1.mts` … `boris5.mts`); se pueden repetir con la misma receta (base aislada con `COMPOSE_PROJECT_NAME`, servidor con `RESEND_API_KEY=re_qa_invalida` y un `AUTH_SECRET` temporal).
