-- La contraseña temporal de `admin:create` caduca: hasta entonces vale para configurar la cuenta; después hay que
-- pedir otra (`--reset`). Las cuentas ya configuradas quedan con NULL (sin caducidad).
ALTER TABLE "User" ADD COLUMN "temporaryPasswordUntil" TIMESTAMP(3);
