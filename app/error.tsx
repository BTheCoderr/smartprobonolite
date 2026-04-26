'use client';

import { useEffect } from 'react';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl text-gray-300">&#9888;</div>
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="text-gray-600">
          An unexpected error occurred. Your data is safe — please try again or return home.
        </p>
        <StatusMessage
          variant="error"
          message={error.message || 'An unknown error occurred.'}
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-spb-blue text-white hover:bg-spb-blueDark transition shadow-sm"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl border border-spb-blue text-spb-blue hover:bg-blue-50 transition"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
