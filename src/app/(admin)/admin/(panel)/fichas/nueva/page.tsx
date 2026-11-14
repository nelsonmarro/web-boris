import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { NewArticleForm } from '@/features/admin/components/NewArticleForm';
import { ARTICLE_CATEGORIES } from '@/features/admin/lib/article-template';
import { UNIVERSE_OPTIONS } from '@/features/admin/lib/universe-options';

export const metadata: Metadata = { title: 'Nueva ficha' };

export default async function NewArticlePage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/fichas" className="inline-flex min-h-10 items-center text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-primary">
        ← Todas las fichas
      </Link>
      <h1 className="text-3xl font-bold text-white">Nueva ficha</h1>
      <NewArticleForm universes={UNIVERSE_OPTIONS} categories={[...ARTICLE_CATEGORIES]} />
    </div>
  );
}
