# UX fan · Ola A (arreglos rápidos) — plan

**Issue:** #49 (épica #52). **Auditoría:** `docs/audits/2026-10-18-experiencia-fan/README.md` (hallazgos #1, #6, #8, #9, #10, #17).
**Rama:** `feat/ux-fan-ola-a`.

**Ejecución:** 3 implementadores en paralelo, uno por tarea, sobre conjuntos de archivos disjuntos. El orquestador:
- revisa cada diff con un revisor;
- ejecuta `npm run build` y la QA con Chrome DevTools a 390 y 1440;
- hace un commit por tarea.

Los implementadores no hacen commit ni ejecutan `next build`, porque comparten `.next`.

## Restricciones globales

- **Solo canon:** no se escribe lore nuevo. Etiquetas de navegación y textos de interfaz sí.
- Sin dependencias nuevas.
- Paleta abisal: superficies sólidas `#061a2e`; `.glass-liquid` solo en navbar, footer y botón secundario.
- Texto ≥ 11 px.
- Next 16: `typedRoutes` (casts `as Route` en hrefs con query); `next/image` con `fetchPriority`/`loading`.
- Tailwind v4: las clases van literales en el código.
- **Validación por tarea:**
  - `npx tsc --noEmit`, `npm run lint` y `npm test`;
  - `npm run check:content` si se tocan contenido o navegación.

---

## Tarea 1 — Menú móvil y cabecera de la wiki (hallazgos #1 y #17)

**Archivos:** `src/app/globals.css`, `src/components/ui/sidebar.tsx`, `src/app/(wiki)/wiki/layout.tsx`.

1. **Causa raíz del fondo transparente:**
   - `globals.css` mapea `--color-sidebar*: var(--sidebar*)`, pero `:root` no define ninguna variable `--sidebar*`.
   - Por eso `bg-sidebar` del `SheetContent` móvil (`sidebar.tsx`, ~l. 190) es transparente.
   - En escritorio no se nota porque `AppSidebar` pone `bg-[#061a2e]` en el contenedor exterior.

   **Arreglo:** definir en `:root` al menos `--sidebar: #061a2e;` y `--sidebar-foreground` (blanco, igual que `--foreground`).
   - Definir `--sidebar-border: rgb(255 255 255 / 0.08)`, y `--sidebar-accent` / `--sidebar-ring` solo si no cambian el aspecto de escritorio.
   - Comprobar el hover de los items del menú en escritorio antes y después; si cambia, no definir `--sidebar-accent`.
   - El panel móvil debe verse sólido, con un borde derecho `border-white/10`.
2. **Accesibilidad del panel móvil** (`sidebar.tsx`, ~l. 199–200):
   - `<SheetTitle>Sidebar</SheetTitle>` → `Menú de la wiki`;
   - `<SheetDescription>Displays the mobile sidebar.</SheetDescription>` → `Navegación por los universos y expedientes del archivo.`
3. **Un solo logo** en la cabecera de la wiki (`layout.tsx`, `<NavLogo size="sm" />`):
   - en escritorio (≥ md), con el menú lateral expandido, ocultar el `NavLogo` de la cabecera; el menú ya muestra "BorisaoBlois · Wiki oficial";
   - con el menú colapsado (modo icono) o en móvil, se ve.
   - Preferir CSS puro para no tener parpadeo de hidratación. El contenedor de `SidebarProvider` lleva `group/sidebar-wrapper`, y el `<div>` exterior del `Sidebar` lleva `data-slot="sidebar"` y `data-state="expanded|collapsed"`. Una variante del estilo `md:group-has-[[data-slot=sidebar][data-state=expanded]]/sidebar-wrapper:hidden` lo resuelve; verificar el selector exacto en el DOM.
   - Si no es viable, un componente cliente con `useSidebar()`, documentando el porqué.

**Verificación (la hace el orquestador en el navegador):**
- 390: el panel del menú es opaco y el título accesible está en español.
- 1440 con el menú expandido: un solo logo.
- 1440 con el menú colapsado: logo en la cabecera.

## Tarea 2 — Orden de descubrimiento y navegación (hallazgos #9 y #10)

**Archivos:**
- `src/features/monsters/lib/discovery-order.ts` (nuevo);
- `tests/monsters/discovery-order.test.ts` (nuevo);
- `src/features/monsters/actions/get-wiki-articles.ts`;
- `src/features/monsters/components/wiki/WikiCommandPalette.tsx`;
- `src/features/monsters/lib/related.ts`;
- `src/features/monsters/config/wiki-navigation.ts`;
- `src/features/marketing/actions/get-lore-stats.ts`.

1. **Módulo puro `discovery-order.ts`.** Sin imports en tiempo de ejecución; solo `import type`, para que `node:test` lo ejecute con strip-types. Las rutas de import de los tests son relativas, como en `tests/community/*.test.ts`.
   - `richness(fm)`, con un subconjunto del frontmatter (`status`, `category`, `image`, `stats`, `infobox`, `description`):
     - `status === 'proximamente'` → −100;
     - `category` `Directorio` o `Categoría` → −2;
     - `stats` → +2;
     - `image` que no sea de marca (`/assets/Branding/`) → +1;
     - `infobox` no vacío → +1.
   - `compareDiscovery(a, b)`: `richness` descendente y, a igualdad, título con `localeCompare(…, 'es')`.
   - Tests: un stub siempre va detrás de un artículo con contenido; con stats va antes que sin stats; un directorio va detrás de una ficha con el mismo resto; el desempate es alfabético; las imágenes de marca no suman.
2. **Explorador** (`getWikiArticles`): tras filtrar, ordenar con `compareDiscovery`, con o sin búsqueda.
   - Resultado esperado: buscar "phillip" devuelve primero Phillip Forte y no "Humanos del Universo Colosos".
   - La relevancia por título queda para la Ola B; no implementarla aquí.
