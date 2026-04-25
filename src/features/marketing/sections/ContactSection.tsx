'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, User, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { ContactField, ContactTextAreaField } from '../components/contact/ContactFields';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(data: ContactFormValues) {
    console.log(data);
    toast.success('Mensaje enviado correctamente. ¡Pronto recibirás noticias de Boris!');
    form.reset();
  }

  return (
    <section id="contacto" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          
          <header className="text-center mb-16 space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
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

          <div className="glass-liquid p-8 md:p-16 rounded-[3rem] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
            <div className="glass-reflection" />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <ContactField label="Nombre" icon={User} error={fieldState.error?.message}>
                            <Input 
                              placeholder="Tu nombre" 
                              {...field} 
                              className="h-14 pl-12 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl text-white font-bold"
                            />
                          </ContactField>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <ContactField label="Correo Electrónico" icon={Mail} error={fieldState.error?.message}>
                            <Input 
                              placeholder="tucorreo@ejemplo.com" 
                              {...field} 
                              className="h-14 pl-12 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl text-white font-bold"
                            />
                          </ContactField>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ContactField label="Asunto" icon={Sparkles} error={fieldState.error?.message}>
                          <Input 
                            placeholder="Idea para un video, colaboración..." 
                            {...field} 
                            className="h-14 pl-12 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl text-white font-bold"
                          />
                        </ContactField>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ContactTextAreaField label="Mensaje" icon={MessageSquare} error={fieldState.error?.message}>
                          <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            className="min-h-[180px] pl-12 pt-6 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-[2rem] text-white font-medium resize-none"
                            {...field}
                          />
                        </ContactTextAreaField>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-orange-600 text-white font-bold uppercase tracking-wider shadow-[0_10px_30px_rgba(255,115,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Send className="w-5 h-5" />
                  Enviar a Boris
                </Button>
              </form>
            </Form>

            <p className="mt-10 text-center text-[10px] text-white/30 uppercase font-bold tracking-wider relative z-10">
              O si prefieres, envíame un correo directamente a <a href="mailto:borisaoblois343@gmail.com" className="text-primary hover:underline">borisaoblois343@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
