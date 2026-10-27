#!/usr/bin/env bash
# Crea .env.production en el VPS con secretos generados allí mismo (nunca salen del servidor ni se imprimen).
# Uso: deploy/init-env.sh <host público>   p. ej. deploy/init-env.sh borisaoblois.82-25-95-39.sslip.io
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${1:?uso: deploy/init-env.sh <host público>}"
if [[ -e .env.production ]]; then
  echo ".env.production ya existe: no lo sobrescribo (bórralo a mano si de verdad quieres regenerarlo)." >&2
  exit 1
fi

umask 077
PG_PASSWORD="$(openssl rand -hex 24)"
cat > .env.production <<EOF
# Generado por deploy/init-env.sh el $(date -u +%F). Permisos 600: no lo copies fuera del VPS.
NEXT_PUBLIC_SITE_URL=https://${HOST}
AUTH_URL=https://${HOST}
AUTH_TRUST_HOST=true
AUTH_SECRET=$(openssl rand -base64 33)
# Rotar solo en lunes: cambiarlo a mitad de semana deja volver a votar esa semana.
VOTE_SECRET=$(openssl rand -hex 32)
POSTGRES_USER=webboris
POSTGRES_PASSWORD=${PG_PASSWORD}
POSTGRES_DB=webboris
DATABASE_URL=postgresql://webboris:${PG_PASSWORD}@db:5432/webboris
# Pendiente (#5): una clave de Resend NUEVA (rotada). Con este valor el formulario de contacto avisa de que no se pudo enviar.
RESEND_API_KEY=re_pendiente
CONTACT_EMAIL=borisaoblois343@gmail.com
CONTACT_FROM_EMAIL="Universos de BorisaoBlois <contacto@naphsoft.dev>"
TZ=UTC
EOF
echo "Creado .env.production para https://${HOST} (secretos generados en el servidor)."
