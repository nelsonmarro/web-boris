'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, User, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { sendContactEmail } from '@/core/actions/contact.action';
import { ContactField, ContactTextAreaField } from './ContactFields';

// Máximos y mensajes iguales a los de `ContactSchema` en `contact.action.ts`
// (un archivo 'use server' solo puede exportar acciones, así que no se comparte).
const MAX = { name: 100, email: 254, subject: 150, message: 5000 } as const;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(MAX.name, `El nombre no puede superar los ${MAX.name} caracteres.`),
  email: z
    .string()
    .trim()
    .email('Por favor, ingresa un correo electrónico válido.')
    .max(MAX.email, `El correo no puede superar los ${MAX.email} caracteres.`),
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres.')
    .max(MAX.subject, `El asunto no puede superar los ${MAX.subject} caracteres.`),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres.')
    .max(MAX.message, `El mensaje no puede superar los ${MAX.message} caracteres.`),
  // Honeypot: oculto para personas; un robot lo rellena.
  website: z.string().optional(),
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
      website: '',
    },
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(data: ContactFormValues) {
    // Guarda contra el doble clic: mientras envía, `handleSubmit` ya no vuelve a entrar,
    // pero el botón desactivado es la señal visible.
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) formData.append(key, value ?? '');

    try {
      const result = await sendContactEmail(formData);
      if (result.success) {
        toast.success('Mensaje enviado correctamente. ¡Pronto recibirás noticias de Boris!');
        form.reset();
        return;
      }
      // Errores por campo que devuelve el servidor, ligados a su control.
      const details = 'details' in result ? result.details : undefined;
      if (details) {
        for (const [field, messages] of Object.entries(details)) {
          if (field in data && messages?.[0]) {
            form.setError(field as keyof ContactFormValues, { type: 'server', message: messages[0] });
          }
        }
      }
      toast.error(result.error ?? 'No se pudo enviar el mensaje. Inténtalo de nuevo.');
    } catch {
      toast.error('No se pudo enviar el mensaje. Revisa tu conexión e inténtalo de nuevo.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate aria-busy={isSubmitting}>
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <ContactField
                label="Nombre"
                htmlFor="contact-name"
                icon={User}
                error={fieldState.error?.message}
                errorId="contact-name-error"
              >
                <Input
                  id="contact-name"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  maxLength={MAX.name}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'contact-name-error' : undefined}
                  {...field}
                  className={INPUT}
                />
              </ContactField>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <ContactField
                label="Correo Electrónico"
                htmlFor="contact-email"
                icon={Mail}
                error={fieldState.error?.message}
                errorId="contact-email-error"
              >
                <Input
                  id="contact-email"
                  type="email"
                  inputMode="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  maxLength={MAX.email}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'contact-email-error' : undefined}
                  {...field}
                  className={INPUT}
                />
              </ContactField>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field, fieldState }) => (
            <FormItem>
              <ContactField
                label="Asunto"
                htmlFor="contact-subject"
                icon={Sparkles}
                error={fieldState.error?.message}
                errorId="contact-subject-error"
              >
                <Input
                  id="contact-subject"
                  placeholder="Idea para un video, colaboración..."
                  maxLength={MAX.subject}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'contact-subject-error' : undefined}
                  {...field}
                  className={INPUT}
                />
              </ContactField>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field, fieldState }) => (
            <FormItem>
              <ContactTextAreaField
                label="Mensaje"
                htmlFor="contact-message"
                icon={MessageSquare}
                error={fieldState.error?.message}
                errorId="contact-message-error"
              >
                <Textarea
                  id="contact-message"
                  placeholder="Escribe tu mensaje aquí..."
                  maxLength={MAX.message}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'contact-message-error' : undefined}
                  className="min-h-[160px] pl-12 pt-6 bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:bg-black/30 transition-colors rounded-xl text-white font-medium resize-none"
                  {...field}
                />
              </ContactTextAreaField>
            </FormItem>
          )}
        />

        {/* Honeypot: fuera de pantalla, sin foco ni autocompletado y oculto a lectores de pantalla. */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="contact-website">No rellenar</label>
          <input
            id="contact-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register('website')}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary font-bold uppercase tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 disabled:opacity-60 motion-reduce:transition-none"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          {isSubmitting ? 'Enviando…' : 'Enviar a Boris'}
        </Button>
      </form>
    </Form>
  );
}
