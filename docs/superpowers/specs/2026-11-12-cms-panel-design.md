# CMS: panel propio en `/admin` para que Boris edite la wiki

Fecha: 2026-11-12 · Estado: aprobado por Nelson (arquitectura, login y publicación) · Épica: CMS

## 1. Objetivo

Boris edita **él mismo** todo el contenido de la web (fichas, novedades, votaciones, vídeos, menú) desde un panel,
sin tocar Git ni esperar un despliegue. Lo publicado sale en la web en segundos y siempre se puede volver atrás.

## 2. Decisiones

| Tema | Decisión | Por qué |
| --- | --- | --- |
| Arquitectura | Panel propio dentro de la app, en `/admin` | Ya existen el punto de cambio (`getContentRepository`), Prisma, Auth.js, los schemas Zod y `validate.ts`. |
| Login | Correo + contraseña + código TOTP (2FA) | Decisión de Nelson. Sin registro público: las cuentas se crean por consola en el servidor. |
| Publicación | Borrador → vista previa → «Publicar» (Boris) | Autonomía de Boris con red de seguridad: historial y «Restaurar». |

### Alternativas descartadas (investigación del 2026-11-12, Context7 + web)

- **Keystatic 0.6.9** (Git): sigue en 0.x con *peers* fijados de `react-aria`; en modo GitHub Boris necesita cuenta
  con escritura en el repo; cada cambio exige reconstruir la imagen (minutos) y un despliegue automático con SSH al
  VPS; no tiene campo «mapa» para el `infobox` actual.
- **Payload 3.93** (soporta Next 16.2.6+): trae Drizzle junto a Prisma, su propio login y Lexical en lugar de MDX;
  obligaría a migrar las fichas y reescribir renderizado, búsqueda y `check:content`.
- **TinaCMS**: edición visual, pero depende de Tina Cloud o de autoalojar su backend, y también publica vía Git.

## 3. Modelo de datos (Prisma, migraciones nuevas)

Los archivos de `src/content` **siguen siendo la base** (semilla y respaldo). La base de datos guarda solo lo que
Boris cambia, como una capa encima:

- `CmsDocument { id, kind, key, draft Json?, published Json?, deleted Boolean, publishedAt?, updatedAt, updatedById }`
  con `@@unique([kind, key])`. `kind`: `article` (key = slug; datos `{ frontmatter, content }`), y en fases
  posteriores `news`, `polls`, `videos`, `navigation`, `storyOrder`.
- `CmsVersion { id, documentId, data Json, createdAt, authorId, note? }`: una fila por publicación (historial).
- `AdminAuditLog { id, userId?, action, target?, ip?, createdAt }`: entradas, publicaciones, restauraciones, fallos.
- `User` gana: `passwordHash`, `totpSecret` (cifrado), `totpEnabledAt`, `totpLastStep`, `role` (`admin`) y
  `sessionVersion`. `AdminRecoveryCode { id, userId, codeHash, usedAt? }`.

`CmsContentRepository` implementa `ContentRepository` como **superposición**: documento publicado en la base → gana;
si no, el archivo; `deleted` oculta el archivo. Si la base no responde, registra una línea y sirve los archivos: la
web pública nunca depende de que la base esté viva.

## 4. Seguridad (requisitos, no opciones)

1. **Acceso.** Contraseña con `scrypt` de `node:crypto` (N=2^17, r=8, p=1, sal de 16 bytes, comparación en tiempo
   constante); ≥ 12 caracteres. TOTP RFC 6238 (SHA-1, 6 dígitos, 30 s, ventana ±1), con el secreto cifrado
   AES-256-GCM (clave derivada de `AUTH_SECRET` con HKDF) y sin reutilizar un código ya aceptado. 10 códigos de
   recuperación de un solo uso (solo su hash). El 2FA es obligatorio: sin activarlo no se entra al panel.
2. **Fuerza bruta.** Los fallos se cuentan en `AdminAuditLog` en una ventana de 15 min: 8 de una misma red contra
   una cuenta, 20 de una red contra cualquier cuenta y 40 contra una cuenta desde cualquier red. El bloqueo **no** es
   de la cuenta entera: el correo de Boris es público y cualquiera podría dejarlo fuera. El mensaje es siempre el
   mismo («Datos incorrectos»), exista o no la cuenta, y siempre se hace el trabajo de `scrypt`, con dos hashes a la
   vez como mucho (cada uno usa ~130 MB).
