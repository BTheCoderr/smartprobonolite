import { posthog } from './posthogClient';

export type SmartProBonoEvent =
  | { name: 'signup_started'; props?: { source?: 'landing' | 'invite' | string } }
  | { name: 'signup_completed'; props?: { plan?: 'Free' | 'Pro' } }
  | { name: 'intake_started'; props: { case_type: string } }
  | { name: 'intake_completed'; props: { case_type: string; duration_ms: number } }
  | { name: 'doc_generated'; props: { template: string; case_type: string } }
  | { name: 'doc_downloaded'; props: { template: string; format: 'pdf' | 'docx' } }
  | { name: 'billing_subscribed'; props: { plan: string; seats: number } }
  | { name: 'invite_sent'; props?: { role?: 'paralegal' | 'attorney' | string } };

export function captureEvent<E extends SmartProBonoEvent>(event: E) {
  try {
    posthog.capture(event.name, event.props);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('PostHog capture failed:', error);
    }
  }
}


