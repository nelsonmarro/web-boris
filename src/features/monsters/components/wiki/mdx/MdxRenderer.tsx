import * as React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from './MdxComponents';

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
