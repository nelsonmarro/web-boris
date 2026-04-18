# Plan de Implementación: Landing Page y Wiki - Universos de BorisaoBlois

## 1. Background & Motivación

Crear la plataforma web oficial para los universos narrativos del YouTuber BorisaoBlois. El proyecto servirá como un portal dual: una **Landing Page** atractiva que transmita la energía y misterio de las criaturas marinas colosales (como El Gran Majá y The Bloop) y un motor de **Wiki** interactivo y SEO optimizado para explorar el lore detallado de los personajes, organizaciones (como DELIRIUM) y eventos.

## 2. Scope & Impact

- **Landing Page:** Introducción a los universos (Colosos, Capitán de Galeón, Ellos Llegaron), presentación de personajes principales y contacto.
- **Motor Wiki:** Sistema de gestión de contenido basado en MDX (Markdown + JSX) para artículos informativos.
- **Sistema de Usuarios y Pagos:** Integración de NextAuth para autenticación y pasarela de PlaceToPay para posibles contenidos premium o donaciones.
- **Infraestructura:** Despliegue y desarrollo mediante Docker y Docker Compose, con PostgreSQL como base de datos y Prisma como ORM.

## 3. Architecture & Tech Stack

- **Framework:** Next.js (App Router) con Server-Side Rendering (SSR) y optimización SEO.
- **Lenguaje:** TypeScript estricto, siguiendo principios SOLID.
- **Estilos:** Tailwind CSS + shadcn/ui. La paleta de colores estará inspirada en las profundidades abisales y los monstruos.
- **Estado:** Zustand (estado global) y TanStack Query (gestión de estado de servidor/peticiones).
- **Formularios y Tablas:** TanStack Forms y TanStack Table, combinados con Zod para validación.
- **Base de Datos:** PostgreSQL gestionado vía Prisma ORM.
- **Autenticación:** NextAuth.js (conectado a Prisma).
- **Pagos:** PlaceToPay (Ecuador).
- **Wiki / Contenido:** `next-mdx-remote` combinado con validación manual mediante Zod.
- **DevOps:** Docker y Docker Compose para entornos de desarrollo y producción.

### Estructura de Directorios Propuesta (Clean Architecture / Feature-based)

```text
src/
├── app/                  # Rutas de Next.js (Pages, Layouts, API Routes)
│   ├── (marketing)/      # Grupo para Landing Page
│   └── (wiki)/           # Grupo para Wiki (con Slots avanzados)
├── assets/               # Imágenes, fuentes, íconos locales
├── components/           # Componentes UI reutilizables (shadcn, etc.)
├── content/              # Archivos .mdx para la wiki
├── core/                 # Lógica de dominio, tipos globales, esquemas Zod
├── features/             # Módulos por dominio (ej. wiki, auth, landing)
│   ├── auth/
│   ├── payments/
│   └── monsters/
├── lib/                  # Prisma client, adaptadores externos (PlaceToPay)
├── store/                # Zustand stores
└── utils/                # Funciones de ayuda
```

## 4. Phased Implementation Plan

### Fase 1: Inicialización y Setup Base ✅ (COMPLETADO)
1. Inicializar Next.js con TypeScript, Tailwind CSS, ESLint y Prettier.
2. Configurar la paleta de colores "Abisal" en `tailwind.config.ts`.
3. Instalar dependencias clave: shadcn/ui, Lucide React, Zustand, Zod.
4. Configurar la estructura de carpetas y route groups `(marketing)` y `(wiki)`.

### Fase 2: Infraestructura y Base de Datos (Docker) ✅ (COMPLETADO)
1. Crear `docker-compose.yml` (con servicio de PostgreSQL).
2. Crear `Dockerfile` para Next.js multi-stage para optimización de imagen de producción (`standalone`).
3. Instalar e inicializar Prisma ORM v7 configurando el adaptador `@prisma/adapter-pg`.
4. Modelar el esquema de base de datos inicial (Usuarios, Sesiones para NextAuth).

### Fase 3: Landing Page y Diseño UI ✅ (COMPLETADO)
1. Construir el Layout principal (Navbar con el logo, Footer).
2. Desarrollar la sección "Hero" con la frase “Explora la inmensidad de mis universos y sus historias”.
3. Construir la sección de "Universos" (Colosos, Capitán de Galeón, Ellos llegaron) utilizando los assets proporcionados.
4. Implementar sección de Contacto.

### Fase 4: Motor de Wiki (MDX) ✅ (COMPLETADO)
1. Configurar `next-mdx-remote` para leer el directorio `content/`.
2. Crear un validador de Frontmatter con Zod v4.
3. Crear el enrutamiento dinámico `app/(wiki)/wiki/[slug]/page.tsx` y utilizar el store de Zustand para filtrado.
4. Migrar las descripciones de The Bloop, El Gran Majá, Phillip Forte y DELIRIUM desde el PDF a archivos `.mdx`.

### Fase 4.1: Estructura Avanzada Wiki (Arquitectura Pro) ⏳ (PENDIENTE)
1. **Parallel Routes (Slots)**: Crear un slot `@sidebar` en `src/app/(wiki)` para mostrar una navegación lateral persistente que permita saltar entre monstruos sin recargar el layout principal.
2. **Intercepting Routes**: Implementar la carpeta `src/app/(wiki)/wiki/(.)[slug]` para permitir previsualizar artículos en un modal ("Quick View") desde la lista principal de la wiki, manteniendo la URL contextual.
3. **Optimización SSG**: Asegurar que todas las rutas de la wiki usen `generateStaticParams` para que el contenido MDX se pre-renderice en tiempo de compilación para SEO y velocidad máxima.

### Fase 5: Autenticación y Pagos ⏳ (PENDIENTE)
1. Configurar y habilitar proveedores sociales (e.g. Google/GitHub) en la instancia de Auth.js modularizada en `src/core/auth`.
2. Integrar **Zod y TanStack Forms** para el formulario de donaciones o "Apoyar proyecto" en la landing page.
3. **Integración PlaceToPay**:
    - Crear el servicio en `src/lib/placetopay/client.ts` que implemente la autenticación requerida (`login`, `tranKey`, `nonce`, `seed`).
    - Desarrollar la ruta de API `POST /api/checkout` que llame al endpoint de PlaceToPay `/api/session`.
    - Desarrollar la ruta de callback `GET /api/checkout/callback` para verificación de estado.

### Fase 6: Pulido, UX y SEO ⏳ (PENDIENTE)
1. Añadir metadatos de Next.js (Open Graph, Twitter cards, meta titles) a cada ruta (`(marketing)` y `(wiki)`).
2. Afinar animaciones UI para que el sitio se sienta "vivo" (energía de los monstruos, efectos de hover avanzados).
3. Configurar manejo de errores y estados de carga (`loading.tsx`, `error.tsx`) de Next.js.

## 5. Verification & Testing

- Ejecutar el entorno completo mediante Docker Compose `docker-compose up --build`.
- Validar accesibilidad y métricas SEO iniciales.
- Realizar pruebas de flujo de pago en el sandbox de PlaceToPay.

## 6. Migration & Rollback

- Dado que es un proyecto nuevo, no hay migración de datos previos.
- Para la infraestructura, las imágenes de Docker estarán etiquetadas por versión.
- Las migraciones de Prisma permitirán hacer `prisma migrate down` en caso de requerir revertir cambios de esquema.

## 7. Asegurar Documentacion Actualizada

Siempre usar la herramienta mcp `context7` para buscar la documentación actualizada de cada api, framework o librería que se vaya a utilizar antes de implementarla en el proyecto.
