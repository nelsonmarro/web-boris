# Despliegue del panel y entrega a Boris

Guía única para pasar el panel `/admin` a producción, comprobarlo y dárselo a Boris con su primer acceso. Complementa
`docs/deploy/vps.md` (instalación y operación del VPS) y la auditoría `docs/audits/2026-11-16-panel-e2e/`.

**Estado de partida (2026-11-16):** producción (`https://borisaoblois.82-25-95-39.sslip.io`) sigue con la versión
anterior al panel: hoy `/admin` lleva a la pantalla antigua de Auth.js. `main` tiene el panel completo.

---

## 0. Antes de empezar

- [ ] **Decidir el correo de acceso de Boris.** Mejor uno que **no** sea el de contacto público.
- [ ] **Quedar con Boris** para el primer acceso, a ser posible en una videollamada **el mismo día** en que creas su
      cuenta: la contraseña temporal no caduca y, si se filtrara, quien la use primero se quedaría la cuenta.
- [ ] Que Boris tenga en el móvil una **app de códigos**: Google Authenticator, Microsoft Authenticator o Authy.
- [ ] Recomendado antes de entregar (auditoría, «Orden propuesto»): la tanda que arregla la retirada de fichas,
      `rel="opener"`, el cierre de sesión, el mensaje de bloqueo y «Vista previa al lado» en el móvil. Se puede
      desplegar sin ella, pero Boris no debería **retirar** fichas que estén en el menú hasta que esté.

## 1. En tu máquina

```bash
cd ~/workspace/github/nelsonmarro/web-boris
git checkout main && git pull
npm run sync:canal           # recoge los vídeos nuevos del canal
git status                   # si cambió src/content/canal.json: rama, PR y fusionar antes de seguir
```

Recomendado: subir Next.js al parche **16.4.6** (aviso moderado de 16.4.3, no explotable aquí), con `npm run build`,
`npm test` y PR como siempre.

## 2. Desplegar en el VPS

```bash
ssh root@82.25.95.39
cd /srv/web-boris
git log --oneline -1                       # apunta este commit: es al que volverías
deploy/deploy.sh
```

`deploy.sh` trae `main`, construye, **hace una copia de la base** (`/var/backups/web-boris`), aplica las tres
migraciones del panel (`admin_acceso`, `cms_contenido`, `cms_imagenes`), reinicia la app y regenera las páginas. Debe
terminar con «App en marcha … responde 200». No hace falta ninguna variable nueva: `AUTH_SECRET` (44 caracteres),
`MEDIA_DIR` y el volumen `media` ya están en `.env.production` y en el compose.

## 3. nginx: permitir subir fotos (una vez)

El vhost del VPS limita las peticiones a 1 MB y `deploy.sh` no lo actualiza. Sin esto, cualquier foto del móvil da
error al subirla. Edita el vhost (`/etc/nginx/sites-enabled/web-boris.conf` o `conf.d/`, según dónde lo dejó
`setup-vps.sh`) y, **dentro del bloque `server` del 443** que creó certbot, justo antes de `location / {`, añade:

```nginx
    # Subida de imágenes del panel: hasta 20 MB.
    location = /api/admin/media {
        client_max_body_size 21m;
        proxy_pass http://127.0.0.1:3131;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_request_buffering off;
        proxy_read_timeout 120s;
    }
```

```bash
nginx -t && systemctl reload nginx
```

(Es el mismo bloque que ya tiene `deploy/nginx/web-boris.conf` en el repositorio.)

## 4. Comprobar

```bash
curl -sI https://borisaoblois.82-25-95-39.sslip.io/admin | head -3        # 307 → /admin/login
curl -s -o /dev/null -w '%{http_code}\n' https://borisaoblois.82-25-95-39.sslip.io/admin/login   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://borisaoblois.82-25-95-39.sslip.io/wiki/the-bloop # 200
systemctl list-timers web-boris-backup.timer                            # copia diaria activa
```

## 5. Tu cuenta primero

Crea **tu** cuenta y recorre el panel tú antes de dársela a Boris:

```bash
deploy/admin-create.sh tu-correo@ejemplo.com "Nelson"
```

Imprime una contraseña temporal **una sola vez**. Entra en `…/admin`, configura tu 2FA y comprueba:

