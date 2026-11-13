import { auth } from "@/core/auth/auth";
import { NextRequest, NextResponse } from "next/server";

// Auth.js v5 (NextAuth) proxy handler for Next.js App Router
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: NextRequest & { auth: any }) => {
  // Solo una sesión con usuario cuenta: ante un error de configuración (o una cookie `callback-url` inválida),
  // Auth.js deja en `req.auth` un objeto de error, y `!!req.auth` daba por buena la sesión (fail open).
  const isLoggedIn = !!req.auth?.user;
  const { nextUrl } = req;

  // Protected routes example
  const isProtected = nextUrl.pathname.startsWith("/admin") || 
                      nextUrl.pathname.startsWith("/settings");

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/api/auth/signin", nextUrl));
  }
  
  return NextResponse.next();
});

// El proxy solo corre donde protege algo (D3): así las páginas públicas no reciben cookies de Auth.js
// ni chocan con la caché ISR. `/api/auth` queda fuera: lo atiende su propio route handler.
export const config = {
  matcher: ["/admin/:path*", "/settings/:path*"],
};
