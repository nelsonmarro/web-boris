import Image from 'next/image';
import { IMAGE_QUALITY } from '@/utils/image';
import Link from 'next/link';
import type { Route } from 'next';
import { PendingLabel, Section } from '@/components/content';
import { ContactForm } from '../components/contact/ContactForm';
import { SOCIAL_LINKS, YOUTUBE_HANDLE, CONTACT_EMAIL } from '../config/social';
import { UNIVERSES } from '../config/universes';

const listFormat = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' });

const published = UNIVERSES.filter((u) => !u.comingSoon);
const upcoming = UNIVERSES.filter((u) => u.comingSoon);

const TEXT_LINK =
  'inline-flex min-h-11 items-center rounded-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

const BUTTON =
  'inline-flex min-h-11 items-center rounded-full border border-white/15 bg-[#061a2e] px-5 text-sm font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/** "Sobre Boris" (datos del autor) y el formulario de contacto, a dos columnas desde lg (spec #55 §3.5). */
export function AboutContactSection() {
  return (
    <Section title="Sobre Boris">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Image
              quality={IMAGE_QUALITY}
              src="/assets/Branding/Logo2.webp"
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 object-contain"
            />
            <h3 className="font-display text-3xl font-black uppercase italic leading-none tracking-tight text-white md:text-4xl">
              BorisaoBlois
            </h3>
          </div>

          <p className="text-base leading-relaxed text-white/70">
            Autor de los universos narrativos {listFormat.format(published.map((u) => u.title))}.
            {upcoming.length > 0 && (
              <>
                {' '}
                {listFormat.format(upcoming.map((u) => u.title))} {upcoming.length === 1 ? 'está' : 'están'} en preparación.
              </>
            )}
          </p>

          <ul aria-label="Universos" className="flex flex-wrap gap-x-6 gap-y-1">
            {UNIVERSES.map((u) => (
              <li key={u.id} className="flex items-center gap-2">
                {u.universeKey ? (
                  <Link
                    href={`/wiki?universe=${encodeURIComponent(u.universeKey)}#catalogo` as Route}
                    className={TEXT_LINK}
                  >
                    {u.title}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center font-semibold text-white/70">{u.title}</span>
                )}
                {u.comingSoon && <PendingLabel />}
              </li>
            ))}
          </ul>

          <p className="flex items-center gap-2 text-white/70">
            Biografía: <PendingLabel />
          </p>

          <p className="flex flex-wrap items-center gap-x-2 text-white/70">
            Canal:
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className={TEXT_LINK}
            >
              {YOUTUBE_HANDLE}
              <span className="sr-only"> (se abre en YouTube)</span>
            </a>
          </p>

          <div className="flex flex-wrap gap-3">
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className={BUTTON}>
              Ver canal en YouTube
              <span className="sr-only"> (se abre en YouTube)</span>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className={BUTTON}>
              Escribir a Boris
            </a>
          </div>
        </div>

        <div id="contacto" className="scroll-mt-24">
          <h3 className="font-display text-2xl font-black uppercase italic tracking-tight text-white">
            ¿Tienes un avistamiento?
          </h3>
          <p className="mt-2 text-white/70">
            Envía tus teorías, ideas para nuevos videos o propuestas de colaboración directamente al Archivo Central.
          </p>
          <div className="crystal-surface mt-6 rounded-2xl p-6 md:p-8">
            <ContactForm />
            <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-white/60">
              O si prefieres, envíame un correo directamente a{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="rounded-sm normal-case text-primary underline underline-offset-2 hover:text-orange-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
