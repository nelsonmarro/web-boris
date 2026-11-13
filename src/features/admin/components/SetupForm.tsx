'use client';

import { startTransition, useActionState, useState } from 'react';
import { Copy, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { completeSetupAction, type SetupState } from '../actions/setup';
import { logoutAction } from '../actions/session';
import { AdminField } from './AdminField';
import { SMALL_BUTTON } from './editor/field-styles';

const INITIAL: SetupState = {};

/** Copiar, descargar o imprimir los códigos de recuperación: se muestran una sola vez. */
function RecoveryCodeActions({ codes }: { codes: string[] }) {
  const [status, setStatus] = useState('');
  const text = `Códigos de recuperación del panel de la wiki de BorisaoBlois\nCada uno sirve una sola vez en lugar del código de 6 dígitos.\n\n${codes.join('\n')}\n`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copiados. Pégalos en un lugar seguro.');
    } catch {
      setStatus('No se pudieron copiar: descárgalos o apúntalos a mano.');
    }
  };
  const download = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    link.download = 'codigos-recuperacion-wiki-borisaoblois.txt';
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus('Descargados. Guarda el archivo en un lugar seguro.');
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={SMALL_BUTTON} onClick={copy}>
          <Copy aria-hidden="true" className="size-4" />
          Copiar
        </button>
        <button type="button" className={SMALL_BUTTON} onClick={download}>
          <Download aria-hidden="true" className="size-4" />
          Descargar
        </button>
        <button type="button" className={SMALL_BUTTON} onClick={() => window.print()}>
          <Printer aria-hidden="true" className="size-4" />
          Imprimir
        </button>
      </div>
      <p role="status" className="min-h-5 text-sm text-white/80">
        {status}
      </p>
    </div>
  );
}

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
        <RecoveryCodeActions codes={state.recoveryCodes} />
        <form action={logoutAction}>
          <Button type="submit" className="w-full">
            Ya los guardé: entrar al panel
          </Button>
        </form>
        <p className="text-sm text-white/70">Te pediremos entrar de nuevo, ya con tu contraseña nueva y el código de la app.</p>
      </div>
    );
  }

  // Se envía a mano (y no con `action=`) para que React no vacíe el formulario: si el código falla, las dos
  // contraseñas siguen escritas.
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };

  return (
    <form onSubmit={submit} className="space-y-8">
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
