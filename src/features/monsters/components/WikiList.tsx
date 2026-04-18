'use client'

import Link from "next/link";
import Image from "next/image";
import { useWikiStore } from "@/store/wiki-store";
import useStore from "@/hooks/use-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WikiArticle } from "@/core/types/wiki";

interface WikiListProps {
  initialArticles: WikiArticle[];
}

export default function WikiList({ initialArticles }: WikiListProps) {
  // Use custom hook to prevent hydration mismatch for persistent state or complex state
  // Even though wikiStore isn't persistent yet, using this pattern for scalability
  const searchQuery = useStore(useWikiStore, (state) => state.searchQuery) ?? "";
  const selectedUniverse = useStore(useWikiStore, (state) => state.selectedUniverse) ?? null;
  
  const setSearchQuery = useWikiStore((state) => state.setSearchQuery);
  const setSelectedUniverse = useWikiStore((state) => state.setSelectedUniverse);

  const filteredArticles = initialArticles.filter((article) => {
    const matchesQuery = article.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.frontmatter.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUniverse = !selectedUniverse || article.frontmatter.universe === selectedUniverse;
    return matchesQuery && matchesUniverse;
  });

  const universes = Array.from(new Set(initialArticles.map(a => a.frontmatter.universe)));

  return (
    <div className="space-y-12">
      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-md">
        <input 
          type="text" 
          placeholder="Buscar criatura o personaje..." 
          className="w-full md:max-w-md bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button 
            onClick={() => setSelectedUniverse(null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${!selectedUniverse ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
          >
            Todos
          </button>
          {universes.map(universe => (
            <button 
              key={universe}
              onClick={() => setSelectedUniverse(universe)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${selectedUniverse === universe ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
            >
              {universe}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <Link href={`/wiki/${article.slug}`} key={article.slug}>
              <Card className="h-full hover:border-primary/50 transition-colors bg-card hover:bg-card/80 cursor-pointer border-border group">
                {article.frontmatter.image && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                    <Image 
                      src={article.frontmatter.image} 
                      alt={article.frontmatter.title} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/20 text-primary rounded-full">
                      {article.frontmatter.universe}
                    </span>
                    {article.frontmatter.category && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {article.frontmatter.category}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">
                    {article.frontmatter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {article.frontmatter.description || "Sin descripción disponible."}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-muted-foreground italic">
            No se encontraron criaturas o personajes que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
