# Auditoría de extremo a extremo del panel `/admin` (2026-11-16)

Pruebas en Chrome contra `main` (`860df0f`) sobre una base nueva, empezando por el primer acceso de una cuenta recién
creada, con flujos poco habituales y casos límite, más una revisión de seguridad del código hecha en paralelo. El
panel aguanta bien el uso normal; los problemas aparecen al **retirar fichas** que están en listas, en la **subida de
fotos en producción** y en la **gestión de la propia cuenta**.

Resumen:

| Prioridad | Qué | Dónde se nota |
|---|---|---|
| **P0** | nginx corta las subidas de más de 1 MB | Producción: casi cualquier foto del móvil |
| **P0** | Una ficha retirada sigue en el menú público y bloquea las listas | Web pública (enlaces 404) y panel |
| P1 | `rel="opener"` en enlaces del texto (tabnabbing) | Web pública |
| P1 | «Cerrar sesión» no invalida la sesión | Seguridad |
| P1 | Se puede bloquear el acceso de Boris desde fuera | Seguridad |
| P1 | La contraseña temporal no caduca | Seguridad |
| P2 | No hay página «Mi cuenta» (contraseña, códigos, sesiones) | Panel |
| P2 | Varios avisos confusos o en inglés | Panel |
| — | Next.js 16.4.3 con un aviso moderado | Dependencias |

## P0 — Antes de entregar

### 1. nginx rechaza las fotos de más de 1 MB

`deploy/nginx/web-boris.conf` tenía `client_max_body_size 1m` para todo el sitio, y el panel acepta imágenes de hasta
20 MB. En local una foto de 3,8 MB se sube en 3 s (queda en 677 KB); en producción nginx respondería **413** antes de
llegar a la app y el panel mostraría un error genérico.

**Arreglado en el repositorio** (este PR): un bloque `location = /api/admin/media` con `client_max_body_size 21m`. El
VPS **no** se actualiza solo con `deploy.sh`: hay que copiar el bloque a mano (ver `docs/deploy/entrega-boris.md`).

### 2. Retirar una ficha que está en el menú o en una lista

Flujo probado: ficha nueva → en el menú, en «Empieza por aquí», como relacionada de The Bloop y en una votación futura →
**Retirar de la web**.

| Qué | Resultado |
|---|---|
| `/wiki/<ficha>` | 404 (correcto) |
| Relacionadas de otras fichas | Se filtra (correcto) |
| «Empieza por aquí» en la web | Se filtra (correcto) |
| **Menú lateral público** | **Sigue enlazándola en todas las páginas de la wiki → 404** |
| Editor del menú | No avisa al abrir; **no deja publicar ningún cambio** hasta quitar la entrada (el aviso dice cuál) |
| Editor de «Empieza por aquí» | **La ficha no aparece**, pero no deja publicar: «"ficha-e2e" no existe». **Callejón sin salida** |
| Editor de votaciones | La ficha sale como «Elige una ficha»; aviso técnico «2026-W48: "ficha-e2e" no existe» |
| Inicio del panel | «Todas las fichas salen en el menú» y «Elegida: ficha-e2e contra Bogbo» (la dirección, no el nombre) |
| Al pulsar «Retirar» | No avisa de dónde se usa la ficha |

Propuesta:
- Al retirar, avisar de dónde aparece (menú, «Empieza por aquí», votaciones futuras, relacionadas) y ofrecer quitarla
  de todas esas listas en el mismo paso.
- La web pública no pinta en el menú entradas a fichas que no existen (red de seguridad).
- Los editores de listas muestran las entradas huérfanas marcadas («Ficha retirada») con su botón «Quitar», y avisan al
  abrir.
- El inicio cuenta las entradas del menú que apuntan a fichas retiradas como pendiente.

## P1 — Seguridad

### 3. `rel="opener"` en enlaces del texto (confirmado en el navegador)

