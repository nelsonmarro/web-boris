import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
