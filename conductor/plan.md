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
- **Estilos:** Tailwind CSS + shadcn/ui. La paleta de colores estará inspirada en las profundidades abisales y los monstruos (azules muy oscuros, negros, acentos bioluminiscentes como el naranja de los ojos de The Bloop y tonos pálidos celestes).
- **Estado:** Zustand (estado global) y TanStack Query (gestión de estado de servidor/peticiones).
- **Formularios y Tablas:** TanStack Forms y TanStack Table, combinados con Zod para validación.
- **Base de Datos:** PostgreSQL gestionado vía Prisma ORM.
- **Autenticación:** NextAuth.js (conectado a Prisma).
- **Pagos:** PlaceToPay (Ecuador).
- **Wiki / Contenido:** `next-mdx-remote` combinado con validación manual mediante Zod (o Contentlayer si es compatible con la versión específica de Next.js utilizada, aunque `next-mdx-remote` es más seguro a largo plazo para Next.js App Router).
- **DevOps:** Docker y Docker Compose para entornos de desarrollo y producción.

### Estructura de Directorios Propuesta (Clean Architecture / Feature-based)

```text
src/
├── app/                  # Rutas de Next.js (Pages, Layouts, API Routes)
├── assets/               # Imágenes, fuentes, íconos locales
├── components/           # Componentes UI reutilizables (shadcn, etc.)
├── content/              # Archivos .mdx para la wiki
├── core/                 # Lógica de dominio, tipos globales, esquemas Zod
├── features/             # Módulos por dominio (ej. wiki, auth, landing)
│   ├── auth/
│   ├── payments/
│   └── monsters/
├── infrastructure/       # Prisma client, adaptadores externos (PlaceToPay)
├── store/                # Zustand stores
└── utils/                # Funciones de ayuda
```

## 4. Phased Implementation Plan

### Fase 1: Inicialización y Setup Base

1. Inicializar Next.js con TypeScript, Tailwind CSS, ESLint y Prettier.
2. Configurar la paleta de colores "Abisal" en `tailwind.config.ts`.
3. Instalar dependencias clave: shadcn/ui, Lucide React, Zustand, Zod.
4. Configurar la estructura de carpetas (Clean Architecture).

### Fase 2: Infraestructura y Base de Datos (Docker)

1. Crear `docker-compose.yml` (con servicio de PostgreSQL).
2. Crear `Dockerfile` para Next.js (multi-stage para dev y prod).
3. Instalar e inicializar Prisma ORM.
4. Modelar el esquema de base de datos inicial (Usuarios, Sesiones para NextAuth).

### Fase 3: Landing Page y Diseño UI

1. Construir el Layout principal (Navbar con el logo, Footer).
2. Desarrollar la sección "Hero" con la frase “Explora la inmensidad de mis universos y sus historias”.
3. Construir la sección de "Universos" (Colosos, Capitán de Galeón, Ellos llegaron) utilizando los assets proporcionados.
4. Implementar sección de Contacto.

### Fase 4: Motor de Wiki (MDX)

1. Configurar `next-mdx-remote` (o equivalente) para leer el directorio `content/`.
2. Crear un validador de Frontmatter con Zod para asegurar que todos los artículos de los personajes tengan `titulo`, `universo`, `imagen`, etc.
3. Crear el enrutamiento dinámico `app/wiki/[slug]/page.tsx`.
4. Migrar las descripciones de The Bloop, El Gran Majá, Phillip Forte y DELIRIUM desde el PDF a archivos `.mdx`.

### Fase 5: Autenticación y Pagos

1. Configurar NextAuth.js con el Prisma Adapter.
2. Integrar Zod y TanStack Forms para formularios de ingreso (si aplica).
3. Desarrollar un servicio en `src/infrastructure/placetopay` para conectar la pasarela de pagos, preparando las rutas de API necesarias.

### Fase 6: Pulido, UX y SEO

1. Añadir metadatos de Next.js (Open Graph, Twitter cards) utilizando el logo general.
2. Afinar animaciones UI para que el sitio se sienta "vivo" (energía de los monstruos).
3. Revisión exhaustiva de TypeScript (Strict Mode).

## 5. Verification & Testing

- Ejecutar el entorno completo mediante Docker Compose `docker-compose up --build`.
- Validar el renderizado correcto de la landing page con todos los assets (logo, imágenes de los universos).
- Comprobar que los archivos Markdown de la Wiki se parseen correctamente y muestren el diseño MDX.
- Probar migraciones de Prisma.
- Validar accesibilidad y métricas SEO iniciales.

## 6. Migration & Rollback

- Dado que es un proyecto nuevo, no hay migración de datos previos.
- Para la infraestructura, las imágenes de Docker estarán etiquetadas por versión. En caso de falla en producción, se puede hacer rollback ejecutando una versión previa de la imagen del contenedor.
- Las migraciones de Prisma permitirán hacer `prisma migrate down` en caso de requerir revertir cambios de esquema.

## 7. Asegurar Documentacion Actualizada

Siempre usar la herramienta mcp context7 para buscar la documetnacion actualizada de cada api, framework o libreria que se vaya a utilizar antes de implementarla en el proyecto.