3. **Paleta ⌘K** (`WikiCommandPalette.tsx` y `getWikiIndex`):
   - el índice incluye `status` y `stats` (o un campo `richness` precalculado);
   - con la consulta vacía, mostrar los 10 primeros por `compareDiscovery`;
   - con consulta, mantener la puntuación por título y usar `compareDiscovery` como desempate;
   - los resultados `proximamente` muestran `ProximamenteChip` (variante `size="compact"`) junto al título.
4. **Relacionados** (`related.ts`): excluir los artículos con `category: 'Directorio'` en todos los pasos, y ordenar al final los `status: 'proximamente'` sin perder el límite `max`.
   - Calcular la lista candidata completa (hermanos → categoría → universo, sin repetidos), aplicar las dos reglas y luego cortar a `max`.
   - Mantener la firma pública.
5. **Navegación** (`wiki-navigation.ts`); solo datos, con títulos y destinos de artículos que existen.
   - **Libros:** `[{ "Libros del universo Colosos", /wiki/libros-colosos }, { "El Destello de los Colosos", /wiki/el-destello-de-los-colosos }]`. Se quita la etiqueta truncada.
   - **Personajes › Humanos:** añadir `{ "Cael Cortés", /wiki/cael-cortes }`.
   - **Especies:** primer item `{ "Especies identificadas", /wiki/especies }`.
   - **Categorías:** primer item `{ "Categorías de monstruos", /wiki/categorias-monstruos }`.
   - **Vehículos:** primer item `{ "Vehículos y tecnología", /wiki/vehiculos }`.
   - **Organizaciones:** primer item `{ "Todas las organizaciones", /wiki/organizaciones }`.
   - Ejecutar `npm run check:content`: valida que cada entrada exista.
6. **Contador de la landing** (`get-lore-stats.ts`): `loreEntries` cuenta solo los artículos sin `status: 'proximamente'`.

## Tarea 3 — Ficha de artículo: Arena y retrato (hallazgos #8 y #6)

**Archivos:**
- `src/features/monsters/components/wiki/article/WikiArticleHeader.tsx`;
- `src/features/monsters/components/wiki/article/WikiArticleContent.tsx`;
- `src/app/(wiki)/wiki/[slug]/page.tsx`;
- `src/features/monsters/components/arena/components/ArenaSimulator.tsx`;
- `src/features/monsters/components/wiki/mdx/WikiGallery.tsx`;
- `src/content/phillip-forte.mdx`.

1. **CTA de la Arena:**
   - `WikiArticleHeader` recibe `arenaSlug?: string`. Si existe, junto a las acciones muestra un enlace `Enfrentar en la Arena` (icono `Swords`) a `/wiki/arena?a=<slug>` (`as Route`).
   - Estilo de botón primario compacto: naranja con texto `#00122E`, `h-10`, `rounded-xl`, `text-[11px] font-bold uppercase tracking-wider`, foco visible.
   - `page.tsx` pasa `arenaSlug` solo si el artículo tiene `stats` (usar `hasStats` de `lib/stats.ts`).
2. **Arena con un solo parámetro** (`ArenaSimulator.tsx`): si `slugB === slugA` tras resolver los valores por defecto, `slugB` pasa a ser el primer combatiente distinto de `slugA`. Así `?a=bogbo` funciona siempre.
3. **Retrato arriba** (`WikiArticleContent.tsx`):
   - Condición:
     - no hay rail (`!showRail`);
     - hay `image` que no es de marca;
     - la ruta de la imagen no aparece ya en el cuerpo del MDX (comprobar con `content.includes(image)` o lo equivalente disponible);
     - `category` es `Humano`, `Animal`, `Coloso`, `Titán` o `Entidad`.
   - Si se cumple, mostrar la portada como primera figura del cuerpo: ancho completo hasta 800 px, `aspect-[4/3] md:aspect-video`, `object-cover` con `objectPosition: imagePosition ?? '50% 30%'`, `rounded-2xl`, borde `white/10` y pie `imageCaption` si existe.
   - Indicar en el informe qué artículos la reciben.
4. **Encuadre** (`WikiImage` en `WikiGallery.tsx`):
   - añadir la prop opcional `position?: string` (`object-position` inline; por defecto, el comportamiento actual `object-top`);
   - registrar la prop en los tipos y en el MDX si hace falta (los componentes se registran en `MdxRenderer.tsx` y `src/mdx-components.tsx`, pero aquí solo cambia una prop);
   - en `phillip-forte.mdx`, dar al retrato un `position` que muestre el rostro completo (ojos, nariz y boca) en el recorte 4:3 móvil;
   - mirar las dimensiones reales de `Phillip_Forte_retrato.webp` para elegir el valor y justificarlo en el informe.

## Tarea 4 — QA y entrega (orquestador)

- `npm run lint`, `npm test`, `npm run check:content` y `npm run build`.
- Chrome DevTools sobre `next start -p 3131`, a 390 y 1440:
  - menú móvil opaco;
  - logo único;
  - "phillip" → Phillip primero;
  - ⌘K vacío empieza por fichas con contenido;
  - chip Próximamente en la paleta;
  - relacionados de Phillip sin directorios y con los stubs al final;
  - CTA de la Arena en El Gran Majá → Arena con Majá y otro rival;
  - retrato de Phillip arriba y su primer plano bien encuadrado;
  - menú con las entradas nuevas.
- Lighthouse a11y 100 en `/wiki` y en una ficha.
- Capturas en `docs/audits/2026-10-18-experiencia-fan/ola-a/`.
- PR "Closes #49", CI, squash merge y borrar la rama.
