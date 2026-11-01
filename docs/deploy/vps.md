# Despliegue en el VPS de Hostinger (#44)

Vista previa para Boris en `https://borisaoblois.82-25-95-39.sslip.io`, desplegada el 2026-10-27. sslip.io es gratuito y resuelve ese nombre a la IP del VPS sin registrar nada; cuando haya dominio definitivo se cambia (ver al final).

**Arquitectura:** Docker Compose (`docker-compose.prod.yml`, proyecto `web-boris-prod`) con dos servicios. `app` es Next en modo `standalone` sobre Node 24, con `TZ=UTC` y escucha solo en `127.0.0.1:3131`. `db` es Postgres 17 sin puertos publicados, con el volumen `pgdata`. El nginx que ya sirve `naphsoft.dev` hace de proxy con TLS mediante un vhost propio (`deploy/nginx/web-boris.conf`), sin tocar los demás sitios.

## Primera instalación

1. **Acceso SSH como root.** La clave registrada en el VPS es la tuya (`nelsonmarro@gmail.com`). Para desplegar desde la máquina `nelson@archlinux`, añade su clave pública (`~/.ssh/id_ed25519.pub`) en hPanel → VPS → Claves SSH.
2. **Sistema al día.** Arch no admite actualizaciones parciales: si la base de pacman es antigua, `pacman -S docker` da 404. Antes de instalar, en una terminal interactiva (pacman pregunta; acepta cambiar `iptables` por `iptables-nft` y conserva `nginx.conf` si aparece un `.pacnew`), ejecuta `pacman -Sy --needed archlinux-keyring && pacman -Su` y reinicia. `naphsoft.dev` se cae uno o dos minutos durante el reinicio.
3. En el VPS:

   ```bash
   pacman -S --needed git
   git clone https://github.com/nelsonmarro/web-boris /srv/web-boris
   cd /srv/web-boris
   deploy/setup-vps.sh borisaoblois.82-25-95-39.sslip.io
   ```

   `setup-vps.sh` es idempotente y hace lo siguiente:
   - instala Docker y certbot si faltan;
   - crea `.env.production` con secretos generados en el propio servidor, con permisos 600 y sin imprimirlos;
   - construye y arranca la app y aplica las migraciones;
   - añade el vhost en el directorio que nginx ya incluye (`conf.d` o `sites-enabled`) y valida con `nginx -t` antes de recargar;
   - pide el certificado de Let's Encrypt y redirige HTTP a HTTPS. Lo renueva `certbot-renew.timer` (ya activo en el VPS), que recarga nginx solo.

4. **Formulario de contacto (#5).** `RESEND_API_KEY` empieza con un valor de relleno, así que el formulario avisa de que no se pudo enviar. Crea una clave **nueva** en Resend (la anterior pasó por el chat), ponla en `/srv/web-boris/.env.production` y ejecuta `docker compose --env-file .env.production -f docker-compose.prod.yml up -d app`. Es una variable de ejecución: no hace falta reconstruir.

## Actualizar

```bash
cd /srv/web-boris && deploy/deploy.sh
```

`deploy.sh` hace `git pull --ff-only` (y se relanza si el pull trae otra versión de sí mismo), construye, guarda una copia de la base (`deploy/backup.sh`), migra (`migrate` es un servicio del perfil `tools` y usa el superusuario), ajusta el usuario de la app (`deploy/db-app-role.sh`), reinicia la app y espera a que `http://127.0.0.1:3131/` responda 200. Añadir o cambiar una ficha MDX exige este paso: `[slug]` tiene `dynamicParams = false`.

**Usuario de base de datos de la app.** La app no usa el superusuario de Postgres (`POSTGRES_USER`), sino `webboris_app`, que solo lee y escribe filas del esquema `public`: no puede crear ni borrar tablas, crear usuarios, leer ficheros ni ejecutar programas. La primera vez, `db-app-role.sh` genera su contraseña en el servidor y reescribe `.env.production` (sigue con permisos 600): `DATABASE_URL` pasa a `webboris_app` y la URL del superusuario queda en `ADMIN_DATABASE_URL`, que solo recibe `migrate`. El contenedor de la app recibe vacías `POSTGRES_PASSWORD` y `ADMIN_DATABASE_URL`.

## Comprobaciones tras desplegar

- `curl -I https://<host>/` → 200 con `X-Robots-Tag: noindex, nofollow` (vista previa).
- `https://<host>/wiki/no-existe` → 404.
- En `/comunidad`, votar funciona. El límite de 5 votos por red depende de que nginx envíe `X-Real-IP $remote_addr`: el vhost lo hace. Detrás de Cloudflare harían falta `real_ip_header CF-Connecting-IP` y `set_real_ip_from`.
- Logs: `docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app`. Que el feed de YouTube dé 404 o 500 es normal: es un fallo de YouTube y la web usa el vídeo de respaldo.

## Operación

- **Copias de la base:** `deploy/backup.sh` guarda un `pg_dump -Fc` en `/var/backups/web-boris` (carpeta 700, ficheros 600, fuera del repo) y conserva las 14 más recientes. Lo ejecuta `deploy.sh` antes de cada migración y, a diario, un temporizador de systemd que se instala una vez:

  ```bash
  cp deploy/systemd/web-boris-backup.{service,timer} /etc/systemd/system/
  systemctl daemon-reload && systemctl enable --now web-boris-backup.timer
  systemctl list-timers web-boris-backup.timer   # próxima ejecución
  ```

  Restaurar una copia: `docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db pg_restore -U webboris -d webboris --clean --if-exists < /var/backups/web-boris/<fichero>.dump`. Las copias viven en el mismo VPS: para sobrevivir a la pérdida del servidor, bájalas de vez en cuando (`scp root@82.25.95.39:/var/backups/web-boris/*.dump .`).
- **nginx:** el vhost del repo lleva `server_tokens off;` y `add_header Strict-Transport-Security "max-age=31536000" always;`. En un VPS instalado antes del 2026-11-01, añade esas dos líneas a mano en `/etc/nginx/sites-enabled/web-boris.conf` (dentro del bloque `server` del 443 que creó certbot) y ejecuta `nginx -t && systemctl reload nginx`.
- **`VOTE_SECRET`:** rotarlo solo en lunes. Cambiarlo a mitad de semana deja volver a votar esa semana.
- **Dominio definitivo:**
  1. Cambia `NEXT_PUBLIC_SITE_URL` y `AUTH_URL` en `.env.production` y ejecuta `deploy/deploy.sh`. `NEXT_PUBLIC_*` se incrusta en el build, por eso hay que reconstruir.
  2. Cambia `server_name` en el vhost y quita la línea `X-Robots-Tag`.
  3. Ejecuta `certbot --nginx -d <dominio>` y luego `nginx -t && systemctl reload nginx`.
