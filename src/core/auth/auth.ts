import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const { handlers: authHandlers, auth: authSession, signIn: authSignIn, signOut: authSignOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
});

export const handlers = authHandlers;
export const auth = authSession;
export const signIn = authSignIn;
export const signOut = authSignOut;
