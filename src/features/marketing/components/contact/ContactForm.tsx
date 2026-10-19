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
import { ContactField, ContactTextAreaField } from './ContactFields';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const INPUT =
  'h-14 pl-12 bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:bg-black/30 transition-colors rounded-xl text-white font-bold';

/** Formulario de contacto (solo los campos y el envío; el marco lo pone quien lo usa). */
export function ContactForm() {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <ContactField label="Nombre" htmlFor="contact-name" icon={User} error={fieldState.error?.message}>
                  <Input id="contact-name" placeholder="Tu nombre" autoComplete="name" {...field} className={INPUT} />
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
                <ContactField label="Correo Electrónico" htmlFor="contact-email" icon={Mail} error={fieldState.error?.message}>
                  <Input id="contact-email" placeholder="tucorreo@ejemplo.com" autoComplete="email" {...field} className={INPUT} />
                </ContactField>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <ContactField label="Asunto" htmlFor="contact-subject" icon={Sparkles} error={fieldState.error?.message}>
                  <Input id="contact-subject" placeholder="Idea para un video, colaboración..." {...field} className={INPUT} />
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
                <ContactTextAreaField label="Mensaje" htmlFor="contact-message" icon={MessageSquare} error={fieldState.error?.message}>
                  <Textarea
                    id="contact-message"
                    placeholder="Escribe tu mensaje aquí..."
                    className="min-h-[160px] pl-12 pt-6 bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:bg-black/30 transition-colors rounded-xl text-white font-medium resize-none"
                    {...field}
                  />
                </ContactTextAreaField>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary font-bold uppercase tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 motion-reduce:transition-none"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          Enviar a Boris
        </Button>
      </form>
    </Form>
  );
}
