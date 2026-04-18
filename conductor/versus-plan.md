# Plan de Implementación: Sistema de Versus y Power Scaling

## 1. Background & Motivación
La comunidad de BorisaoBlois disfruta de comparar y debatir sobre el poder de los Colosos y criaturas que habitan los diferentes universos (ej. *The Bloop vs El Gran Majá*). Para enriquecer la Wiki y aumentar el "engagement" de los usuarios, implementaremos una herramienta interactiva donde se puedan comparar las estadísticas de dos criaturas lado a lado, dando una representación visual de su poder (Power Scaling).

## 2. Scope & Impact
- **Esquema de la Wiki (Zod):** Ampliar `src/core/types/wiki.ts` para incluir un objeto `stats` (Longitud, Peso, Inteligencia, Hostilidad, Tipo de Mordida, Habilidades Especiales).
- **Contenido MDX:** Actualizar los archivos de *The Bloop* y *El Gran Majá* con estas nuevas estadísticas.
- **Componentes UI:** Instalar los componentes `Select` y `Progress` de `shadcn/ui`.
- **Nuevo Feature:** Crear el componente interactivo `VersusArena` en `src/features/monsters/components/`.
- **Nueva Ruta:** Crear la página `src/app/(wiki)/wiki/versus/page.tsx` para alojar la arena de combate.
- **Navegación:** Actualizar `Navbar.tsx` para incluir un enlace a la arena "Versus".

## 3. Architecture & Tech Stack
- **Zod v4:** Para extender el esquema de frontmatter validando métricas precisas.
- **Zustand:** (Opcional, si es necesario para mantener el estado de los combatientes seleccionados, aunque los hooks de estado local de React son suficientes para esta vista).
- **shadcn/ui:** Componentes `Select` (para los menús desplegables de monstruos), `Progress` (para las barras de estado 1-10) y `Card` (para la presentación de los combatientes).

## 4. Phased Implementation Plan

### Fase 1: Extensión de Tipos y Contenido
1. Modificar `src/core/types/wiki.ts` para que `WikiFrontmatterSchema` acepte un objeto `stats` opcional con campos `length`, `weight`, `intelligence`, `hostility`, `biteType` y `specialAbilities`.
2. Editar `src/content/the-bloop.mdx` y `src/content/el-gran-maja.mdx` para añadir sus respectivas estadísticas en base al lore oficial del PDF proporcionado.

### Fase 2: Componentes UI
1. Ejecutar `npx shadcn@latest add select progress` para instalar las dependencias visuales necesarias.

### Fase 3: Arena de Combate (Feature)
1. Desarrollar `src/features/monsters/components/VersusArena.tsx`. Este componente recibirá la lista de artículos (`WikiArticle[]`), permitiendo al usuario seleccionar Combatiente 1 y Combatiente 2.
2. Renderizar barras de progreso (`<Progress />`) para comparar numéricamente Inteligencia y Hostilidad.
3. Mostrar detalles textuales para Longitud, Peso, Mordida y Habilidades en tarjetas (`<Card />`) cara a cara.

### Fase 4: Routing y Navegación
1. Crear la página `src/app/(wiki)/wiki/versus/page.tsx` que obtenga los artículos usando `getAllArticles()` y se los pase a `VersusArena`.
2. Actualizar `src/components/Navbar.tsx` añadiendo el link `/wiki/versus` etiquetado como "Versus".

## 5. Verification & Testing
- Comprobar que la validación de Zod en `src/utils/mdx.ts` no falle con los nuevos campos opcionales del frontmatter.
- Renderizar la página de "Versus" y probar el cambio de combatientes en los selectores.
- Verificar que las barras de progreso se animen o representen correctamente los valores (ej. un valor de 10 llene el 100% de la barra).

## 6. Migration & Rollback
- No hay migración de base de datos necesaria, solo actualización estática de contenido MDX. Si la arena presenta problemas, se puede revertir ocultando el botón en el Navbar mientras se refactoriza el componente.
