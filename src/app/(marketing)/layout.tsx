import BubbleTrail from '@/components/ui/bubble-trail';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-bg-wrapper min-h-full flex flex-col relative">
      {/* Background Image and Overlays */}
      <div className="fixed inset-0 z-[-2] bg-[url('/assets/Universo%20Colosos/Stock%20aleatorio/TomaFinal_8_Composted0010.png')] bg-cover bg-center opacity-50 scale-105 saturate-[0.8] contrast-[1.1] brightness-100 blur-[1px]" />
      
      {/* Liquid Overlay & Caustics */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-gradient-to-b from-[rgba(0,50,90,0.3)] to-[rgba(0,30,60,0.8)] backdrop-blur-[8px]" style={{
        background: `linear-gradient(to bottom, rgba(0, 50, 90, 0.3), rgba(0, 30, 60, 0.8)), radial-gradient(circle at 50% 50%, rgba(0, 150, 220, 0.25) 0%, transparent 70%)`
      }} />

      {/* Submarine Atmospheric Layers */}
      <div className="caustics-layer" />
      <div className="abyssal-vignette" />
      <BubbleTrail />
      
      {children}
    </div>
  );
}