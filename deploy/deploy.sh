#!/usr/bin/env bash
# Despliega la versión de `main` en el VPS: actualiza el código, construye, migra y reinicia la app.
# Uso (en el VPS, desde la raíz del repo): deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[[ -f .env.production ]] || { echo "Falta .env.production: ejecuta antes deploy/init-env.sh <host>." >&2; exit 1; }
compose() { docker compose --env-file .env.production -f docker-compose.prod.yml "$@"; }

git pull --ff-only
compose build app migrate
compose up -d db
compose run --rm migrate
compose up -d app

# Espera a que el servidor responda (máx. 60 s).
for _ in $(seq 1 30); do
  if code="$(curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1:3131/)" && [[ "$code" == 200 ]]; then
    echo "App en marcha: http://127.0.0.1:3131/ responde 200 ($(git rev-parse --short HEAD))."
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done
echo "La app no responde: revisa 'docker compose --env-file .env.production -f docker-compose.prod.yml logs app'." >&2
exit 1
