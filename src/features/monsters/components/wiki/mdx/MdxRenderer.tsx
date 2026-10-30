import * as React from 'react';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import Image from 'next/image';
import { IMAGE_QUALITY } from '@/utils/image';
import Link from 'next/link';
import type { Route } from 'next';
import { rehypeHeadingIds } from '@/utils/rehype-heading-ids';
import { remarkEntityLinks } from '@/utils/remark-entity-links';
import { cn } from '@/utils/cn';
import type { EntityIndex } from '@/core/search/entity-index';

// Custom Components
import { AbyssalAlert } from '@/features/monsters/components/wiki/mdx/AbyssalAlert';
import { AbyssalTable } from '@/features/monsters/components/wiki/mdx/AbyssalTable';
import { Badge } from '@/components/ui/badge';
import {
  WikiInfobox,
  InfoSection,
  InfoField,
} from '@/features/monsters/components/wiki/mdx/WikiInfobox';
import { WikiQuote } from '@/features/monsters/components/wiki/mdx/WikiQuote';
import {
  WikiGallery,
  WikiImage,
} from '@/features/monsters/components/wiki/mdx/WikiGallery';
import { WikiTOC } from '@/features/monsters/components/wiki/mdx/WikiTOC';
import { Proximamente } from '@/features/monsters/components/wiki/mdx/Proximamente';
import { RegistroDelirium } from '@/features/monsters/components/wiki/mdx/RegistroDelirium';
import { WikiTabs, WikiTab } from '@/features/monsters/components/wiki/mdx/WikiTabs';
import { WikiH2 } from '@/features/monsters/components/wiki/mdx/WikiH2';

/** Estilo de enlace de prosa (spec #55 §1): blanco, subrayado `primary/50`, hover naranja, foco visible. */
const LINK_CLASS =
  'font-semibold text-white underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm';

const components = {
  AbyssalAlert,
  AbyssalTable,
  Badge,
  WikiInfobox,
  InfoSection,
  InfoField,
  WikiQuote,
  WikiGallery,
  WikiImage,
  WikiTOC,
  RegistroDelirium,
  Proximamente,
  WikiTabs,
  WikiTab,

  // Standard HTML overrides
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl md:text-4xl break-words font-bold text-white italic tracking-tight uppercase mt-12 mb-6"
      {...props}
    />
  ),
  h2: WikiH2,
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl md:text-2xl font-black text-primary italic uppercase tracking-wider mt-16 mb-6 pl-5 border-l-4 border-primary/50 flex items-center gap-3 clear-both scroll-mt-24"
      {...props}
    >
      <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,115,0,0.8)]" />
      {children}
    </h3>
  ),
  p: (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className="text-[17px] text-white/85 leading-[1.7] font-normal mb-6"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-none space-y-4 mb-8 pl-4" {...props} />
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-3 text-[17px] leading-[1.7] text-white/85 font-normal" {...props}>
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0 shadow-[0_0_8px_rgba(255,115,0,0.8)]" />
      <span>{children}</span>
    </li>
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <a 
      href={props.src as string} 
      target="_blank" 
      rel="noopener noreferrer"
      className="relative block aspect-video w-full my-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-zoom-in"
    >
      {props.src && (
        <Image
          quality={IMAGE_QUALITY}
          src={props.src as string}
          alt={props.alt || ''}
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-primary/20 backdrop-blur-md p-3 rounded-full border border-primary/40">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-5 h-5"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
        </div>
      </div>
    </a>
  ),
  hr: () => <hr className="my-12 border-white/5" />,
  // Enlaces internos con next/link (los automáticos de `remarkEntityLinks` y los escritos a mano);
  // anclas y mailto:/tel: como <a> normal; solo los http(s) (y `//host`) abren pestaña nueva.
  a: ({
    href = '',
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { 'data-entity-pending'?: string }) => {
    const pending = props['data-entity-pending'] === 'true';
    if (href.startsWith('/') && !href.startsWith('//')) {
      return (
        <Link
          href={href as Route}
          {...props}
          className={cn(LINK_CLASS, pending && 'decoration-dashed')}
        >
          {children}
          {pending && <span className="sr-only"> (próximamente)</span>}
        </Link>
      );
    }
    if (/^(https?:)?\/\//i.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props} className={LINK_CLASS}>
          {children}
        </a>
      );
    }
    // `#ancla`, `mailto:`, `tel:`…: se quedan en la misma pestaña.
    return (
      <a href={href} {...props} className={LINK_CLASS}>
        {children}
      </a>
    );
  },
};

interface MdxRendererProps {
  content: string;
  /** Con índice, la 1.ª mención de cada entidad en la prosa se enlaza a su ficha (spec Ola B §5). */
  entityIndex?: EntityIndex;
  /** Slug de la ficha que se renderiza: nunca se enlaza a sí misma. */
  slug?: string;
}

export function MdxRenderer({ content, entityIndex, slug }: MdxRendererProps) {
  return (
    <div className="prose prose-invert prose-base max-w-none prose-p:leading-relaxed prose-headings:tracking-tight">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            rehypePlugins: [rehypeHeadingIds],
            remarkPlugins: entityIndex ? [[remarkEntityLinks, { index: entityIndex, self: slug }]] : [],
          },
        }}
      />
    </div>
  );
}
