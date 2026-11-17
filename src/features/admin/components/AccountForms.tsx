'use client';

import { startTransition, useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { changePasswordAction, regenerateRecoveryCodesAction, type AccountState } from '../actions/account';
import { AdminField } from './AdminField';
import { RecoveryCodes } from './RecoveryCodes';

const INITIAL: AccountState = {};
const CODE_FIELD = { inputMode: 'numeric' as const, autoComplete: 'one-time-code', required: true, pattern: '[0-9 ]{6,7}', maxLength: 7 };

/** Envío a mano (no `action=`): React no vacía el formulario si algo falla, y el aviso se oculta al volver a escribir. */
function useForm(action: (data: FormData) => void) {
  const [errorHidden, setErrorHidden] = useState(false);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorHidden(false);
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
  return { errorHidden, formProps: { onSubmit, onInput: () => setErrorHidden(true) } };
}

function Alert({ message }: { message?: string }) {
  return (
    <p role="alert" aria-live="assertive" className="min-h-5 text-sm font-semibold text-red-300">
      {message}
    </p>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, INITIAL);
  const { errorHidden, formProps } = useForm(action);
  return (
    <form {...formProps} className="space-y-4">
      <AdminField id="cuenta-actual" label="Contraseña actual" name="current" type="password" autoComplete="current-password" required maxLength={200} />
      <AdminField
        id="cuenta-nueva"
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={12}
        maxLength={200}
        hint="Al menos 12 caracteres. Una frase de varias palabras es fácil de recordar y difícil de adivinar."
      />
      <AdminField id="cuenta-repite" label="Repite la contraseña nueva" name="repeat" type="password" autoComplete="new-password" required minLength={12} maxLength={200} />
      <AdminField id="cuenta-codigo-contrasena" label="Código de 6 dígitos de la app" name="code" {...CODE_FIELD} />
      <Alert message={errorHidden ? undefined : state.error} />
      <Button type="submit" disabled={pending}>
        {pending ? 'Cambiando…' : 'Cambiar la contraseña'}
      </Button>
      <p className="text-sm text-white/70">Al cambiarla se cierra la sesión en todos los dispositivos y vuelves a entrar con la nueva.</p>
    </form>
  );
}

export function RecoveryCodesForm({ remaining }: { remaining: number }) {
  const [state, action, pending] = useActionState(regenerateRecoveryCodesAction, INITIAL);
  const { errorHidden, formProps } = useForm(action);
  if (state.recoveryCodes) {
    return (
      <div className="space-y-4">
        <p className="text-white">
          Estos son tus <strong>códigos nuevos</strong>. Los anteriores ya no sirven. Guárdalos fuera del móvil:{' '}
          <strong>no se volverán a mostrar</strong>.
        </p>
        <RecoveryCodes codes={state.recoveryCodes} />
      </div>
    );
  }
  return (
    <form {...formProps} className="space-y-4">
      <p className={remaining <= 3 ? 'font-semibold text-amber-200' : 'text-white/80'}>
        {remaining === 0
          ? 'No te queda ningún código de recuperación.'
          : `Te ${remaining === 1 ? 'queda 1 código' : `quedan ${remaining} códigos`} de recuperación sin usar.`}{' '}
        Cada uno te deja entrar una vez si pierdes el móvil.
      </p>
      <AdminField id="cuenta-codigo-recuperacion" label="Código de 6 dígitos de la app" name="code" {...CODE_FIELD} hint="Crear códigos nuevos invalida los anteriores." />
      <Alert message={errorHidden ? undefined : state.error} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? 'Creando…' : 'Crear 10 códigos nuevos'}
      </Button>
    </form>
  );
}
