# Plan de Estabilización y Mejora de la Wiki

## 1. Background & Motivación
La Wiki actual es funcional pero carece de una estructura de navegación jerárquica clara que refleje la profundidad del lore de BorisaoBlois. Basándonos en el esquema oficial de "Colosos", implementaremos un sistema de navegación lateral (Sidebar) y mejoraremos la presentación visual y la organización del contenido.

## 2. Scope & Impact
- **Navegación Lateral:** Implementación de un `Sidebar` usando Shadcn UI que respete la jerarquía: Universo > Categoría > Subcategoría > Artículo.
- **Estabilización de Imágenes:** Mapeo de imágenes de alta resolución (`*resolution.png`) a los artículos correspondientes.
- **Jerarquía Universal:** Aplicación del esquema de Colosos (Animales, Humanos, Especies, Organizaciones, etc.) a todos los universos.
- **Portal de la Wiki:** Rediseño de la página principal `/wiki` para ofrecer accesos directos y una mejor visión general.

## 3. Architecture & Tech Stack
- **Shadcn UI Sidebar:** Para el menú lateral colapsable.
- **Lucide React:** Para los iconos de categorías.
- **Navigation Config:** Creación de un archivo de configuración centralizado para la estructura de la Wiki.

## 4. Phased Implementation Plan

### Fase 1: Componentes y Configuración
1. Instalar componentes necesarios: `npx shadcn@latest add sidebar collapsible`.
2. Crear `src/features/monsters/config/wiki-navigation.ts` con la estructura jerárquica completa.
3. Actualizar `src/app/(wiki)/layout.tsx` para envolver la wiki en un `SidebarProvider`.

### Fase 2: Estabilización de Contenido (MDX)
1. Actualizar `src/content/the-bloop.mdx`:
   - Cambiar imagen a `/assets/Universo Colosos/bloopresolution.png`.
2. Actualizar `src/content/el-gran-maja.mdx`:
   - Cambiar imagen a `/assets/Universo Colosos/elgranmajaResolution.png`.
3. Actualizar `src/content/phillip-forte.mdx`:
   - Cambiar imagen a `/assets/Universo Colosos/phillipresolution.png`.
4. Crear artículos base para completar la jerarquía (placeholders para Especies, Vehículos, etc.).

### Fase 3: Sidebar y Layout
1. Implementar `src/components/wiki/AppSidebar.tsx` consumiendo la configuración de navegación.
2. Añadir breadcrumbs o indicadores de sección en el layout de la wiki.

### Fase 4: Rediseño del Portal de la Wiki
1. Actualizar `src/app/(wiki)/wiki/page.tsx` para incluir secciones de "Contenido Destacado" (The Bloop vs El Gran Majá), "Últimos Avistamientos" y "Explorar por Universo".

## 5. Verification & Testing
- Validar que el Sidebar sea responsivo y colapsable.
- Comprobar que todos los enlaces del Sidebar funcionen correctamente.
- Verificar que las imágenes de alta resolución carguen sin errores de path.
- Asegurar que la validación de Zod siga pasando tras los cambios en MDX.

## 6. Migration & Rollback
- Los cambios son principalmente de UI y contenido estático. En caso de error crítico, se puede revertir al layout anterior eliminando el `SidebarProvider`.
