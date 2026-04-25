import * as React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import { AbyssalAlert } from './AbyssalAlert';
import { AbyssalTable } from './AbyssalTable';
import { Badge } from '@/components/ui/badge';

const mdxComponents = {
  // Custom styled components for MDX
  AbyssalAlert,
  AbyssalTable,
  Badge,
  
  // Standard HTML overrides
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl md:text-5xl font-bold text-white italic tracking-tight uppercase mt-12 mb-6" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl md:text-3xl font-bold text-white italic tracking-tight uppercase mt-10 mb-4 border-l-4 border-primary pl-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold text-primary uppercase tracking-wider mt-8 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-lg text-white/70 leading-relaxed font-medium mb-6" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-none space-y-4 mb-8 pl-4" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-3 text-white/80 font-medium" {...props}>
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0 shadow-[0_0_8px_rgba(255,115,0,0.8)]" />
      <span>{props.children}</span>
    </li>
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="relative block aspect-video w-full my-12 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl glass-liquid">
      <span className="block absolute inset-0 glass-reflection opacity-30" />
      <Image 
        src={(props.src as string) || ""} 
        alt={props.alt || ""} 
        fill 
        className="object-cover transition-transform duration-1000 hover:scale-105" 
      />
    </span>
  ),
  hr: () => (
    <hr className="my-12 border-white/5" />
  ),
};

interface MdxRendererProps {
  content: string;
}

export function MdxRenderer({ content }: MdxRendererProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-headings:tracking-tight">
      <MDXRemote 
        source={content} 
        components={mdxComponents}
      />
    </div>
  );
}
