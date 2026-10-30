# Auditoría de seguridad — 2026-10-30

Revisión estática de toda la app en cinco frentes (un informe por frente, en inglés), más `npm audit` y pruebas
locales (Postgres desechable y `next start` con claves falsas). Sin acceso a producción.

| Informe | Alcance |
| --- | --- |
| [endpoints.md](endpoints.md) | Route handlers, server actions (votos, contacto, búsqueda), Prisma, fugas de datos |
| [auth.md](auth.md) | Auth.js, `src/proxy.ts`, sesiones, CSRF de server actions |
| [rendering.md](rendering.md) | XSS, MDX, JSON-LD, parámetros de URL, OG, `next.config.ts`, cabeceras |
| [infra.md](infra.md) | Dockerfile, compose, nginx, scripts de despliegue, CI, secretos en el historial |
| [database.md](database.md) | Postgres, roles, credenciales, esquema, datos guardados, copias de seguridad |

## Corregido (PR `fix/seguridad-dependencias`)

| Hallazgo | Gravedad | Arreglo |
| --- | --- | --- |
| Dependencias con avisos críticos (next 16.2.1, next-auth beta.30, Prisma 7.6…) | Alta | Actualizadas; `npm audit --omit=dev`: 37 → 2 moderados (solo build) |
| Peticiones en paralelo se saltaban el tope de 5 votos por red | Media | Transacción con `pg_advisory_xact_lock`; probado: 40 en paralelo → 5 |
| Postgres de desarrollo publicado en 0.0.0.0 como superusuario | Media | `127.0.0.1:${DB_PORT}` |
| `proxy.ts` daba por buena cualquier `req.auth` (fail open latente) | Alta latente | `req.auth?.user` |
| `placehold.co` en `remotePatterns` sin uso | Baja | Quitado |
| `/\host` tratado como enlace interno en el MDX | Baja | Externo |
| Volcados `*.sql` podían entrar en la imagen | Baja | `.dockerignore` |

## Pendiente (requiere el VPS o una decisión)

- Revocar en Resend la clave antigua que pasó por el chat (si sigue activa) y usar una nueva también en local.
- Rol de Postgres con privilegios mínimos para la app (hoy usa el superusuario del contenedor): `database.md` §A1.
- Copias de seguridad automáticas de la base (hoy el volumen es la única copia).
- Vaciar `ipHash` al cerrar cada encuesta y meter el id de la encuesta en `voterKey` (privacidad).
- nginx: `server_tokens off`, `default_server` de cierre y HSTS cuando haya dominio definitivo.
- Quitar el cableado de Auth.js sin uso (no hay proveedores ni páginas protegidas) o, si se usa, comprobar `auth()` en el servidor.
- Borrar la rama remota `add-claude-github-actions-*` (flujos con secretos sin fusionar).
