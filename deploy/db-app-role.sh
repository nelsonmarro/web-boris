#!/usr/bin/env bash
# Usuario de Postgres con privilegios mínimos para la app (auditoría de seguridad 2026-10-30, #91).
# Lo llama deploy/deploy.sh después de migrar; es idempotente.
#
# POSTGRES_USER (el que crea la imagen de Postgres) es superusuario: con él, cualquier fallo de la app daría el control
# de toda la base, `COPY … TO PROGRAM` incluido. La app pasa a conectarse como APP_DB_USER, que solo puede leer y
# escribir filas de las tablas del esquema `public`; las migraciones siguen con el superusuario (ADMIN_DATABASE_URL).
#
# La primera vez (un .env.production sin APP_DB_PASSWORD) genera la contraseña en el servidor, crea el usuario y
# reescribe .env.production: DATABASE_URL pasa al usuario de la app y la URL anterior queda en ADMIN_DATABASE_URL.
# Nunca imprime secretos.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=.env.production
[[ -f "$ENV_FILE" ]] || { echo "Falta $ENV_FILE." >&2; exit 1; }
compose() { docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml "$@"; }
# Valor de una variable del fichero (sin evaluarlo como shell).
env_get() { sed -n "s/^$1=//p" "$ENV_FILE" | tail -n 1; }

POSTGRES_USER="$(env_get POSTGRES_USER)"
POSTGRES_DB="$(env_get POSTGRES_DB)"
APP_DB_USER="$(env_get APP_DB_USER)"
APP_DB_PASSWORD="$(env_get APP_DB_PASSWORD)"
FIRST_TIME=false
if [[ -z "$APP_DB_PASSWORD" ]]; then
  FIRST_TIME=true
  APP_DB_USER=webboris_app
  APP_DB_PASSWORD="$(openssl rand -hex 24)"
fi
[[ "$APP_DB_USER" =~ ^[a-z_][a-z0-9_]*$ ]] || { echo "APP_DB_USER no válido." >&2; exit 1; }

# El SQL va por stdin (no aparece en `ps`); los valores entran como variables de psql y se citan con %I / %L.
compose exec -T db psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL
\set app_user '$APP_DB_USER'
\set app_password '$APP_DB_PASSWORD'
\set db_name '$POSTGRES_DB'
\set owner '$POSTGRES_USER'
SELECT format('CREATE ROLE %I LOGIN', :'app_user')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user') \gexec
SELECT format('ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
              :'app_user', :'app_password') \gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'db_name') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'db_name', :'app_user') \gexec
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'app_user') \gexec
SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', :'app_user') \gexec
SELECT format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', :'app_user') \gexec
-- Las tablas de migraciones futuras (las crea el superusuario) quedan accesibles sin repetir los GRANT.
SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I',
              :'owner', :'app_user') \gexec
SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I',
              :'owner', :'app_user') \gexec
-- La tabla de Prisma no es de la app.
SELECT format('REVOKE ALL ON TABLE public._prisma_migrations FROM %I', :'app_user')
  WHERE to_regclass('public._prisma_migrations') IS NOT NULL \gexec
SQL

if $FIRST_TIME; then
  ADMIN_URL="$(env_get DATABASE_URL)"
  APP_URL="postgresql://${APP_DB_USER}:${APP_DB_PASSWORD}@db:5432/${POSTGRES_DB}"
  TMP="$(mktemp "${ENV_FILE}.XXXXXX")" # mktemp crea el fichero con permisos 600
  grep -v '^DATABASE_URL=' "$ENV_FILE" > "$TMP"
  cat >> "$TMP" <<EOF
# Usuario de la app con privilegios mínimos (deploy/db-app-role.sh, $(date -u +%F)); las migraciones usan ADMIN_DATABASE_URL.
APP_DB_USER=${APP_DB_USER}
APP_DB_PASSWORD=${APP_DB_PASSWORD}
DATABASE_URL=${APP_URL}
ADMIN_DATABASE_URL=${ADMIN_URL}
EOF
  mv "$TMP" "$ENV_FILE"
  echo "Usuario de base de datos '${APP_DB_USER}' creado; la app ya no usa el superusuario."
else
  echo "Permisos del usuario de base de datos '${APP_DB_USER}' al día."
fi
