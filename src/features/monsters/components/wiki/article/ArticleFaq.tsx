import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/core/types/wiki';
import { WikiH2 } from '@/features/monsters/components/wiki/mdx/WikiH2';
import { FAQ_ID, FAQ_TITLE, faqParagraphs } from '@/features/monsters/lib/faq';

/**
 * «Preguntas frecuentes» al final del cuerpo de la ficha (`faq` del frontmatter: solo respuestas de Boris). Cada
 * pregunta es un `<details>` nativo (teclado y lector de pantalla sin JavaScript). Sin preguntas no pinta nada. No es un
 * apartado del MDX: no cuenta en `ArchivoMeter` ni en el estándar de ficha.
 */
export function ArticleFaq({ faq }: { faq?: readonly FaqItem[] }) {
  if (!faq || faq.length === 0) return null;
  return (
    <section aria-labelledby={FAQ_ID} className="clear-both">
      <WikiH2 id={FAQ_ID}>{FAQ_TITLE}</WikiH2>
      <div className="space-y-3">
        {faq.map((item) => (
          <details key={item.pregunta} className="group rounded-xl border border-white/10 bg-[#061a2e]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-3 font-bold text-white transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
              <span>{item.pregunta}</span>
              <ChevronDown
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div className="space-y-3 px-5 pb-5 leading-relaxed text-white/80">
              {faqParagraphs(item.respuesta).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
