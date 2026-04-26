'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { captureEvent } from '@/lib/posthogClient';

export function WebVitals() {
  useReportWebVitals((metric) => {
    captureEvent('web_vital', {
      name: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      navigationType: metric.navigationType,
    });
  });

  return null;
}
