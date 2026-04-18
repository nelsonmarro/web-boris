import { Skeleton } from "@/components/ui/skeleton";

export default function WikiArticleLoading() {
  return (
    <div className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
      <article className="bg-card border border-border rounded-2xl p-6 md:p-12 shadow-lg">
        <header className="mb-10 text-center flex flex-col items-center">
          <div className="flex justify-center gap-3 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-64 md:h-96 w-full rounded-xl mt-8" />
        </header>

        <div className="space-y-4 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="py-4" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </article>
    </div>
  );
}
