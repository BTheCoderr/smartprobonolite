import { PostHog } from 'posthog-node';

const secretKey = process.env.POSTHOG_SECRET_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

let client: PostHog | null = null;

function getClient() {
  if (!secretKey || !host) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog server keys are not configured.');
    }
    return null;
  }

  if (!client) {
    client = new PostHog(secretKey, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return client;
}

export function captureServer(event: string, distinctId: string, properties?: Record<string, any>) {
  const ph = getClient();
  if (!ph) return;

  ph.capture({
    event,
    distinctId,
    properties,
  });
}

export async function shutdownPostHog() {
  if (client) {
    const anyClient = client as unknown as { shutdownAsync?: () => Promise<void>; shutdown?: () => Promise<void> | void };
    if (anyClient.shutdownAsync) {
      await anyClient.shutdownAsync();
    } else if (anyClient.shutdown) {
      await Promise.resolve(anyClient.shutdown());
    }
    client = null;
  }
}


