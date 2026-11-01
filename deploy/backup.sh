#!/usr/bin/env bash
# Copia de la base de producción en /var/backups/web-boris (formato custom de pg_dump: se restaura con pg_restore).
# Guarda las KEEP más recientes (14 por defecto). Lo llama deploy/deploy.sh antes de migrar y, a diario,
# el temporizador deploy/systemd/web-boris-backup.timer (ver docs/deploy/vps.md).
# Restaurar: docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
#   pg_restore -U <POSTGRES_USER> -d <POSTGRES_DB> --clean --if-exists < /var/backups/web-boris/<fichero>.dump
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=.env.production
DEST="${BACKUP_DIR:-/var/backups/web-boris}"
KEEP="${KEEP:-14}"
[[ -f "$ENV_FILE" ]] || { echo "Falta $ENV_FILE." >&2; exit 1; }
compose() { docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml "$@"; }
env_get() { sed -n "s/^$1=//p" "$ENV_FILE" | tail -n 1; }

# Sin base en marcha (primera instalación) no hay nada que copiar.
if [[ -z "$(compose ps -q db 2>/dev/null)" ]]; then
  echo "La base no está en marcha: no hay copia que hacer."
  exit 0
fi

umask 077
mkdir -p "$DEST"
chmod 700 "$DEST"
FILE="$DEST/webboris-$(date -u +%Y%m%dT%H%M%SZ).dump"
# A un temporal y luego `mv`: una copia a medias nunca queda con el nombre definitivo.
compose exec -T db pg_dump -Fc -U "$(env_get POSTGRES_USER)" -d "$(env_get POSTGRES_DB)" > "$FILE.part"
mv "$FILE.part" "$FILE"
echo "Copia guardada: $FILE ($(du -h "$FILE" | cut -f1))."

# Rotación: borra las más antiguas por encima de KEEP.
ls -1t "$DEST"/webboris-*.dump 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f --
