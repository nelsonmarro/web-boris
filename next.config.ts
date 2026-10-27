import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La imagen Docker de producción compila con NEXT_OUTPUT=standalone (servidor mínimo sin node_modules completos);
  // en local, `next start` sigue igual.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  typedRoutes: true,
  images: {
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
  async redirects() {
    return [
      // Slug canónico de Criyonte: el enlace antiguo sigue funcionando.
      { source: '/wiki/slowdown-criyote', destination: '/wiki/slowdown-criyonte', permanent: true },
    ];
  },
};

export default nextConfig;
