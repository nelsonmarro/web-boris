'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { loginAction, type LoginState } from '../actions/session';
import { AdminField } from './AdminField';

const INITIAL: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, INITIAL);
  return (
    <form action={action} className="space-y-5">
      <AdminField label="Correo" name="email" type="email" autoComplete="username" required maxLength={254} defaultValue={state.email} />
      <AdminField label="Contraseña" name="password" type="password" autoComplete="current-password" required maxLength={200} />
      <AdminField
        label="Código de verificación"
        name="code"
        inputMode="text"
        autoComplete="one-time-code"
        maxLength={32}
        hint="Los 6 dígitos de tu app de códigos, o un código de recuperación. Si es la primera vez que entras, déjalo vacío."
      />
      <p role="alert" aria-live="assertive" className="min-h-5 text-sm font-semibold text-red-300">
        {state.error}
      </p>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Comprobando…' : 'Entrar'}
      </Button>
    </form>
  );
}
