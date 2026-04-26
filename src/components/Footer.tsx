import Link from "next/link";
import Image from "next/image";
import { Mail, Globe, Share2, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#030e1a] border-t border-white/10 pt-16 pb-10 relative overflow-hidden z-20">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {/* Branding */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center gap-3">
               <div className="relative w-11 h-11 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-1">
                  <Image src="/assets/logo.png" alt="Logo" width={44} height={44} className="rounded-lg object-cover" />
               </div>
               <span className="text-2xl font-bold tracking-tight text-white uppercase italic">Borisao<span className="text-primary">Blois</span></span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed font-medium">
              Explora la inmensidad de mis universos narrativos. De los colosos abisales a las cronologías de guerra.
            </p>
            <div className="flex gap-4">
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[10px] mb-6">Navegación</h4>
            <ul className="space-y-2">
              {["Inicio", "La Wiki", "Universos", "Versus Arena"].map((link) => (
                <li key={link}>
                  <Link href="#" className="h-11 flex items-center text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Universes */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[10px] mb-6">Universos</h4>
            <ul className="space-y-2">
              {["Colosos", "Capitán de Galeón", "Ellos Llegaron"].map((link) => (
                <li key={link}>
                  <Link href="#" className="h-11 flex items-center text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-6">Contacto Oficial</h4>
            <a href="mailto:borisaoblois343@gmail.com" className="flex items-center gap-3 text-white/80 hover:text-primary transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-bold tracking-tight">borisaoblois343@gmail.com</span>
            </a>
            <div className="pt-4">
               <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Soporte Técnico</p>
               <p className="text-xs text-white/50 font-bold">nelsonmarro@dev.com</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
           <p className="text-xs text-white/30 font-bold uppercase tracking-wider">
             © 2026 BorisaoBlois. Todos los derechos reservados.
           </p>
           <div className="flex gap-8">
             <a href="#" className="text-[10px] text-white/20 hover:text-white transition-colors uppercase font-bold tracking-wider">Privacidad</a>
             <a href="#" className="text-[10px] text-white/20 hover:text-white transition-colors uppercase font-bold tracking-wider">Términos</a>
           </div>
        </div>
      </div>
    </footer>
  );
}
