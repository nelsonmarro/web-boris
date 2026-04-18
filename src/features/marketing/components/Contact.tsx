'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, MessageSquare, Send, User } from 'lucide-react';

import { sendContactEmail } from '@/core/actions/contact.action';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

export default function Contact() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('subject', values.subject);
      formData.append('message', values.message);

      const result = await sendContactEmail(formData);

      if (result?.error) {
        toast.error(result.error);
        if (result.details) {
          // You could optionally set specific field errors here
          console.error(result.details);
        }
      } else {
        toast.success('¡Mensaje enviado con éxito! Boris se pondrá en contacto pronto.');
        form.reset();
      }
    });
  }

  return (
    <section id="contacto" className="py-24 bg-card relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
              Contacto
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-xl text-muted-foreground">
              ¿Tienes una petición de video, sugerencia o quieres colaborar? <br />
              Envíale un mensaje directo a Boris.
            </p>
          </div>

          <div className="bg-background border border-border rounded-2xl shadow-2xl p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Nombre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Tu nombre"
                              className="pl-10 h-12 bg-card"
                              {...field}
                              disabled={isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Correo Electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="tucorreo@ejemplo.com"
                              className="pl-10 h-12 bg-card"
                              {...field}
                              disabled={isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Asunto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Idea para un video, colaboración..."
                          className="h-12 bg-card"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Mensaje</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            className="pl-10 min-h-[150px] resize-y bg-card"
                            {...field}
                            disabled={isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-bold group"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando mensaje...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      Enviar a Boris
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 text-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                O si prefieres, envíame un correo directamente a{' '}
                <a href="mailto:borisaoblois343@gmail.com" className="text-primary hover:underline font-semibold">
                  borisaoblois343@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
