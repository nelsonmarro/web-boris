import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { LocalTime } from '@/features/admin/components/LocalTime';
import { requireAdmin } from '@/features/admin/server/require-admin';

export const metadata: Metadata = { title: 'Inicio' };

/** Lo que se edita desde el panel. */
const SECTIONS: readonly { title: string; text: string; href: Route }[] = [
  { title: 'Fichas de la wiki', text: 'Crear y editar expedientes: texto, ficha lateral, imágenes y datos de la Arena.', href: '/admin/fichas' },
  { title: 'Imágenes', text: 'Subir arte y elegir portadas.', href: '/admin/imagenes' },
  { title: 'Novedades y votaciones', text: 'Lo que aparece en la página de Comunidad.', href: '/admin/contenido/novedades' as Route },
  { title: 'Vídeos y orden de la historia', text: 'Relacionar vídeos con fichas, el orden de la historia y «Empieza por aquí».', href: '/admin/contenido' },
  { title: 'Menú lateral', text: 'Ordenar el menú de la wiki y añadir las fichas nuevas.', href: '/admin/contenido/menu' as Route },
];

const ACTIVITY: Record<string, string> = {
  'login.ok': 'Entrada al panel',
  'login.fail': 'Intento de entrada fallido',
  'login.throttled': 'Intentos frenados por exceso de fallos',
  logout: 'Sesión cerrada',
  'setup.ok': 'Cuenta configurada (contraseña y 2FA)',
  'setup.fail': 'Código incorrecto al configurar la cuenta',
  'article.create': 'Ficha creada',
  'article.save': 'Borrador guardado',
  'article.publish': 'Ficha publicada',
  'article.discard': 'Borrador descartado',
  'article.delete': 'Ficha retirada de la web',
  'article.undelete': 'Ficha mostrada de nuevo',
  'article.restore-version': 'Versión recuperada en el borrador',
  'media.upload': 'Imagen subida',
  'media.delete': 'Imagen borrada',
  'list.publish': 'Lista publicada',
};

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const activity = await prisma.adminAuditLog.findMany({
    where: { userId: admin.id },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { id: true, action: true, target: true, createdAt: true },
  });

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white">Hola{admin.name ? `, ${admin.name}` : ''}</h1>
        <p className="mt-2 text-white/80">Tu cuenta está protegida con contraseña y verificación en dos pasos.</p>
      </div>

      <section aria-labelledby="secciones">
        <h2 id="secciones" className="mb-4 text-xl font-bold text-white">
          Qué puedes editar
        </h2>
        <ul className="grid gap-4 @2xl:grid-cols-2">
          {SECTIONS.map((section) => (
            <li key={section.title} className="crystal-surface rounded-2xl p-5 hover:border-primary/40">
              <h3 className="font-bold text-white">
                <Link href={section.href} className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  {section.title}
                </Link>
              </h3>
              <p className="mt-1 text-white/80">{section.text}</p>
              <p className="mt-3 text-sm font-semibold text-primary">Abrir</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="actividad">
        <h2 id="actividad" className="mb-4 text-xl font-bold text-white">
          Actividad reciente de tu cuenta
        </h2>
        <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#061a2e]">
          {activity.map((entry) => (
            <li key={entry.id} className="flex flex-wrap justify-between gap-2 px-5 py-3">
              <span className="text-white">
                {ACTIVITY[entry.action] ?? entry.action}
                {entry.action.startsWith('article.') && entry.target ? <span className="text-white/70"> · {entry.target.split(' ')[0]}</span> : null}
              </span>
              <span className="text-sm text-white/70">
                <LocalTime iso={entry.createdAt.toISOString()} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
