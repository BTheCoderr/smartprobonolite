'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/posthogClient';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}