3. **Sesión.** JWT de Auth.js de 12 h, cookie `httpOnly`, `secure`, `sameSite=lax`. El token lleva `role` y la
   marca `mfa`; `requireAdmin()` lo comprueba **en cada página y en cada server action** del panel (el proxy solo
   redirige). Cambiar la contraseña invalida las sesiones anteriores (`sessionVersion`).
4. **Sin registro.** Las cuentas se crean con `npm run admin:create` en el servidor. No hay ruta que cree usuarios.
5. **MDX de la base = entrada no fiable.** Al renderizar: `disableImports`, `disableExports` y
   `remark-mdx-remove-expressions` (sin expresiones JS). Al guardar: solo componentes del registro de
   `MdxRenderer`, atributos literales, sin `<script>`/`<iframe>`/`on*`; y los mismos chequeos de `check:content`
   (`WikiFrontmatterSchema`, `checkArticleStandard`, slugs reservados, apodos, `related`).
6. **Subidas (fase 4).** Solo imágenes; se recodifican con `sharp` a WebP (descarta metadatos y cargas ocultas),
   límite de tamaño y de píxeles, nombre generado, volumen propio servido como estático.
7. **Superficie.** `/admin` con `noindex`, `Cache-Control: no-store` y fuera de `robots`/`sitemap`. Las páginas
   públicas siguen sin cookies. La app sigue con el usuario de base de datos mínimo (`webboris_app`).
8. **Rastro.** Toda entrada, fallo, publicación y restauración queda en `AdminAuditLog`.

## 5. Publicación y caché

`Publicar` copia `draft` → `published`, crea una `CmsVersion` y llama a `revalidatePath` de las rutas afectadas
(la ficha, `/wiki`, registro, landing, sitemap). `[slug]/page.tsx` pasa a `dynamicParams = true` con `notFound()`
para lo que no exista, de modo que una ficha nueva sale sin reconstruir. La vista previa (`/admin/.../vista-previa`)
renderiza el borrador con el mismo `MdxRenderer` y solo con sesión.

El build no se conecta a la base: las páginas salen de él solo con los archivos. Por eso `deploy/deploy.sh` llama al
terminar a `POST /api/cms/revalidate` (con `AUTH_SECRET`, desde dentro del contenedor), que las regenera con lo
publicado. La lectura de la base se guarda 30 s en memoria y se vacía al publicar.

## 6. Experiencia de Boris

Panel en español con la estética de la web: lista de fichas (estado: publicada / borrador / con cambios sin
publicar), editor con formulario para la cabecera (título, universo, categoría, descripción, portada, apodos,
relacionados, ficha lateral por secciones, datos de la Arena, FAQ) y editor del cuerpo con botones para insertar
los bloques (`WikiImage`, `WikiQuote`, `AbyssalAlert`, `Proximamente`…), vista previa al lado, errores en lenguaje
llano («Falta el apartado Alimentación») e historial con «Restaurar».

## 7. Fases (un PR por fase)

1. **Acceso**: migración de usuario, contraseña + TOTP + códigos de recuperación, bloqueo, `requireAdmin`,
   `/admin/login`, alta por consola, esqueleto del panel y auditoría.
2. **Contenido en la base**: `CmsDocument`/`CmsVersion`, `CmsContentRepository`, endurecimiento del MDX, páginas
   dinámicas y revalidación.
3. **Editor de fichas**: lista, formulario, cuerpo, validación al publicar, vista previa, publicar, historial, retirar y
   recuperar versiones; control de ediciones simultáneas. Fuera: cambiar la dirección (slug) de una ficha.
4. **Imágenes**: subida (route handler con sesión y `Origin` propio), recodificación con sharp, biblioteca con texto
   alternativo y borrado solo de las que no se usan, y selector en el editor. Las imágenes viven en el volumen `media`.
5. **Resto del contenido** (5a): novedades, votaciones, vídeos, orden de la historia y «Empieza por aquí», como listas
   que se publican enteras con historial (sin borrador; las votaciones pasadas y la actual quedan bloqueadas).
   (5b): el menú lateral, que hoy es código y debe pasar a datos.
6. **Operación**: copias (base + volumen `media` de imágenes, que hoy no se copia), exportar a archivos, guía para Boris y despliegue.

## 8. Pruebas

Lógica pura con `node:test` (hash, TOTP con los vectores del RFC 6238, cifrado, bloqueo, superposición del
repositorio, saneado del MDX). QA en Chrome de cada pantalla. `/security-review` antes de fusionar cada fase.
