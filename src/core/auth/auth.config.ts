import type { NextAuthConfig } from 'next-auth';

/** Duración de la sesión del panel (spec CMS §4.3). */
const SESSION_HOURS = 12;

export const authConfig = {
  // Los proveedores se añaden en `auth.ts` (el de credenciales necesita la base de datos).
  providers: [],
  pages: { signIn: '/admin/login' },
  session: {
    strategy: 'jwt' as const,
    maxAge: SESSION_HOURS * 60 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      // `user` solo llega al iniciar sesión: ahí se copian al token los datos del panel.
      if (user) {
        token.role = user.role;
        token.mfa = user.mfa;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.mfa = token.mfa;
        session.user.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
