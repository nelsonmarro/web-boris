import { auth } from "@/core/auth/auth";
import { NextRequest, NextResponse } from "next/server";

// Auth.js v5 (NextAuth) proxy handler for Next.js App Router
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: NextRequest & { auth: any }) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // Protected routes example
  const isProtected = nextUrl.pathname.startsWith("/admin") || 
                      nextUrl.pathname.startsWith("/settings");

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/api/auth/signin", nextUrl));
  }
  
  return NextResponse.next();
});

// Config matcher to exclude internal routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
