'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global unhandled error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f9fafb' }}>
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', color: '#d1d5db' }}>&#9888;</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '1rem 0 0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              A critical error occurred. Please try again or return to the home page.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{ padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #2563eb', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
