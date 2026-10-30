# Dónde va cada material de Boris

Guía rápida para Nelson. La regla de siempre: **solo canon, nada inventado**. Todo lo de abajo se copia tal cual lo
manda Boris (sin parafrasear), y cada hueco vacío **no se ve** en la web: no hay «Próximamente» ni texto de relleno.
Al rellenar uno, aparece solo. Tras cualquier cambio: `npm run check:content` y `npm run build`.

En los ejemplos, `<…>` marca dónde va el texto de Boris.

## 1. Preguntas frecuentes de una ficha → frontmatter `faq`

En el `.mdx` de la ficha (`src/content/<slug>.mdx`). Como mucho 10, pregunta y respuesta no vacías y sin repetir.
Salen al final del cuerpo como «Preguntas frecuentes» (desplegables), entran en el índice y generan el JSON-LD
`FAQPage` para buscadores. No cuentan como apartado de la ficha (ni en el medidor ni en el estándar). No escribas
además un `## Preguntas frecuentes` en el cuerpo: `check:content` lo rechaza.

```yaml
faq:
  - pregunta: "<pregunta tal como la responde Boris>"
    respuesta: "<respuesta de Boris>"
```

Una respuesta con varios párrafos: sepáralos con una línea en blanco (`respuesta: |` en YAML).

## 2. Biografía, frase principal y país → `src/features/marketing/config/boris.ts`

Tres constantes, `null` hasta que Boris las mande. Anota la fuente en el comentario de cada una.

- `BORIS_BIO`: un párrafo en «Sobre Boris» (landing).
- `BORIS_FRASE`: cita corta bajo el subtítulo del hero (≈ 120 caracteres como mucho, sin comillas: las pone la web).
- `BORIS_PAIS`: «País: …» en «Sobre Boris».

```ts
/** Biografía corta… Fuente: mensaje de Boris del <fecha>. */
export const BORIS_BIO: string | null = '<biografía de Boris>';
```

## 3. Orden de la historia y primer vídeo de cada universo → `src/content/orden-historia.json`

El archivo **no existe** hasta que Boris diga en qué orden ver los vídeos. Una entrada por universo (`universo` es el
valor exacto de `universe:` de las fichas: `Colosos`, `Capitán de Galeón`, `Ellos Llegaron`…); `ids`, los vídeos en
ese orden (cada id debe estar en `src/content/canal.json`; si es nuevo, `npm run sync:canal` primero); `nota`, opcional
(≤ 200 caracteres). Con una entrada, `/videos` ofrece «Orden de la historia» y `/empieza-aqui` muestra «Empieza por
este vídeo» con el primero.

```json
[
  { "universo": "Colosos", "ids": ["<id1>", "<id2>"], "nota": "<aclaración de Boris, opcional>" }
]
```

## 4. Qué criaturas salen en cada vídeo → `src/content/videos.json`

La lista «vídeo → criaturas» de Boris va aquí (alimenta «Aparece en» de cada ficha y los chips de `/videos`). Las
menciones del título del vídeo ya se detectan solas: solo hace falta lo que el título no dice. Si el vídeo no está en
`FEATURED_VIDEOS` ni en `canal.json`, añade `titulo` (el título real en YouTube).

```json
[
  { "id": "<id de 11 caracteres>", "fichas": ["the-bloop", "el-gran-maja"] }
]
```

## 5. Lore nuevo → MDX en `src/content/`

- Ficha existente: sustituye el `<Proximamente />` del apartado por el texto de Boris; cita textual en `WikiQuote`.
- Ficha nueva: `src/content/<slug>.mdx` siguiendo `the-bloop.mdx` (frontmatter completo y apartados del tipo, ver
  CLAUDE.md «Ficha estándar»), su entrada en `wiki-navigation.ts` y, si la categoría es nueva, en `TIPOS`.
- Ficha sellada que Boris desclasifica: quita `status: proximamente` y rellena lo que exige el estándar.
- Guarda también la fuente en `docs/` (p. ej. la versión nueva de «Frases y descripciones»).

```mdx
## Comportamiento

<texto de Boris>
```

## 6. Arte → `public/assets/` (desde el Drive «Web Boris»)

Por entidad del lore y con guiones bajos, nunca espacios (`public/assets/Universo_Colosos/The_Bloop/…`). Receta de
importación en CLAUDE.md («Material de Boris»): descargar del Drive, convertir a `.webp` y usarla solo si muestra lo
que dice el apartado.

```mdx
<WikiImage src="/assets/Universo_Colosos/<Entidad>/<Entidad>_<toma>.webp" alt="<qué se ve>" caption="<pie de Boris>" />
```
