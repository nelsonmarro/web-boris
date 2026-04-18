import { Skeleton } from "@/components/ui/skeleton";

export default function WikiLoading() {
  return (
    <div className="flex-1 container mx-auto px-4 py-24">
      <header className="mb-12">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-96 rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-48 w-full rounded-lg mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
