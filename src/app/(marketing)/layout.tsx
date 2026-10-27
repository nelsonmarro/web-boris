export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-bg-wrapper min-h-full flex flex-col relative">
      {/* Fondo: la imagen ya lleva horneados saturate 0.8, contrast 1.1 y blur 1 px (Medusa_Buhonda_fondo.webp).
          Sin filtros CSS ni backdrop-filter a pantalla completa: en Firefox, cada capa fija con filtro o desenfoque
          de fondo se recalcula en cada frame en cuanto algo se anima, y la landing bajaba a 19 fps. */}
      <div className="fixed inset-0 z-[-2] bg-[url('/assets/Universo_Colosos/Otros/Medusa_Buhonda_fondo.webp')] bg-cover bg-center opacity-50 scale-105" />
      
      {/* Liquid Overlay & Caustics */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-gradient-to-b from-[rgba(0,50,90,0.3)] to-[rgba(0,30,60,0.8)]" style={{
        background: `linear-gradient(to bottom, rgba(0, 50, 90, 0.3), rgba(0, 30, 60, 0.8)), radial-gradient(circle at 50% 50%, rgba(0, 150, 220, 0.25) 0%, transparent 70%)`
      }} />

      {/* Submarine Atmospheric Layers */}
      <div className="caustics-layer" />
      <div className="abyssal-vignette" />
      
      {children}
    </div>
  );
}