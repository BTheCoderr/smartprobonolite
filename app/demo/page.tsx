import { redirect } from 'next/navigation';

/**
 * Demo route sends visitors to the public tools workspace (legacy Ermi + upload + output).
 * Rhode Island eviction flows live under /ri/*.
 */
export default function DemoPage() {
  redirect('/tools');
}
