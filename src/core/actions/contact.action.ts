'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const contactEmail = process.env.CONTACT_EMAIL || 'borisaoblois343@gmail.com';

// En producción, definir CONTACT_FROM_EMAIL con un dominio verificado en Resend
// (p. ej. "Universos de BorisaoBlois <no-reply@tudominio.com>").
const fromEmail =
  process.env.CONTACT_FROM_EMAIL ||
  'Universos de BorisaoBlois <onboarding@resend.dev>';

const ContactSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  email: z
    .string()
    .trim()
    .email('Por favor, ingresa un correo electrónico válido.')
    .max(254, 'El correo no puede superar los 254 caracteres.'),
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres.')
    .max(150, 'El asunto no puede superar los 150 caracteres.'),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres.')
    .max(5000, 'El mensaje no puede superar los 5000 caracteres.'),
});

// Una clave ausente o de relleno (p. ej. en local) no debe lanzar al importar el módulo:
// el cliente de Resend se crea al enviar y, sin clave válida, se responde con un error amable.
function hasUsableResendKey(key: string | undefined): key is string {
  if (!key) return false;
  return /^re_\S+$/.test(key) && !/x{4,}|placeholder|changeme|your|tu_/i.test(key);
}

// Escapa los valores del usuario antes de interpolarlos en el HTML del correo.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactEmail(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    const validatedData = ContactSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        error: 'Por favor, revisa los datos ingresados e inténtalo de nuevo.',
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    const { name, email, subject, message } = validatedData.data;

    const apiKey = process.env.RESEND_API_KEY;
    if (!hasUsableResendKey(apiKey)) {
      console.error('Contacto: RESEND_API_KEY no está configurada o es de relleno.');
      return {
        error:
          'El envío de mensajes no está disponible ahora mismo. Inténtalo más tarde o escribe a Boris por sus redes.',
      };
    }
    const resend = new Resend(apiKey);

    // Evita inyección de cabeceras: sin saltos de línea en el asunto del correo.
    const safeSubject = subject.replace(/[\r\n]+/g, ' ').trim();

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [contactEmail],
      replyTo: email,
      subject: `[Web Contacto] ${safeSubject}`,
      html: `
        <h2>Nuevo mensaje desde la Landing Page</h2>
        <p><strong>De:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Asunto:</strong> ${escapeHtml(safeSubject)}</p>
        <hr />
        <p><strong>Mensaje:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return {
        error:
          'Ocurrió un error al enviar el correo. Por favor, intenta de nuevo más tarde.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Server Action Error:', error);
    return {
      error: 'Error interno del servidor. Por favor, intenta más tarde.',
    };
  }
}
