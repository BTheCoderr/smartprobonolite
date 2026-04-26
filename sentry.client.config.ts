import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend(event) {
      return scrubPii(event);
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'console' && breadcrumb.message) {
        breadcrumb.message = breadcrumb.message.slice(0, 200);
      }
      return breadcrumb;
    },
  });
}

function scrubPii(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  const sensitiveKeys = ['messages', 'uploadedText', 'content', 'extractedText', 'instructions', 'handoffContext'];

  if (event.extra) {
    for (const key of sensitiveKeys) {
      if (key in event.extra) {
        event.extra[key] = '[REDACTED]';
      }
    }
  }

  if (event.request?.data) {
    try {
      const data = typeof event.request.data === 'string' ? JSON.parse(event.request.data) : event.request.data;
      for (const key of sensitiveKeys) {
        if (key in data) {
          data[key] = '[REDACTED]';
        }
      }
      event.request.data = typeof event.request.data === 'string' ? JSON.stringify(data) : data;
    } catch {
      // non-JSON body, leave as-is
    }
  }

  return event;
}