- [ ] Inicio, Fichas, Imágenes, Contenido y Ayuda abren (la Ayuda con sus capturas).
- [ ] **Subir una foto de más de 1 MB** en Imágenes (comprueba el paso 3) y borrarla después.
- [ ] Abrir una ficha, cambiar una coma, **Guardar borrador** y **Descartar borrador** (no publica nada).
- [ ] Opcional: una ficha nueva de prueba → **Descartar borrador** la elimina sin llegar a publicarse.

## 6. La cuenta de Boris

El mismo día del primer acceso, a ser posible justo antes de la llamada:

```bash
deploy/admin-create.sh correo-de-boris@ejemplo.com "Boris"
```

Envíale **dos mensajes por canales distintos**:

**Mensaje 1 (correo o chat):**

> ¡Hola Boris! Ya tienes listo el panel para editar la wiki.
>
> - Dirección: https://borisaoblois.82-25-95-39.sslip.io/admin (guárdala en marcadores)
> - Tu correo de acceso: correo-de-boris@ejemplo.com
> - Antes de entrar, instala en el móvil Google Authenticator, Microsoft Authenticator o Authy.
>
> La contraseña temporal te la paso por otro lado. La primera vez te pedirá cambiarla y activar la verificación en dos
> pasos; tardas unos 5 minutos. Dentro tienes «Ayuda» con un manual con capturas, y al abrir una ficha te sale un
> recorrido que te enseña el editor.

**Mensaje 2 (otro canal: llamada, WhatsApp…):** solo la contraseña temporal.

## 7. Primer acceso de Boris (acompañado)

1. Boris abre `…/admin`, escribe su **correo** y la **contraseña temporal**, deja **vacío el código** y pulsa **Entrar**.
2. En **Configura tu cuenta**:
   1. Elige una contraseña propia de al menos 12 caracteres (una frase de varias palabras) y la repite. Que la guarde
      en el gestor de contraseñas del navegador.
   2. Escanea el QR con la app de códigos (si no puede, escribe la clave que sale al lado). En la app aparece como
      «Wiki BorisaoBlois».
   3. Escribe los 6 dígitos que muestra la app y pulsa el botón.
3. Aparecen **10 códigos de recuperación**: que los **descargue o imprima** y los guarde fuera del móvil. Cada uno sirve
   una vez si pierde el móvil. No se vuelven a mostrar.
4. **Ya los guardé: entrar al panel** → entra directamente.
5. Ya dentro:
   - [ ] Guardar `…/admin` en marcadores (y en la pantalla de inicio del móvil).
   - [ ] Abrir una ficha y dejar que salga **el recorrido** (o pulsar «Ver el recorrido»).
   - [ ] Cambio de prueba juntos: un borrador en una ficha → **Vista previa** → **Publicar** → verlo en la web → si
         hace falta, **Historial → Recuperar en el borrador** y volver a publicar.
   - [ ] Enseñarle **Ayuda → ¿Qué quieres hacer?**.
   - [ ] Cerrar sesión y volver a entrar con la app de códigos, para confirmar que su 2FA funciona.

## 8. Después de la entrega

- **Ficheros del repo frente a lo publicado en el panel:** lo que Boris publica en el panel **gana** sobre el `.mdx`
  del repositorio. Si después cambias en el repo una ficha que él ya editó en el panel, tu cambio no se verá. Para esas
  fichas, edita desde el panel. Lo mismo con las listas (menú, novedades, votaciones…): una vez publicadas en el panel,
  el archivo del repo deja de usarse.
- **Si Boris pierde el móvil:** entra con un código de recuperación. Si tampoco los tiene:
  `deploy/admin-create.sh correo-de-boris@ejemplo.com --reset` (nueva temporal, quita el 2FA y cierra sus sesiones) y
  repetir el paso 7.
- **Si se bloquea por intentos fallidos:** esperar 15 minutos. Hoy el aviso dice «Datos incorrectos» aunque escriba
  bien los datos (pendiente de la auditoría).
- **Si quiere cambiar su contraseña:** de momento no hay pantalla para ello; `--reset` y configurar de nuevo.
- **Copias:** diarias en `/var/backups/web-boris` (base e imágenes). Bájalas de vez en cuando:
  `scp root@82.25.95.39:'/var/backups/web-boris/*' .`

## 9. Si algo sale mal en el despliegue

Las migraciones del panel solo **añaden** tablas: la versión anterior funciona con la base nueva.

```bash
cd /srv/web-boris
git reset --hard <commit-anterior>     # el que apuntaste en el paso 2
docker compose --env-file .env.production -f docker-compose.prod.yml build app
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
```

Restaurar la base (solo si hiciera falta): `docs/deploy/vps.md` → «Operación».
