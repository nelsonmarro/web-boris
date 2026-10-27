#!/usr/bin/env bash
# Primera instalación en el VPS (Arch Linux), idempotente. Ejecutar como root desde la raíz del repo clonado:
#   deploy/setup-vps.sh borisaoblois.82-25-95-39.sslip.io
# Instala Docker y certbot si faltan, crea .env.production, construye y arranca la app, añade el vhost de nginx
# (sin tocar los demás sitios) y pide el certificado TLS. Ver docs/deploy/vps.md.
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${1:?uso: deploy/setup-vps.sh <host público>}"
[[ $EUID -eq 0 ]] || { echo "Ejecuta como root." >&2; exit 1; }

echo "== Comprobaciones previas"
# Antes de instalar o compilar nada: el nginx del servidor (el de naphsoft.dev) debe correr en el host y el puerto
# de la app debe estar libre.
command -v nginx >/dev/null || { echo "No hay nginx en el host: este script añade un vhost al nginx existente." >&2; exit 1; }
# Se añade un archivo propio en el directorio que nginx ya incluye; nunca se edita nginx.conf ni otro vhost.
# La salida de `nginx -T` se guarda antes de buscar: con pipefail, `nginx -T | grep -q` puede fallar por SIGPIPE.
NGINX_CONF="$(nginx -T 2>/dev/null)" || { echo "nginx -T falla: corrige la configuración actual antes de seguir." >&2; exit 1; }
NGINX_DIR=""
for dir in /etc/nginx/conf.d /etc/nginx/sites-enabled; do
  if [[ -d "$dir" ]] && grep -qE "^\s*include\s+(${dir}|${dir#/etc/nginx/})/" <<<"$NGINX_CONF"; then NGINX_DIR="$dir"; break; fi
done
if [[ -z "$NGINX_DIR" ]]; then
  echo "nginx no incluye /etc/nginx/conf.d ni /etc/nginx/sites-enabled. Añade a mano en el bloque http de" >&2
  echo "/etc/nginx/nginx.conf:  include /etc/nginx/conf.d/*.conf;  y vuelve a ejecutar este script." >&2
  exit 1
fi
# En una segunda ejecución el puerto lo ocupa la propia app (docker-proxy): eso no es un conflicto.
if ss -Hltnp 'sport = :3131' | grep -v docker-proxy | grep -q .; then
  echo "El puerto 3131 ya está ocupado por otro servicio: cambia el puerto de 'app' en docker-compose.prod.yml" >&2
  echo "y el proxy_pass de deploy/nginx/web-boris.conf." >&2
  exit 1
fi

echo "== Paquetes"
pacman -S --needed --noconfirm docker docker-compose docker-buildx certbot certbot-nginx curl openssl
systemctl enable --now docker

echo "== Entorno"
[[ -f .env.production ]] || deploy/init-env.sh "$HOST"

echo "== App"
deploy/deploy.sh

echo "== nginx"
VHOST="$NGINX_DIR/web-boris.conf"
if [[ ! -f "$VHOST" ]]; then
  sed "s/SERVER_NAME/${HOST}/g" deploy/nginx/web-boris.conf > "$VHOST"
fi
nginx -t
systemctl reload nginx

echo "== TLS"
certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect -d "$HOST"
nginx -t && systemctl reload nginx

echo "== Comprobación"
curl -fsS -o /dev/null -w "https://${HOST}/ → %{http_code}\n" "https://${HOST}/"