`<a href="https://…" rel="opener" target="_blank">` en «Texto completo» se publica tal cual: el `{...props}` del `a` de
`MdxRenderer.tsx` va después de `rel="noopener noreferrer"` y lo sustituye, y el filtro (`remark-safe-mdx.ts`) deja
pasar `rel`, `target` y `ping`. La página de destino recibe `window.opener` y puede cambiar la pestaña de la wiki por una
falsa. Requiere una cuenta del panel. **Arreglo:** prohibir `rel`, `target` y `ping` en el filtro, o poner `{...props}`
antes en el override.

### 4. «Cerrar sesión» no invalida la sesión (confirmado en el navegador)

La sesión es un JWT de 12 h y `logoutAction` solo borra la cookie: una cookie copiada antes de cerrar sesión sigue
entrando. **Arreglo:** subir `sessionVersion` al cerrar sesión (cierra también las demás sesiones, aceptable).

### 5. Se puede bloquear el acceso de Boris desde fuera

`lockout.ts` tiene, además del tope por red, un tope global de 40 fallos por cuenta en 15 min. Desde 5 redes (un /56 de
IPv6 basta) se alcanza y, como los intentos frenados no cuentan, basta repetirlo cada 15 min para dejarle fuera con su
contraseña y su código correctos. **Arreglo:** no aplicar el tope global a redes desde las que esa cuenta ya entró
(`login.ok` reciente con ese `ipHash`), o cambiar el bloqueo global por un retardo creciente.

### 6. La contraseña temporal no caduca

Si se filtra, quien la use primero configura su propio 2FA y se queda la cuenta, sin límite de tiempo mientras Boris no
la haya configurado. **Arreglo:** caducidad de 48–72 h; mientras tanto, **hacer el primer acceso de Boris el mismo día**
en que se crea la cuenta (ver la guía de entrega).

### 7. Menores

- Tras el bloqueo, una cuenta existente responde sin calcular el hash y una inexistente tarda ~100 ms más: revela qué
  correos tienen cuenta. Calcular el hash de relleno también en la rama frenada.
- Contenedor: todo `/app` pertenece a `node` (una ejecución remota podría reescribir el código hasta el siguiente
  despliegue); faltan `read_only`, `cap_drop: [ALL]` y `no-new-privileges` en el compose.
- `AUTH_SECRET` lo usa todo (sesión, TOTP, HMAC, revalidación): bien separado por contexto, pero rotarlo obliga a
  `--reset` de las cuentas.

## P2 — Facilidad de uso, UI y responsividad

1. **No hay página «Mi cuenta».** Boris no puede cambiar su contraseña, ver cuántos códigos de recuperación le quedan,
   generar códigos nuevos ni cerrar sesión en otros dispositivos: todo pasa por `admin-create.sh --reset`.
2. **Entrar con un código de recuperación no avisa** de que se gastó ni de cuántos quedan.
3. **Bloqueado = «Datos incorrectos».** Con la cuenta frenada, aun con contraseña y código correctos, sale el mismo
   mensaje: Boris no sabe si se equivoca o si tiene que esperar. Para el freno por red, decir «Demasiados intentos desde
   esta conexión: espera 15 minutos» no revela nada.
4. **«Quitar el universo» sin confirmación.** Un clic quita un universo con todas sus entradas (34 fichas) del editor;
   solo hay «Deshacer» unos segundos (no llega a la web hasta «Publicar»). Pedir confirmación cuando tiene entradas.
5. **Mensajes técnicos en inglés:** un MDX mal cerrado muestra «Expected a closing tag for `<WikiQuote>` (14:1-14:12)
   before the end of `paragraph`»; una novedad sin título, «Too small: expected string to have >=3 characters».
6. **«Vista previa al lado» aparece en el móvil y no hace nada:** la clase `inline-flex` de `SMALL_BUTTON` gana a
   `hidden` (`ArticleEditor.tsx`).
