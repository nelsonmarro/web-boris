import * as React from 'react';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import Image from 'next/image';

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

  // Standard HTML overrides
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-4xl md:text-5xl font-bold text-white italic tracking-tight uppercase mt-12 mb-6"
      {...props}
    />
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl font-black text-white italic tracking-widest uppercase mt-28 mb-10 pl-5 py-5 clear-both relative bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-t border-white/5 flex items-center group"
      {...props}
    >
      <span className="relative z-10 drop-shadow-[0_2px_8px_rgba(255,115,0,0.6)] group-hover:text-primary transition-colors duration-300">
        {children}
      </span>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent opacity-40" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50" />
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl md:text-2xl font-black text-primary italic uppercase tracking-wider mt-16 mb-6 pl-5 border-l-4 border-primary/50 flex items-center gap-3 clear-both"
      {...props}
    >
      <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,115,0,0.8)]" />
      {children}
    </h3>
  ),
  p: (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className="text-lg text-white/90 leading-relaxed font-medium mb-6"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-none space-y-4 mb-8 pl-4" {...props} />
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-3 text-white/90 font-medium" {...props}>
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
          src={props.src as string}
          alt={props.alt || ''}
          fill
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
};

interface MdxRendererProps {
  content: string;
}

export function MdxRenderer({ content }: MdxRendererProps) {
  return (
    <div className="prose prose-invert prose-base max-w-none prose-p:leading-relaxed prose-headings:tracking-tight">
      <MDXRemote source={content} components={components} />
    </div>
  );
}
