'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { completeSetupAction, type SetupState } from '../actions/setup';
import { logoutAction } from '../actions/session';
import { AdminField } from './AdminField';

const INITIAL: SetupState = {};

export function SetupForm({ secret, qrDataUrl }: { secret: string; qrDataUrl: string }) {
  const [state, action, pending] = useActionState(completeSetupAction, INITIAL);

  if (state.recoveryCodes) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Guarda tus códigos de recuperación</h2>
          <p className="text-white/80">
            Si pierdes el móvil, cada uno de estos códigos te deja entrar <strong>una vez</strong> en lugar del código de 6
            dígitos. Apúntalos o guárdalos en un lugar seguro: <strong>no se volverán a mostrar</strong>.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 rounded-xl border border-white/15 bg-[#061a2e] p-4 font-mono text-base text-white">
          {state.recoveryCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
        <form action={logoutAction}>
          <Button type="submit" className="w-full">
            Ya los guardé: entrar al panel
          </Button>
        </form>
        <p className="text-sm text-white/70">Te pediremos entrar de nuevo, ya con tu contraseña nueva y el código de la app.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Elige tu contraseña</h2>
        <AdminField
          label="Contraseña nueva"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={200}
          hint="Al menos 12 caracteres. Una frase de varias palabras es fácil de recordar y difícil de adivinar."
        />
        <AdminField label="Repite la contraseña" name="repeat" type="password" autoComplete="new-password" required minLength={12} maxLength={200} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Activa la verificación en dos pasos</h2>
        <p className="text-white/80">
          Instala en tu móvil una app de códigos (Google Authenticator, Microsoft Authenticator o Authy) y escanea este
          código QR. La app te dará un código de 6 dígitos que cambia cada 30 segundos.
        </p>
        <div className="flex flex-col items-start gap-4 @md:flex-row @md:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- QR generado en el servidor como data: URL */}
          <img src={qrDataUrl} alt="Código QR para la app de códigos" width={200} height={200} className="rounded-xl bg-white p-2" />
          <p className="text-sm text-white/70">
            ¿No puedes escanearlo? Escribe esta clave en la app:
            <span className="mt-2 flex flex-wrap gap-x-2 font-mono text-base text-white">
              {secret.match(/.{1,4}/g)?.map((group, index) => <span key={index}>{group}</span>)}
            </span>
          </p>
        </div>
        <AdminField
          label="Código de 6 dígitos"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          hint="El que muestra ahora mismo la app."
        />
      </section>

      <p role="alert" aria-live="assertive" className="min-h-5 text-sm font-semibold text-red-300">
        {state.error}
      </p>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Guardando…' : 'Guardar y activar'}
      </Button>
    </form>
  );
}
