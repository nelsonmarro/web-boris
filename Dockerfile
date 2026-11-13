# syntax=docker/dockerfile:1
# Imagen de producción de la web (despliegue en el VPS, ver docs/deploy/vps.md).
# Etapas: deps (npm ci) → builder (next build standalone) → runner (solo el servidor) y migrate (prisma migrate deploy).

FROM node:24-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
# NEXT_PUBLIC_* se incrusta en el build: cambiar el dominio exige reconstruir la imagen.
ARG NEXT_PUBLIC_SITE_URL
# Valores de relleno, solo para compilar: el build no se conecta a la base de datos ni envía correos (como en el CI).
# Los reales llegan en tiempo de ejecución desde .env.production.
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_OUTPUT=standalone \
    DATABASE_URL=postgresql://build:build@localhost:5432/build \
    RESEND_API_KEY=re_build_placeholder
RUN npx prisma generate && npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=UTC
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Las fichas y el contenido del hub se leen del disco al revalidar (ISR): el trazado de standalone no los copia.
COPY --from=builder --chown=node:node /app/src/content ./src/content
# Imágenes subidas desde el panel /admin: el compose monta aquí un volumen (MEDIA_DIR).
RUN mkdir -p /app/media && chown node:node /app/media
USER node
EXPOSE 3000
CMD ["node", "server.js"]

# `docker compose run --rm migrate`: aplica las migraciones pendientes de prisma/migrations.
FROM deps AS migrate
COPY prisma ./prisma
COPY prisma.config.ts ./
# `deploy/admin-create.sh`: alta de cuentas del panel /admin con esta misma imagen.
COPY scripts/admin-create.mts ./scripts/
COPY src/features/admin/lib ./src/features/admin/lib
CMD ["npx", "prisma", "migrate", "deploy"]
