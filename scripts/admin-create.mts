/**
 * Alta (o restablecimiento) de una cuenta del panel /admin. No hay registro por la web: solo este script.
 *
 *   npm run admin:create -- correo@ejemplo.com "Nombre"       # crea la cuenta
 *   npm run admin:create -- correo@ejemplo.com --reset        # contraseña temporal nueva y 2FA desactivado
 *
 * Imprime una contraseña temporal UNA vez. En el primer acceso el panel obliga a cambiarla y a activar el 2FA.
 * En el VPS: deploy/admin-create.sh (usa la conexión de administración).
 */
import 'dotenv/config';
import { randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import { hashPassword } from '../src/features/admin/lib/password.ts';

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const [emailArg, nameArg] = args.filter((arg) => !arg.startsWith('--'));
const email = emailArg?.trim().toLowerCase() ?? '';

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
  console.error('Uso: npm run admin:create -- correo@ejemplo.com ["Nombre"] [--reset]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL.');
  process.exit(1);
}

// 18 bytes de azar ≈ 144 bits: de sobra aunque solo dure hasta el primer acceso.
const temporary = randomBytes(18).toString('base64url');
const passwordHash = await hashPassword(temporary);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const existing = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
  if (existing.rowCount && !reset) {
    console.error(`Ya existe una cuenta con ${email}. Para darle una contraseña temporal nueva y quitar su 2FA, añade --reset.`);
    process.exitCode = 1;
  } else if (existing.rowCount) {
    const id = existing.rows[0].id as string;
    await client.query('BEGIN');
    await client.query(
      `UPDATE "User" SET role = 'admin', "passwordHash" = $2, "totpSecret" = NULL, "totpEnabledAt" = NULL, "totpLastStep" = 0,
         "sessionVersion" = "sessionVersion" + 1 WHERE id = $1`,
      [id, passwordHash],
    );
    await client.query('DELETE FROM "AdminRecoveryCode" WHERE "userId" = $1', [id]);
    await client.query('COMMIT');
    console.log(`Cuenta ${email} restablecida: sesiones cerradas y 2FA desactivado.`);
  } else {
    await client.query('INSERT INTO "User" (id, email, name, role, "passwordHash") VALUES ($1, $2, $3, \'admin\', $4)', [
      randomUUID(),
      email,
      nameArg?.trim() || null,
      passwordHash,
    ]);
    console.log(`Cuenta ${email} creada.`);
  }
  if (process.exitCode !== 1) {
    console.log(`\nContraseña temporal (no se volverá a mostrar):\n\n  ${temporary}\n`);
    console.log('Pásasela a su dueño por un canal privado. Al entrar en /admin/login tendrá que cambiarla y activar el 2FA.');
  }
} finally {
  await client.end();
}
