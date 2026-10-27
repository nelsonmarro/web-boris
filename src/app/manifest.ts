import type { MetadataRoute } from 'next';

/** Colores de marca: fondo abisal y naranja bioluminiscente. El icono es el logo existente. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Universos de BorisaoBlois',
    short_name: 'BorisaoBlois',
    description: 'Explora la inmensidad de mis universos y sus historias',
    lang: 'es',
    start_url: '/',
    display: 'standalone',
    background_color: '#00122E',
    theme_color: '#FF7300',
    icons: [{ src: '/assets/Branding/logo.webp', sizes: '512x512', type: 'image/webp' }],
  };
}
