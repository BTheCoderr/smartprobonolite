'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Demo route redirects to the RI Eviction Assistant for the RWU/RILS demo.
 * The legacy Ermi chat (upload, extract, general legal assistant) is preserved
 * in code—pass assistantMode="legacy" to ChatBox to restore it.
 */
export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ri/assistant');
  }, [router]);

  return (
    <div className="min-h-screen bg-spb-bg flex items-center justify-center">
      <p className="text-sm text-gray-500">Redirecting to Ermi…</p>
    </div>
  );
}
