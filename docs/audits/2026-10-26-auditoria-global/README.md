# Auditoría global de calidad — 2026-10-26

Auditoría pedida por Nelson para revisar funcionalidad, UI, UX y responsividad de todos los apartados de la web, y para corregir los errores que estropeen la experiencia de los fans de Boris.

## Cómo se hizo

Seis auditores en paralelo recorrieron el build de producción con Playwright (Chrome del sistema), axe, rastreo de enlaces y revisión de código. Cada uno cubrió un área:

| | Área | Hallazgos |
|---|---|---|
| A1 | Landing, navbar, footer, formulario de contacto | 1 crítica, 1 alta, 3 medias, 1 baja |
| A2 | Hub de la wiki, explorador, menú lateral, paleta, registro, aleatorio | 3 altas, 6 medias, 5 bajas |
| A3 | Las 37 fichas (visor, índice, vista previa, relacionados, sellados) | 5 bajas |
| A4 | Versus Arena y `/comunidad` | 2 medias, 5 bajas |
| A5 | Barrido responsive (44 rutas × 9 tamaños), rastreo de enlaces y recursos, SEO | 1 alta, 4 medias, 4 bajas |
| A6 | Salud en ejecución, robustez y errores del log de Nelson en dev | 2 altas, 3 medias, 9 bajas |

Los informes con reproducciones, mediciones y causas están en `A1-report.md` … `A6-report.md`. El plan de arreglos y las decisiones están en `docs/superpowers/plans/2026-10-26-auditoria-global-arreglos.md`. Ocho implementadores arreglaron en paralelo archivos disjuntos. Después hubo una revisión final del código, una QA de regresión que repitió los scripts de los auditores y una segunda ronda de correcciones.

## Lo más grave que se arregló

- **El formulario de contacto no enviaba nada** (A1-1, crítica): mostraba «Mensaje enviado» sin hacer ninguna petición. Ahora:
  - envía de verdad;
  - impide el doble envío;
  - errores accesibles;
  - límite de 3 envíos por hora y red, y un campo trampa contra bots;
  - si falta la clave de Resend, un aviso amable.
- **Página 404 y de error:** antes eran las de Next, en inglés, sobre blanco y sin salida. Ahora están en español y con la marca. La 404 tiene buscador, Inicio, Archivo y Expediente aleatorio, y responde con un 404 real. La de error ofrece Reintentar y Recargar, que es el «Error in input stream» del log de Nelson en producción.
- **Explorador `/wiki`:**
  - la paginación ya no se sale de la pantalla en móvil;
  - si la consulta falla (por ejemplo, durante un deploy), muestra «No se pudo cargar el archivo · Reintentar» en lugar de «Ningún registro coincide»;
  - atrás y adelante deshacen los filtros.
- **Menús:**
  - el de la landing se cierra al pulsar sus anclas y su logo;
  - la hoja del menú de la wiki se cierra al navegar;
  - Comunidad aparece en el menú y en la cabecera de la wiki;
  - el scroll-spy funciona y no deja listeners colgados.
- **Arena:**
  - ya no muestra «X vs X» en la URL y el título mientras se ve otro rival;
  - selects y botones de 48 px;
  - radar legible a 320 px;
  - pestañas en una fila;
  - URL canónica;
  - sin error de hidratación.
- **Comunidad:**
  - el lunes del cambio de semana, la encuesta nueva ya no sale con slugs en bruto;
  - botón Reintentar cuando falla la red;
  - la fila de la criatura de la semana cabe a 320 px.
- **Rendimiento y logs:**
  - las imágenes LCP del primer pliegue van `eager` (era el aviso de `The_Bloop_fauces.webp`);
  - las miniaturas de YouTube no pasan por el optimizador, así que se acaban los 500 cuando el servidor no resuelve `i.ytimg.com`;
  - un fallo del RSS deja una sola línea en el log.
- **SEO y seguridad:**
  - `robots.txt`, `sitemap.xml` y manifest;
  - canonical, Open Graph y Twitter en todas las rutas, y títulos únicos;
  - cabeceras de seguridad, sin `X-Powered-By`;
  - Auth.js ya no pone cookies en las páginas públicas;
  - el explorador valida su entrada.
- **Accesibilidad:** contraste del sello del expediente, de la infobox y de los botones naranjas, y orden de títulos en los directorios.

## Resultado

- **QA de regresión:** 33 hallazgos arreglados, 0 sin arreglar y 0 regresiones. El barrido cubrió 352 cargas (44 rutas × 8 tamaños) sin desbordamiento horizontal, sin imágenes rotas y sin errores de consola. axe no da violaciones en `/`, `/wiki`, las 37 fichas, `/comunidad` y la Arena. Los 3 problemas nuevos que encontró se corrigieron en la segunda ronda.
- **Lighthouse (accesibilidad, buenas prácticas, SEO):** 100 sin auditorías fallidas en `/` (móvil), `/wiki` (escritorio), `/comunidad` (móvil) y la 404 (`404-390.webp`).
- `npm test` (227), lint, `check:content` y build en verde.

## Lo que queda (decisión D4 del plan)

- Una búsqueda solo de signos devuelve todo el archivo.
- Texto de 11 px en las etiquetas de la marca.
- El estado plegado del menú no se recuerda entre visitas: recordarlo volvería dinámico el layout.
- La entradilla de algunas fichas selladas se repite en el cuerpo: es contenido canónico.
- **Un stream RSC cortado muestra la página de error global sin el menú:** el fallo ocurre en el router, por encima de los layouts.

**Incidente durante la QA:** el `.env` local tiene la clave real de Resend. Al probar el formulario ya arreglado, el agente de regresión envió hasta 4 correos de prueba a la dirección `CONTACT_EMAIL` de ese `.env`. Desde entonces el servidor de QA arranca con una clave inválida (`re_qa_invalida`) y un destinatario `.invalid`.
