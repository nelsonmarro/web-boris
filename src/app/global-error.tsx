'use client';

/**
 * Último recurso: falla el propio layout raíz. Sustituye al documento entero, así que lleva su `<html>` y estilos en línea
 * (no se pueden dar por cargados ni Tailwind ni las fuentes).
 */
export default function GlobalError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const button = {
    minHeight: 44,
    padding: '0 24px',
    borderRadius: 9999,
    border: '1px solid rgba(255,255,255,0.2)',
    background: '#FF7300',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } as const;

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#00122E',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div role="alert" style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>Algo falló al cargar la página</h1>
          <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.7)' }}>
            Prueba de nuevo; si sigue igual, recarga la página.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" style={button} onClick={() => unstable_retry()}>
              Reintentar
            </button>
            <button type="button" style={button} onClick={() => window.location.reload()}>
              Recargar
            </button>
            {/* Enlace plano: el router de Next puede ser justo lo que falló. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ ...button, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', background: 'transparent' }}>
              Volver al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
