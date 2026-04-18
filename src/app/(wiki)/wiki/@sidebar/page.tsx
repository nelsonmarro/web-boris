import Link from "next/link";
import { getAllArticles } from "@/utils/mdx";

export default async function Sidebar() {
  const articles = await getAllArticles();
  
  // Group by universe
  const grouped = articles.reduce((acc, article) => {
    const uni = article.frontmatter.universe;
    if (!acc[uni]) acc[uni] = [];
    acc[uni].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Explorar Wiki</h3>
        {Object.entries(grouped).map(([universe, arts]) => (
          <div key={universe} className="mb-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 border-l-2 border-primary/30">
              {universe}
            </h4>
            <ul className="space-y-1">
              {arts.map(art => (
                <li key={art.slug}>
                  <Link 
                    href={`/wiki/${art.slug}`}
                    className="text-sm text-foreground/70 hover:text-primary transition-all block py-1.5 px-2 rounded-md hover:bg-muted"
                  >
                    {art.frontmatter.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
