import Link from "next/link";
import Image from "next/image";
import { Mail, Youtube } from "lucide-react";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "@/features/marketing/config/social";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "La Wiki", href: "/wiki" },
  { label: "Universos", href: "/#universos" },
  { label: "Versus Arena", href: "/wiki/arena" },
] as const;

const UNIVERSE_LINKS = [
  { label: "Colosos", href: "/wiki?universe=Colosos#explorar" },
  { label: "Capitán de Galeón", href: "/wiki?universe=Capitán de Galeón#explorar" },
  { label: "Ellos Llegaron", href: "/wiki?universe=Ellos Llegaron#explorar" },
] as const;

export default function Footer() {
  return (
    <footer className="relative mt-20 pt-20 pb-10 overflow-hidden">
      {/* Liquid Glass Footer Container */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-liquid rounded-[3rem] p-10 md:p-16 border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] relative group">
          {/* Glass Layers */}
          <div className="glass-shine opacity-10" />
          <div className="glass-reflection" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {/* Branding */}
            <div className="space-y-6 lg:col-span-1">
              <div className="flex items-center gap-3">
                 <div className="relative w-11 h-11 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-1 glass-liquid">
                    <Image src="/assets/Branding/logo.webp" alt="Logo" width={44} height={44} className="rounded-lg object-cover" />
                 </div>
                 <span className="text-2xl font-bold tracking-tight text-white uppercase italic">Borisao<span className="text-primary">Blois</span></span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed font-medium">
                Explora la inmensidad de mis universos narrativos. De los colosos abisales a las cronologías de guerra.
              </p>
              <div className="flex gap-4">
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Canal de YouTube de BorisaoBlois"
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                >
                  <Youtube className="w-5 h-5 text-white" />
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  aria-label="Escribir a BorisaoBlois"
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-[10px] mb-6">Navegación</h4>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="h-11 flex items-center text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Universes */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-[10px] mb-6">Universos</h4>
              <ul className="space-y-2">
                {UNIVERSE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="h-11 flex items-center text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-6">Contacto Oficial</h4>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 text-white/80 hover:text-primary transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-bold tracking-tight">{CONTACT_EMAIL}</span>
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/80 hover:text-primary transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
                  <Youtube className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-bold tracking-tight">@BorisaoBlois</span>
              </a>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
             <p className="text-xs text-white/30 font-bold uppercase tracking-wider">
               © {new Date().getFullYear()} BorisaoBlois. Todos los derechos reservados.
             </p>
             <p className="text-[10px] text-white/20 uppercase font-bold tracking-wider">
               Universos narrativos originales de BorisaoBlois
             </p>
          </div>
        </div>
      </div>

      {/* Footer background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/10 blur-[120px] -z-10 rounded-full" />
    </footer>
  );
}
