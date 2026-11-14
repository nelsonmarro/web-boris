# Pulido y móvil del panel (ola 4 de la auditoría)

Auditoría: `docs/audits/2026-11-13-panel-boris/README.md`, puntos #17–#21 y #23–#25 (#26 quedó resuelto en la ola 2).

## #17 Entrar directamente tras configurar la cuenta

- Al terminar `/admin/configurar` (contraseña nueva y código TOTP correcto), la propia acción abre una sesión nueva
  con el segundo factor. Ya no hay que salir, volver a entrar y esperar a que la app cambie de código.
- Cómo: un proveedor Credentials aparte (`admin-setup`) que solo acepta un **pase de un solo uso** firmado con
  `AUTH_SECRET` (`lib/setup-handoff.ts`, HMAC-SHA256 con `userId`, `sessionVersion` nueva y caducidad a 60 s). El pase
  se crea y se gasta dentro de la acción (nunca llega al navegador). `completeSetupLogin` exige además que la cuenta
  siga siendo administradora, tenga el 2FA activo y la misma `sessionVersion`. Si algo falla, se vuelve al
  comportamiento anterior (salir y entrar).

## #18 y #19 Imágenes con nombre legible y dónde se usan

- Las imágenes de la web se agrupan por universo y entidad («Colosos › The Bloop») con un nombre legible: el nombre
  del archivo sin guiones bajos, o «Foto del 22/05/2023» si es un nombre de cámara (`assetLabel`, `lib/media-labels.ts`).
- Cada imagen dice en qué fichas se usa (`imageRefs` + `usageByImage`, puras), en el selector y en la biblioteca. Las
  subidas cuentan borradores y versiones publicadas, como `mediaUsage`.
- En la biblioteca: fuera «Copiar ruta»; «Descripción de la imagen» explica para qué sirve; «Borrar» solo aparece en
  las que no usa ninguna ficha.

## #20 Encuadre visual

- La portada se muestra entera; al pulsar sobre ella se elige el punto que debe quedar a la vista (también con dos
  deslizadores, para teclado). Al lado, cómo queda el recorte en la tarjeta (16:9), en la cabecera del móvil (16:10)
  y en la del ordenador (21:9). «Centrar» quita el encuadre.
- `parsePosition` / `formatPosition` (`lib/focal-point.ts`, puras) leen los valores ya escritos («50% 12%», «center
  top»); uno que no se entienda se conserva y se muestra como texto.

## #21 Datos de la Arena numéricos

- Longitud, inteligencia, hostilidad, poder y defensa son campos numéricos con su rango (`min`, `max`, `step`). El
  peso explica que es el que usa la Arena (la ficha lateral lleva el suyo).

## Móvil (#23–#25)

- Cabecera del panel: en pantallas estrechas, una sola fila con «Panel de la wiki» y un botón «Menú» que despliega
  las secciones y la cuenta; se cierra al cambiar de página. La sección actual se marca (`aria-current`) también en
  escritorio.
- Zonas táctiles de al menos 40 px en los enlaces de texto del panel (avisos, «Cerrar», «Quitar filtros»…).
- La barra de «Texto completo» va en una sola fila desplazable en el móvil y el menú «Añadir» en dos columnas.
