#!/usr/bin/env bash
# Copia de la base de producción y de las imágenes subidas desde el panel /admin en /var/backups/web-boris.
# Guarda las KEEP copias de la base más recientes (14 por defecto). Lo llama deploy/deploy.sh antes de migrar y, a
# diario, el temporizador deploy/systemd/web-boris-backup.timer (ver docs/deploy/vps.md).
# Restaurar la base: docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
#   pg_restore -U <POSTGRES_USER> -d <POSTGRES_DB> --clean --if-exists < /var/backups/web-boris/<fichero>.dump
# Restaurar las imágenes: docker compose --env-file .env.production -f docker-compose.prod.yml exec -T app \
#   tar -xzf - -C /app/media < /var/backups/web-boris/<fichero>.tar.gz
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

# Imágenes del panel (volumen `media`, en /app/media dentro de la app). Cada archivo se llama como el hash de su
# contenido y nunca cambia: si la lista de nombres es la misma que en la última copia, esa copia sigue valiendo.
if [[ -z "$(compose ps -q app 2>/dev/null)" ]]; then
  echo "La app no está en marcha: las imágenes no se copian esta vez."
  exit 0
fi
# Una versión anterior al panel no tiene la carpeta: no hay imágenes que copiar.
# Los `.tmp-*` son subidas a medias: la app las renombra al terminar.
if ! LIST="$(compose exec -T app sh -c 'test -d /app/media && ls -1 /app/media | grep -v "\.tmp-" | sort')"; then
  echo "La app no tiene carpeta de imágenes: no hay imágenes que copiar."
  exit 0
fi
if [[ -z "$LIST" ]]; then
  echo "Todavía no se ha subido ninguna imagen."
  exit 0
fi
SIGNATURE="$(printf '%s\n' "$LIST" | sha256sum | cut -c1-16)"
LAST="$(ls -1t "$DEST"/media-*.tar.gz 2>/dev/null | head -n 1 || true)"
if [[ -n "$LAST" && "$LAST" == *"-$SIGNATURE.tar.gz" ]]; then
  echo "Imágenes sin cambios desde la última copia: $LAST."
  exit 0
fi
MEDIA_FILE="$DEST/media-$(date -u +%Y%m%dT%H%M%SZ)-$SIGNATURE.tar.gz"
compose exec -T app tar -czf - -C /app/media --exclude='*.tmp-*' . > "$MEDIA_FILE.part"
mv "$MEDIA_FILE.part" "$MEDIA_FILE"
echo "Imágenes guardadas: $MEDIA_FILE ($(printf '%s\n' "$LIST" | wc -l) archivos, $(du -h "$MEDIA_FILE" | cut -f1))."
ls -1t "$DEST"/media-*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f --

