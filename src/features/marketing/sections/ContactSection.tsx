import { Sparkles } from 'lucide-react';
import { ContactForm } from '../components/contact/ContactForm';

/** Sin uso desde el rediseño (#55): el formulario vive en `AboutContactSection`. La tarea de limpieza lo retira. */
export function ContactSection() {
  return (
    <section id="contacto" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 eyebrow text-primary mb-4">
              <Sparkles className="w-3 h-3" />
              Línea de Enlace Directa
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white italic tracking-tight">
              ¿Tienes un <span className="text-primary">Avistamiento?</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium">
              Envía tus teorías, ideas para nuevos videos o propuestas de colaboración directamente al Archivo Central.
            </p>
          </header>

          <div className="crystal-surface p-8 md:p-16 rounded-3xl relative group">
            <ContactForm />
            <p className="mt-10 text-center text-[11px] text-white/60 uppercase font-bold tracking-wider relative z-10">
              O si prefieres, envíame un correo directamente a <a href="mailto:borisaoblois343@gmail.com" className="text-primary underline underline-offset-2 hover:text-orange-300">borisaoblois343@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
