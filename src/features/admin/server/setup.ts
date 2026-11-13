import 'server-only';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { generateTotpSecret, otpauthUri } from '../lib/totp';
import { open, seal } from '../lib/secret-box';
import { adminSecret } from './app-secret';

const ISSUER = 'Wiki BorisaoBlois';

/**
 * Secreto TOTP pendiente de confirmar de una cuenta sin 2FA (lo crea la primera vez) y su QR. `null` si la cuenta ya
 * tiene el 2FA activado o falta `AUTH_SECRET`.
 */
export async function pendingTotp(userId: string): Promise<{ secret: string; qrDataUrl: string } | null> {
  const appSecret = adminSecret();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, totpSecret: true, totpEnabledAt: true } });
  if (!appSecret || !user?.email || user.totpEnabledAt) return null;

  let secret = user.totpSecret ? open(user.totpSecret, appSecret, 'totp') : null;
  if (!secret) {
    secret = generateTotpSecret();
    await prisma.user.update({ where: { id: userId }, data: { totpSecret: seal(secret, appSecret, 'totp') } });
  }
  const qrDataUrl = await QRCode.toDataURL(otpauthUri(secret, user.email, ISSUER), { margin: 1, width: 240 });
  return { secret, qrDataUrl };
}
