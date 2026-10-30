/**
 * Preguntas frecuentes de una ficha (`faq` del frontmatter): el JSON-LD `FAQPage` y los párrafos de cada respuesta.
 * Puro (lo prueba node:test): sin imports.
 */

export interface FaqEntry {
  pregunta: string;
  respuesta: string;
}

/** Ancla y título de la sección: también entra en el índice de la ficha. */
export const FAQ_ID = 'preguntas-frecuentes';
export const FAQ_TITLE = 'Preguntas frecuentes';

/** Párrafos de una respuesta: se separan con una línea en blanco; los saltos simples quedan como espacios. */
export function faqParagraphs(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p !== '');
}

/** JSON-LD `FAQPage` (schema.org) de las preguntas, o `null` si no hay ninguna. `url`, la canónica de la ficha. */
export function faqJsonLd(faq: readonly FaqEntry[] | undefined, url?: string): Record<string, unknown> | null {
  if (!faq || faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(url ? { url } : {}),
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.pregunta.trim(),
      acceptedAnswer: { '@type': 'Answer', text: faqParagraphs(item.respuesta).join('\n\n') },
    })),
  };
}

/**
 * JSON para un `<script type="application/ld+json">`: `JSON.stringify` no escapa `<`, así que un texto con
 * `</script>` cerraría la etiqueta (guía JSON-LD de Next). Se escapan `<`, `>` y `&` a su forma `\u00XX`.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
