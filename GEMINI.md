# Proyecto: Universos de BorisaoBlois

Este es el repositorio oficial de la Landing Page y Wiki para los universos narrativos del YouTuber BorisaoBlois. El proyecto es una aplicación web moderna construida con **Next.js 16 (App Router)**, diseñada para ser visualmente impactante, SEO optimizada y con un motor de contenido basado en MDX.

## Arquitectura y Tecnologías Principales

- **Framework:** Next.js 16 (App Router) con soporte para React 19.
- **Estilos:** Tailwind CSS v4 + shadcn/ui.
- **Base de Datos:** PostgreSQL gestionado a través de **Prisma ORM v7**.
- **Autenticación:** Auth.js v5 (NextAuth.js) con adaptador de Prisma.
- **Gestión de Estado:**
  - **Servidor:** TanStack Query v5 (React Query).
  - **Global:** Zustand v5.
- **Formularios:** React Hook Form + @tanstack/react-form + Zod v4 para validación.
- **Contenido (Wiki):** MDX (`next-mdx-remote`) con procesamiento de frontmatter mediante `gray-matter`.
- **Infraestructura:** Docker y Docker Compose para el entorno de base de datos local.

## Organización del Proyecto

El código fuente se encuentra en el directorio `src/` siguiendo una arquitectura limpia y modular:

- `src/app/`: Rutas de la aplicación organizadas por grupos (`(marketing)` para la landing, `(wiki)` para la wiki).
- `src/core/`: Lógica central del dominio, incluyendo acciones de servidor (`actions/`), configuración de autenticación (`auth/`) y tipos globales.
- `src/features/`: Módulos por dominio de negocio (monsters, auth, payments, marketing).
- `src/lib/`: Clientes de infraestructura y utilidades (Prisma, utils).
- `src/content/`: Archivos `.mdx` que alimentan la wiki.
- `src/store/`: Stores de Zustand para el estado global de la UI.
- `src/proxy.ts`: Middleware/Proxy de Auth.js para la protección de rutas.

## Comandos de Desarrollo

### Requisitos Previos
- Node.js (v20+)
- Docker y Docker Compose (para la base de datos)

### Instalación
```bash
npm install
```

### Configuración del Entorno
Copia el archivo `.env.example` (si existe) a `.env` y configura las variables necesarias:
- `DATABASE_URL`: URL de conexión a PostgreSQL.
- `AUTH_SECRET`: Secreto para Auth.js.

### Base de Datos
Inicia el contenedor de PostgreSQL:
```bash
docker-compose up -d
```

Genera el cliente de Prisma:
```bash
npx prisma generate
```

### Ejecución
```bash
npm run dev
```

### Construcción y Producción
```bash
npm run build
npm run start
```

## Convenciones de Desarrollo

- **Uso Obligatorio de context7:** Siempre se debe usar la herramienta `context7` para consultar la documentación oficial actualizada de cualquier librería, API o framework antes de implementar un nuevo feature, escribir nuevo código o modificar el código existente.
- **TypeScript Estricto:** Todas las funciones y componentes deben estar correctamente tipados.
- **Zod para Validación:** Se utiliza Zod v4 para validar tanto la entrada de formularios como la estructura de los datos del servidor y archivos MDX.
- **Componentes UI:** Se prefiere el uso de componentes de `shadcn/ui` personalizados con la paleta de colores "Abisal".
- **Server Components:** Priorizar el uso de React Server Components para el renderizado de datos de la wiki y SEO.
- **Prisma v7 Patterns:** El cliente de Prisma debe instanciarse utilizando el adaptador de driver (`@prisma/adapter-pg`) para compatibilidad con entornos modernos.
- **Next.js 16 Proxy:** La lógica de middleware de autenticación se encuentra en `src/proxy.ts` siguiendo la convención de Next.js 16.
