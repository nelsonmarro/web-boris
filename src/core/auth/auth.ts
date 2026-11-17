import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/features/community/lib/voter";
import { CredentialsSignin } from "next-auth";
import { ADMIN_ROLE, authenticateAdmin, completeSetupLogin, TEMPORARY_EXPIRED, THROTTLED } from "@/features/admin/server/login";

/** Intento rechazado por exceso de fallos recientes: `loginAction` muestra «espera 15 minutos» (`code`). */
export class ThrottledSignin extends CredentialsSignin {
  code = THROTTLED;
}

/** Contraseña temporal correcta pero caducada: `loginAction` pide una nueva (`code`). */
export class TemporaryExpiredSignin extends CredentialsSignin {
  code = TEMPORARY_EXPIRED;
}
import { authConfig } from "./auth.config";

const { handlers: authHandlers, auth: authSession, signIn: authSignIn, signOut: authSignOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    // Acceso al panel /admin: correo + contraseña + código 2FA. Toda la comprobación (también el freno a la fuerza
    // bruta) vive en `authenticateAdmin`, porque este proveedor también responde en `/api/auth/callback/credentials`.
    Credentials({
      credentials: { email: {}, password: {}, code: {} },
      async authorize(credentials, request) {
        const text = (value: unknown) => (typeof value === "string" ? value : "");
        const login = await authenticateAdmin(
          { email: text(credentials.email), password: text(credentials.password), code: text(credentials.code) },
          clientIp((name) => request.headers.get(name)),
        );
        if (login === THROTTLED) throw new ThrottledSignin();
        if (login === TEMPORARY_EXPIRED) throw new TemporaryExpiredSignin();
        if (!login) return null;
        return { id: login.id, email: login.email, name: login.name, role: ADMIN_ROLE, mfa: login.mfa, sessionVersion: login.sessionVersion };
      },
    }),
    // Entrada al terminar `/admin/configurar`: solo con el pase de un solo uso que crea esa acción en el servidor
    // (`createHandoff`, firmado con AUTH_SECRET, de un solo uso y caducado a los 15 minutos). Sin él no hay forma de usar este proveedor.
    Credentials({
      id: "admin-setup",
      credentials: { token: {} },
      async authorize(credentials) {
        const login = await completeSetupLogin(typeof credentials.token === "string" ? credentials.token : "");
        if (!login) return null;
        return { id: login.id, email: login.email, name: login.name, role: ADMIN_ROLE, mfa: login.mfa, sessionVersion: login.sessionVersion };
      },
    }),
  ],
});

export const handlers = authHandlers;
export const auth = authSession;
export const signIn = authSignIn;
export const signOut = authSignOut;
