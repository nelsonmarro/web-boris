# Patrones de diseño de wikis — investigación para la Wiki BorisaoBlois

Fuentes revisadas: 299 (Exa, 4 sub-agentes) — Fandom, wiki.gg, Wookieepedia, Genshin Wiki, Fextralife (Elden Ring), Bulbapedia/Pokémon DB, Subnautica Wiki, Wikizilla, Monster Hunter Wiki, MediaWiki Citizen skin, Vector 2022, op.gg/mobalytics, RuneScape Wiki, Indie Wiki Buddy.

## 1. Qué critica la gente de Fandom (y qué hacen las alternativas)

| Queja | Qué hacen wiki.gg / RuneScape Wiki / indie wikis |
|---|---|
| Ancho fijo: 40% de la pantalla es rail derecho con anuncios | Ancho completo o controlable por el usuario |
| Navegación dividida (barra global arriba + lateral) | Una sola navegación, sidebar limpio |
| TOC escondido | TOC persistente/sticky con sección actual resaltada (test MediaWiki: preferido por el 100% de participantes) |
| Sin dark mode, mal en móvil | Dark mode estándar; secciones colapsables en móvil (no "muro de texto") |
| Clutter: videos autoplay, "trending", social | Contenido al centro, sin ruido |

Anti-patrones: ancho falso, navegación duplicada, media autoplay, blur/adornos sobre el texto.

## 2. Anatomía de una buena página de criatura (Wookieepedia, Fextralife, Genshin)

Orden observado: título + infobox → párrafo de identidad → cita → **stats visuales** → habilidades (tabber si hay formas/etapas) → debilidades/relaciones → **galería con lightbox a mitad de artículo** → lore profundo → **navbox de relacionados** al pie.

Componentes clave: infobox como ancla visual, tabber para variantes (macho/hembra, cría/adulto), tabla/barras de stats con iconos, galería con lightbox, navbox al pie, cita destacada.

## 3. Patrones de bestiario / kaiju que encajan con Colosos

| Patrón | Visto en | Aplicación en nuestra wiki |
|---|---|---|
| Barras de stats normalizadas | Pokémon DB | Render de `stats` (intelligence/hostility 1-10, power/defense 0-100) como barras naranja sobre superficie oscura |
| Badge de amenaza por color | Subnautica ("Extreme threat – avoid") | hostility 1-3 verde, 4-6 ámbar, 7-10 rojo, con frase de evaluación |
| Comparador de tamaño con siluetas | Wikizilla, size-comparison sites | Siluetas SVG a escala con buzo (1.75 m) y submarino; lee `stats.length` |
| Entrada de "Databank" | Subnautica | Componente `<RegistroDelirium>`: caja de informe científico con 3-4 hallazgos |
| Matriz Versus | Monster Hunter (hitzones) | Arena con datos reales: ataques de A vs defensas de B, celdas coloreadas |
| Grid por categoría | Wikizilla, MH | Hub con Colosos / Titanes / Medianos como tarjetas con arte |

## 4. Convenciones visuales de wikis modernas (Citizen, Vector 2022, op.gg)

| Convención | Valores concretos |
|---|---|
| Ancho de lectura | 720–800 px (Vector 2022: ~80 caracteres/línea) |
| Tipografía cuerpo | 16–18 px, line-height 1.6; pesos claros para jerarquía |
| TOC | Sticky en columna lateral en ≥lg; drawer/⌘K en móvil; auto-colapsa subsecciones |
| Dark mode | 4-5 niveles de superficie con pasos de luminancia 5-8%; elevación tonal, no sombras |
| Hero | Arte a ancho completo con degradado a `#00122E`, sub-header sticky con identidad al hacer scroll |
| Relacionados | 3-5 tarjetas con miniatura al pie |
| Búsqueda | Command palette con resultados instantáneos |
| Micro-interacciones | Transiciones 150-200 ms; nada que compita con la lectura |

**Advertencia glassmorphism**: el blur reduce el contraste percibido del texto 15-25%. Regla: glass (40-50 px) solo en hero, navegación, modales; blur ligero (10-15 px) en sidebar/TOC; **cero blur bajo el texto del artículo**. Naranja `#FF7300` reservado para interactivo y énfasis, no para grandes bloques.

## 5. Cruce con el estado actual de nuestra wiki

| Carencia actual | Patrón que la resuelve | Prioridad |
|---|---|---|
| `stats` del schema no se renderiza; `ArticleStatCard.tsx` huérfano | Barras de stats + badge de amenaza en la infobox | Alta |
| Arena Versus es un mock sin datos | Versus con `getAllArticles()` + matriz/radar de stats | Alta |
| Footer de artículo sin relacionados | Navbox automático desde `wiki-navigation.ts` (mismo grupo) + 3 tarjetas | Alta |
| TOC inline, no sticky | TOC sticky lateral en ≥lg, drawer en móvil | Media |
| Portada con 3 destacados hardcodeados | Hub por categoría con arte + "Criatura destacada" rotativa | Media |
| Cards sin señal de peligro/tamaño | Badge de hostilidad + longitud + color por categoría | Media |
| Sin comparador de escala | Comparador de siluetas (Bloop 351 m vs buzo/submarino) | Media (alto impacto "wow") |
| Sin componente de informe | `<RegistroDelirium>` estilo databank | Baja (sabor) |
| Sin tabber | Tabber para macho/hembra, cría/adulto | Baja |
| Búsqueda simple | ⌘K command palette | Baja |
