import Link from "next/link";
import Image from "next/image";
import { Mail, Globe, Share2, MessageCircle } from "lucide-react";

export function WikiFooter() {
  return (
    <footer className="w-full bg-[#061a2e] border-t border-white/5 pt-20 pb-10 relative overflow-hidden z-20">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {/* Branding */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center gap-3">
               <div className="relative w-11 h-11 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-1 shadow-[0_0_20px_rgba(255,115,0,0.1)]">
                  <Image src="/assets/logo.png" alt="Logo" width={44} height={44} className="rounded-lg object-cover" />
               </div>
               <span className="text-2xl font-bold tracking-tight text-white uppercase italic">Borisao<span className="text-primary">Blois</span></span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed font-medium">
              Explora la inmensidad de mis universos narrativos. De los colosos abisales a las cronologías de guerra.
            </p>
            <div className="flex gap-4">
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all hover:scale-105 border border-white/10 group">
                  <Icon className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] italic mb-8 border-l-2 border-primary pl-4">Navegación</h4>
            <ul className="space-y-1">
              {["Inicio", "La Wiki", "Universos", "Versus Arena"].map((link) => (
                <li key={link}>
                  <Link href="#" className="h-10 flex items-center text-white/40 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider hover:translate-x-1">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Universes */}
          <div>
            <h4 className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] italic mb-8 border-l-2 border-primary pl-4">Universos</h4>
            <ul className="space-y-1">
              {["Colosos", "Capitán de Galeón", "Ellos Llegaron"].map((link) => (
                <li key={link}>
                  <Link href="#" className="h-10 flex items-center text-white/40 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider hover:translate-x-1">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h4 className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] italic mb-8 border-l-2 border-primary pl-4">Contacto Oficial</h4>
            <a href="mailto:borisaoblois343@gmail.com" className="flex items-center gap-4 text-white/60 hover:text-white transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Email</span>
                <span className="text-sm font-bold tracking-tight">borisaoblois343@gmail.com</span>
              </div>
            </a>
            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
               <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mb-1">Soporte Técnico</p>
               <p className="text-xs text-white/50 font-bold">nelsonmarro@dev.com</p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,115,0,0.8)]" />
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                © 2026 BorisaoBlois. Todos los derechos reservados.
              </p>
           </div>
           <div className="flex gap-10">
             <a href="#" className="text-[10px] text-white/20 hover:text-primary transition-colors uppercase font-bold tracking-[0.2em] italic">Privacidad</a>
             <a href="#" className="text-[10px] text-white/20 hover:text-primary transition-colors uppercase font-bold tracking-[0.2em] italic">Términos</a>
           </div>
        </div>
      </div>

      {/* Background Decorative element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
    </footer>
  );
}
