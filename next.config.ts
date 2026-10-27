import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La imagen Docker de producción compila con NEXT_OUTPUT=standalone (servidor mínimo sin node_modules completos);
  // en local, `next start` sigue igual.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  typedRoutes: true,
  // No anunciar el framework en `X-Powered-By`.
  poweredByHeader: false,
  images: {
    // Calidades permitidas en `/_next/image`: 75 (por defecto de next/image) y 85 (`IMAGE_QUALITY`, la de todo el sitio).
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  // Cabeceras mínimas que no rompen YouTube ni las imágenes. Sin CSP a propósito: con los scripts en línea
  // de Next haría falta un nonce, y eso volvería dinámicas las páginas estáticas.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Slug canónico de Criyonte: el enlace antiguo sigue funcionando.
      { source: '/wiki/slowdown-criyote', destination: '/wiki/slowdown-criyonte', permanent: true },
    ];
  },
};

export default nextConfig;
