'use client';

import { useState } from 'react';
import { Copy, Download, Printer } from 'lucide-react';
import { SMALL_BUTTON } from './editor/field-styles';

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

/** Los códigos de recuperación recién creados, con sus botones. Se muestran una sola vez (configurar y «Mi cuenta»). */
export function RecoveryCodes({ codes }: { codes: string[] }) {
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 rounded-xl border border-white/15 bg-[#061a2e] p-4 font-mono text-base text-white">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <RecoveryCodeActions codes={codes} />
    </>
  );
}
