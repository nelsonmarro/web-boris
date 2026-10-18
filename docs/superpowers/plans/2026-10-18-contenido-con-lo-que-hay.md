# Ola 6 — Contenido "con lo que hay" (#26, #3, #4, #1, #2)

**Decisión de Nelson (2026-10-17):** para el contenido de Boris, *usar solo lo que hay*: no esperar material nuevo; publicar lo canónico y marcar el resto como "Próximamente". Drive revisado el 2026-10-18: sin subidas de Boris desde el 2026-08-25.

## Tarea A — Sección "Sobre Boris" (#26)
`src/features/marketing/sections/AboutBorisSection.tsx`
- Fuera el copy inventado ("narrador de misterios y guardián de los archivos abisales…", "El Arquitecto del Lore", "Señal de Origen").
- Solo hechos: BorisaoBlois crea los universos Colosos, Capitán de Galeón y Ellos Llegaron, y La Hecatombe del Lapeón está en preparación; publica en YouTube; contacto por email. Universos y enlaces salen de `config/universes.ts` y `config/social.ts` (sin duplicar datos).
- Biografía → chip/nota "Próximamente" (mismo lenguaje visual que la wiki).
- El logo de la marca se mantiene como imagen (es la marca, no lore), presentado como logo.

## Tarea B — La Hecatombe del Lapeón (#3)
- Nuevo `src/content/la-hecatombe-del-lapeon.mdx`: `universe: "La Hecatombe del Lapeón"`, `category: "Historia"`, sinopsis canónica (docx) literal, `status: proximamente`, sin imagen (placeholder por categoría).
- Sección nueva en `wiki-navigation.ts`.
- `config/universes.ts`: `universeKey` para que la tarjeta enlace a la wiki; la tarjeta conserva la señal "Próximamente" porque no hay arte.

## Tarea C — Issues (orquestador)
- #4: solo YouTube confirmado; `social.ts` es la fuente única → cerrar.
- #1 y #2: consolidados en #41 (lista actualizada tras la auditoría) → cerrar con enlace.
- #26 y #3: `Closes` en el PR.

## Verificación
lint · check:content · build · QA Chrome DevTools (landing: universos + Sobre Boris a 1440/390; wiki: artículo nuevo, filtro de universo, sidebar).
