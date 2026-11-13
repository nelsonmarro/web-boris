import type { DefaultSession } from 'next-auth';

/** Datos del panel que viajan en la sesión (spec CMS §4.3). */
interface AdminClaims {
  role?: string;
  /** La sesión se abrió con el segundo factor. */
  mfa?: boolean;
  sessionVersion?: number;
}

declare module 'next-auth' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends AdminClaims {}
  interface Session {
    user: { id: string } & AdminClaims & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface JWT extends AdminClaims {}
}
