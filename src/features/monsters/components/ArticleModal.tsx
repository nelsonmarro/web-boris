'use client';

import * as React from 'react';
import { ArticleOverlay } from './article/components/ArticleOverlay';
import { ArticleToolbar } from './article/components/ArticleToolbar';
import { ArticleVisualProfile } from './article/components/ArticleVisualProfile';
import { ArticleIntelligenceContent } from './article/components/ArticleIntelligenceContent';
import { ArticleBrandingBar } from './article/components/ArticleBrandingBar';

interface ArticleModalProps {
  article?: {
    title: string;
    image: string;
    universe: string;
    description: string;
    content: string;
    category: string;
    stats: {
      size: string;
      danger: string;
      speed: string;
    };
  };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function ArticleModal({ article, title, description, children }: ArticleModalProps) {
  const [fileNo, setFileNo] = React.useState<string>("---");

  const displayTitle = article?.title || title || "";
  const displayDescription = article?.description || description || "";
  const displayUniverse = article?.universe || "Archivo Abisal";

  // Generate stable ID after mount to avoid hydration mismatch and purity errors
  React.useEffect(() => {
    setFileNo(Math.random().toString(36).substring(7).toUpperCase());
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 lg:p-20 overflow-hidden">
      <ArticleOverlay />

      {/* Main Glass Structure */}
      <div className="relative w-full max-w-7xl h-full flex flex-col glass-advanced rounded-[3.5rem] border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 overflow-hidden bg-black/40">
        <div className="glass-reflection opacity-40" />
        
        <ArticleToolbar />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Visual Profile Section - Left */}
          {article && (
            <ArticleVisualProfile 
              image={article.image}
              title={article.title}
              universe={article.universe}
              description={article.description}
            />
          )}

          {/* Intelligence Content Section - Right */}
          <ArticleIntelligenceContent 
            article={article}
            displayTitle={displayTitle}
            displayUniverse={displayUniverse}
            displayDescription={displayDescription}
          >
            {children}
          </ArticleIntelligenceContent>
        </div>

        <ArticleBrandingBar fileNo={fileNo} />
      </div>
    </div>
  );
}
