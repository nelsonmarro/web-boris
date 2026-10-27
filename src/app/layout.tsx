import type { Metadata } from 'next';
import { Inter, Geist_Mono, Unbounded, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { DEFAULT_OG_IMAGES, SITE_NAME, SITE_URL } from '@/lib/seo';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-unbounded',
  display: 'swap',
});

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: "Explora la inmensidad de mis universos y sus historias",
  // Valores por defecto; cada página los sustituye con `pageMetadata` (un `openGraph` de página reemplaza al de aquí).
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'es_ES',
    title: SITE_NAME,
    description: "Explora la inmensidad de mis universos y sus historias",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: { card: 'summary_large_image', images: DEFAULT_OG_IMAGES },
};

import { Providers } from './providers';
import { SearchPaletteHost } from '@/components/search/SearchPaletteHost';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} ${unbounded.variable} ${barlow.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <TooltipProvider>
          <Providers>
            {children}
            {/* Una sola paleta de búsqueda para todo el sitio; necesita el QueryClient de Providers. El host solo
                lleva el atajo ⌘K y carga la paleta en la primera apertura. */}
            <SearchPaletteHost />
          </Providers>
        </TooltipProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
