import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { YoutubeIcon } from "@/features/marketing/components/icons/YoutubeIcon";
import { SOCIAL_LINKS, CONTACT_EMAIL, YOUTUBE_HANDLE, YOUTUBE_SUBSCRIBE_URL } from "@/features/marketing/config/social";
import { UNIVERSES } from "@/features/marketing/config/universes";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Empieza aquí", href: "/empieza-aqui" },
  { label: "La Wiki", href: "/wiki" },
  { label: "Universos", href: "/#universos" },
  { label: "Comunidad", href: "/comunidad" },
  { label: "Versus Arena", href: "/wiki/arena" },
] as const;


export default function Footer() {
  return (
    <footer className="@container relative mt-20 pt-20 pb-10 overflow-hidden">
      {/* Liquid Glass Footer Container */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-liquid rounded-3xl p-8 @xl:p-16 border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] relative group">
          {/* Glass Layers */}
          <div className="glass-shine opacity-10" />
          <div className="glass-reflection" />
          
          <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-4 gap-12 relative z-10">
            {/* Branding */}
            <div className="space-y-6 @5xl:col-span-1">
              <div className="flex min-w-0 items-center gap-3">
                 <div className="relative w-11 h-11 shrink-0 aspect-square overflow-hidden rounded-xl border border-white/20 bg-white/5 p-1 glass-liquid">
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
                  className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-11 h-11 shrink-0 aspect-square rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                >
                  <YoutubeIcon className="w-5 h-5 text-white" />
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  aria-label="Escribir a BorisaoBlois"
                  className="w-11 h-11 shrink-0 aspect-square rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="eyebrow mb-6 text-white/70">Navegación</p>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="h-11 flex items-center text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Universes */}
            <div>
              <p className="eyebrow mb-6 text-white/70">Universos</p>
              <ul className="space-y-2">
                {UNIVERSES.filter((u) => u.universeKey).map((u) => (
                  <li key={u.universeKey}>
                    <Link href={{ pathname: "/wiki", query: { universe: u.universeKey }, hash: "catalogo" }} className="h-11 flex items-center text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">{u.title}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <p className="eyebrow mb-6 text-white/70">Contacto Oficial</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex min-w-0 items-center gap-3 text-white/80 hover:text-primary transition-colors group">
                <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span className="min-w-0 break-words text-sm font-bold tracking-tight">{CONTACT_EMAIL.split("@")[0]}<wbr />@{CONTACT_EMAIL.split("@")[1]}</span>
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex min-w-0 items-center gap-3 text-white/80 hover:text-primary transition-colors group">
                <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
                  <YoutubeIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="min-w-0 text-sm font-bold tracking-tight [overflow-wrap:anywhere]">{YOUTUBE_HANDLE}</span>
                <span className="sr-only"> (se abre en YouTube)</span>
              </a>
              {/* Junto al canal (UX fase 1 §A.7): abre directamente el diálogo de suscripción de YouTube. */}
              <a
                href={YOUTUBE_SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-primary/40 px-5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-[#00122E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
              >
                Suscríbete
                <span className="sr-only"> (se abre en YouTube)</span>
              </a>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col @xl:flex-row justify-between items-center gap-6 relative z-10">
             <p className="text-xs text-white/60 font-bold uppercase tracking-wider">
               © {new Date().getFullYear()} BorisaoBlois. Todos los derechos reservados.
             </p>
             <p className="text-[11px] text-white/60 uppercase font-bold tracking-wider">
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
