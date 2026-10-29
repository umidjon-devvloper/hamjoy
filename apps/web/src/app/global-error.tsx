'use client';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="uz">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F2', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <div style={{ maxWidth: 400, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#EAF4EE', color: '#1F6B3F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>
            !
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0B0B0C', marginBottom: 8 }}>Xatolik yuz berdi</h1>
          <p style={{ fontSize: 15, color: '#4B5160', lineHeight: 1.5, marginBottom: 24 }}>
            {error.message || 'Kutilmagan xatolik yuz berdi.'}
          </p>
          <button
            onClick={unstable_retry}
            style={{ height: 48, padding: '0 24px', borderRadius: 12, border: 'none', background: '#1F6B3F', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
