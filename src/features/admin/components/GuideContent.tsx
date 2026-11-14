import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { rehypeHeadingIds } from '@/utils/rehype-heading-ids';
import { remarkSafeMdx } from '@/utils/remark-safe-mdx';
import { GUIDE_IMAGE_NAME, guideImageSrc } from '../lib/guide';
import './guide.css';

/**
 * Una captura del manual a todo el ancho y sin recortar (las de la wiki van en 16:9 con `object-cover` y pasarían por el
 * optimizador de Next, que no lleva la sesión). Pulsarla la abre entera en otra pestaña.
 */
function Captura({ nombre, alt, pie }: { nombre?: string; alt?: string; pie?: string }) {
  if (!nombre || !GUIDE_IMAGE_NAME.test(nombre)) return null;
  const src = guideImageSrc(nombre);
  return (
    <figure className="wb-guide-shot">
      <a href={src} target="_blank" rel="noopener noreferrer" className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        {/* eslint-disable-next-line @next/next/no-img-element -- captura privada del panel: no pasa por el optimizador */}
        <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" />
        <span className="sr-only"> (abrir la captura entera en una pestaña nueva)</span>
      </a>
      {pie ? <figcaption>{pie}</figcaption> : null}
    </figure>
  );
}

const components = { Captura };
const COMPONENTS: ReadonlySet<string> = new Set(Object.keys(components));

/** El manual del panel (`guia.md`): títulos con ancla, pasos numerados en naranja, avisos y capturas. */
export function GuideContent({ source }: { source: string }) {
  return (
    <div className="wb-guide">
      <MDXRemote
        source={source}
        components={components}
        options={{
          disableImports: true,
          disableExports: true,
          mdxOptions: { rehypePlugins: [rehypeHeadingIds], remarkPlugins: [[remarkSafeMdx, { components: COMPONENTS }]] },
        }}
      />
    </div>
  );
}
