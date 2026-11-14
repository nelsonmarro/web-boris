import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/features/community/lib/voter";
import { ADMIN_ROLE, authenticateAdmin, completeSetupLogin } from "@/features/admin/server/login";
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
        if (!login) return null;
        return { id: login.id, email: login.email, name: login.name, role: ADMIN_ROLE, mfa: login.mfa, sessionVersion: login.sessionVersion };
      },
    }),
    // Entrada al terminar `/admin/configurar`: solo con el pase de un solo uso que crea esa acción en el servidor
    // (`createHandoff`, firmado con AUTH_SECRET y caducado al minuto). Sin él no hay forma de usar este proveedor.
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
