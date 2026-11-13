import 'server-only';
import type { ArticleData } from '@/core/content/overlay';
import { getStash, putStash, stashKey, type StashEntry } from '../lib/preview-stash';

/** En `globalThis`: las páginas y las acciones llevan copias separadas de este módulo (como la caché del CMS). */
const holder = globalThis as typeof globalThis & { __webBorisPreview?: Map<string, StashEntry<ArticleData>> };
const store = (): Map<string, StashEntry<ArticleData>> => (holder.__webBorisPreview ??= new Map());

export const stashArticlePreview = (userId: string, slug: string, data: ArticleData) => putStash(store(), stashKey(userId, slug), data, Date.now());
export const readArticlePreview = (userId: string, slug: string): ArticleData | null => getStash(store(), stashKey(userId, slug), Date.now());
