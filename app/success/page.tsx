'use client';

import { Suspense } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { CheckoutSuccessView } from '@/components/billing/CheckoutSuccessView';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-spb-bg">
      <PublicHeader />
      <Suspense
        fallback={
          <div className="min-h-screen bg-spb-bg flex items-center justify-center text-gray-500">Loading…</div>
        }
      >
        <CheckoutSuccessView />
      </Suspense>
    </div>
  );
}
