#!/usr/bin/env bash
# Despliega la versión de `main` en el VPS: actualiza el código, construye, migra y reinicia la app.
# Uso (en el VPS, desde la raíz del repo): deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[[ -f .env.production ]] || { echo "Falta .env.production: ejecuta antes deploy/init-env.sh <host>." >&2; exit 1; }
compose() { docker compose --env-file .env.production -f docker-compose.prod.yml "$@"; }

BEFORE="$(git rev-parse HEAD)"
git pull --ff-only
# Si el pull trae otra versión de este script, se relanza: bash seguiría ejecutando la que ya tenía cargada.
if [[ -z "${DEPLOY_REEXEC:-}" ]] && ! git diff --quiet "$BEFORE" HEAD -- deploy/deploy.sh; then
  DEPLOY_REEXEC=1 exec deploy/deploy.sh
fi
compose build app migrate
compose up -d db
# Copia antes de migrar: si una migración sale mal, se restaura esta (deploy/backup.sh).
deploy/backup.sh
compose run --rm migrate
# La app usa un usuario sin privilegios de administración; la primera vez lo crea y reescribe .env.production.
deploy/db-app-role.sh
compose up -d app

# Espera a que el servidor responda (máx. 60 s).
for _ in $(seq 1 30); do
  if code="$(curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1:3131/)" && [[ "$code" == 200 ]]; then
    echo "App en marcha: http://127.0.0.1:3131/ responde 200 ($(git rev-parse --short HEAD))."
    # Las páginas salen del build solo con los archivos: se regeneran con lo publicado en el panel /admin.
    # El secreto no sale del contenedor (lo lee de su entorno) ni aparece en la línea de órdenes.
    compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/cms/revalidate',{method:'POST',headers:{authorization:'Bearer '+process.env.AUTH_SECRET}}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status)})" \
      || echo "Aviso: no se pudo regenerar el contenido del panel; lo publicado volverá a verse en menos de una hora." >&2
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done
echo "La app no responde: revisa 'docker compose --env-file .env.production -f docker-compose.prod.yml logs app'." >&2
exit 1
