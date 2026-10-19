import type { Metadata } from 'next';
import { Inter, Geist_Mono, Unbounded, Barlow_Condensed } from 'next/font/google';
import './globals.css';

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3131",
  ),
  title: "Universos de BorisaoBlois",
  description: "Explora la inmensidad de mis universos y sus historias",
};

import { Providers } from './providers';
import { SearchPalette } from '@/components/search/SearchPalette';
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
            {/* Una sola paleta de búsqueda para todo el sitio; necesita el QueryClient de Providers. */}
            <SearchPalette />
          </Providers>
        </TooltipProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
