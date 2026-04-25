'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);
const contactEmail = process.env.CONTACT_EMAIL || 'borisaoblois343@gmail.com';

const ContactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

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
        error: 'Por favor, revisa los datos ingresados e cuinténtalo de nuevo.',
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    const { name, email, subject, message } = validatedData.data;

    const { error } = await resend.emails.send({
      from: 'Universos de BorisaoBlois <onboarding@resend.dev>', // In prod, change to your verified domain (e.g. no-reply@borisaoblois.com)
      to: [contactEmail],
      replyTo: email,
      subject: `[Web Contacto] ${subject}`,
      html: `
        <h2>Nuevo mensaje desde la Landing Page</h2>
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <hr />
        <p><strong>Mensaje:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
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
