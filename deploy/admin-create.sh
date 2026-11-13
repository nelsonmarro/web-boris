#!/usr/bin/env bash
# Crea o restablece una cuenta del panel /admin en producción (no hay registro por la web).
#   deploy/admin-create.sh correo@ejemplo.com "Nombre"
#   deploy/admin-create.sh correo@ejemplo.com --reset     # contraseña temporal nueva y 2FA desactivado
# Usa la imagen `migrate` (conexión de administración). Imprime la contraseña temporal una sola vez.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=.env.production
[[ -f "$ENV_FILE" ]] || { echo "Falta $ENV_FILE." >&2; exit 1; }
docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml run --rm migrate \
  node --experimental-strip-types --no-warnings scripts/admin-create.mts "$@"
