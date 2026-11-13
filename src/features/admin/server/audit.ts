import 'server-only';
import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'login.ok'
  | 'login.fail'
  | 'login.throttled'
  | 'logout'
  | 'setup.ok'
  | 'setup.fail'
  | 'article.create'
  | 'article.save'
  | 'article.publish'
  | 'article.discard'
  | 'article.delete'
  | 'article.undelete'
  | 'article.restore-version';

/** Apunta una acción del panel. Nunca lanza: un fallo del registro no debe tumbar la acción que lo provoca. */
export async function audit(action: AuditAction, data: { userId?: string | null; target?: string; ipHash?: string | null } = {}): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: { action, userId: data.userId ?? null, target: data.target?.slice(0, 200) ?? null, ipHash: data.ipHash ?? null },
    });
  } catch (error) {
    console.error('[admin:audit]', action, error instanceof Error ? error.message : error);
  }
}
