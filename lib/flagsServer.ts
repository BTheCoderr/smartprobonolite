import { PostHog } from 'posthog-node';

let serverPosthog: PostHog | null = null;

function getServerPosthog() {
  if (serverPosthog) return serverPosthog;

  const key = process.env.POSTHOG_SECRET_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog secret key or host missing; feature flag checks disabled.');
    }
    return null;
  }

  serverPosthog = new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });

  return serverPosthog;
}

export async function isFlagOnServer(
  key: string,
  distinctId: string,
  properties?: Record<string, any>
) {
  const client = getServerPosthog();
  if (!client) return false;

  try {
    return await client.isFeatureEnabled(key, distinctId, properties ?? {});
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`PostHog server flag check failed: ${key}`, error);
    }
    return false;
  }
}