7. **Objetivos táctiles pequeños:** «Ver la web» de la cabecera (79×16 px) y los enlaces de texto de las listas del
   inicio y de «Contenido» (~20 px de alto). El resto mide ≥ 40 px.
8. La validación de longitud del navegador convive con el aviso anterior («no coinciden») sin limpiarlo.

## Comprobado y correcto

- **Primer acceso:** contraseña temporal → configurar (contraseñas distintas, corta, igual a la temporal y código
  caducado dan avisos claros) → 10 códigos con Copiar / Descargar / Imprimir → entra directo. El QR no cambia al
  recargar. Con la cuenta a medio configurar, cualquier página del panel lleva a `/admin/configurar`.
- **Acceso:** correo en mayúsculas o con espacios, código de recuperación en minúsculas y sin guion (y de un solo uso),
  mismo mensaje para correo inexistente y contraseña mala, «atrás» tras cerrar sesión no muestra el panel, las capturas
  del manual no se sirven sin sesión.
- **Fichas:** crear → desclasificar pide solo lo que falta y lleva a cada campo → publicar → «Añadir al menú» → datos de
  la Arena → relacionada → retirar → volver a mostrar restaura todo (página, menú, sitemap).
- **Filtro del texto:** bloquea `<script>`, `<img onerror>`, llaves `{ }` y `javascript:`; los títulos con HTML se
  escapan.
- **Imágenes:** un archivo que no es imagen se rechaza con «El archivo no es una imagen válida»; las fotos grandes se
  reducen a 2560 px.
- **Responsividad:** ninguna de las 13 pantallas del panel desborda a 390 px ni a 768 px.
- **Accesibilidad:** axe-core (WCAG 2.1 AA) sin incumplimientos en inicio, fichas, editor, imágenes, menú, votaciones,
  ayuda y acceso.
- **Revisión de código:** todas las acciones y páginas pasan por `requireAdmin()` (salvo las de acceso, a propósito);
  sin inyección SQL ni path traversal; subida recodificada con sharp y servida con CSP `sandbox`; TOTP con
  antirrepetición atómica; pase de configuración de un solo uso; sin redirecciones abiertas.

## Dependencias

`npm audit`: 13 avisos moderados, ninguno alto ni crítico. El de Next.js (GHSA-mfr8-8qww-v76h, 16.3.0–16.4.4: fuga de
información con `'use cache'` dentro de `unstable_cache()`) **no es explotable aquí** (el proyecto no usa ninguno de los
dos), pero conviene subir `next` a **16.4.6** antes de desplegar. El resto son herramientas de desarrollo (eslint,
shadcn, typography). Next 16.4.3 corta `next build` solo cuando detecta un agente de IA (`AI_AGENT`); en Docker no.

## Estado

- **Hecho** (rama `fix/panel-antes-de-entregar`): nginx en el repo; retirada de fichas (menú público sin fichas
  retiradas, listas que no se bloquean, editores que las marcan, aviso antes de retirar, nombres en el inicio);
  `rel`/`target`/`ping` prohibidos; «Cerrar sesión» sube `sessionVersion`; mensaje propio del freno (y hash de
  relleno también en la rama frenada); «Vista previa al lado» oculta en el móvil.
- **Pendiente:** «Mi cuenta», tope global del bloqueo, caducidad de la temporal, mensajes en inglés, confirmación al
  quitar un universo, objetivos táctiles, endurecimiento del contenedor y Next 16.4.6.

## Orden propuesto

1. **Antes de desplegar:** nginx (hecho en el repo; copiar al VPS) y Next 16.4.6.
2. **Antes de entregar a Boris (una tanda):** retirada de fichas (P0-2), `rel="opener"`, cerrar sesión que invalida,
   mensaje de bloqueo y «Vista previa al lado» en el móvil.
3. **Después:** «Mi cuenta», tope global del bloqueo, caducidad de la temporal, mensajes en inglés, confirmación al
   quitar un universo, objetivos táctiles y endurecimiento del contenedor.
