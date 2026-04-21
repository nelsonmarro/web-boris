'use client';

import * as React from 'react';
import { WikiFilters } from './wiki/WikiFilters';
import { WikiArticleCard } from './wiki/WikiArticleCard';
import { WikiEmptyState } from './wiki/WikiEmptyState';

interface Article {
  slug: string;
  frontmatter: {
    title: string;
    universe: string;
    category?: string;
    description?: string;
  };
}

export function WikiList({ articles }: { articles: Article[] }) {
  const [search, setSearch] = React.useState("");

  const filteredArticles = articles.filter(article => 
    article.frontmatter.title.toLowerCase().includes(search.toLowerCase()) ||
    article.frontmatter.universe.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Search and Filters Section */}
      <WikiFilters onSearchChange={setSearch} />

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <WikiArticleCard 
              key={article.slug} 
              slug={article.slug} 
              frontmatter={article.frontmatter} 
            />
          ))
        ) : (
          <WikiEmptyState />
        )}
      </div>
    </div>
  );
}
