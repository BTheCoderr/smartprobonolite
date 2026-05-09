import type { Metadata } from 'next';
import { PocketBuddyLegalLayout } from '@/components/pocketbuddy/PocketBuddyLegalLayout';
import { LegalSection } from '@/components/pocketbuddy/LegalSection';
import { ACLU_KNOW_YOUR_RIGHTS_URL, pocketBuddyCanonicalUrl } from '@/lib/pocketbuddy/legalSite';

export async function generateMetadata(): Promise<Metadata> {
  const canonical = pocketBuddyCanonicalUrl('/pocketbuddy/legal');
  return {
    title: 'PocketBuddy Legal & Disclaimers | SmartProBono',
    description:
      'Legal notices and disclaimers for PocketBuddy — not legal advice, not emergency services, recording laws, SMS and location limitations, incident packets.',
    robots: { index: true, follow: true },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export default function PocketBuddyLegalPage() {
  return (
    <PocketBuddyLegalLayout
      active="legal"
      title="PocketBuddy Legal & Disclaimers"
      subtitle="Important safety, legal, privacy, and recording notices."
    >
      <div className="rounded-xl border border-[#DC2626]/35 bg-red-50 p-4 text-sm text-[#475569] space-y-2">
        <p className="font-bold text-[#DC2626] flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#DC2626]" aria-hidden />
          If you are in immediate danger
        </p>
        <p>
          Call <strong className="text-[#0F2F55]">911</strong> or your <strong className="text-[#0F2F55]">local emergency number</strong>. PocketBuddy is not emergency services and cannot dispatch help.
        </p>
      </div>

      <LegalSection id="not-legal-advice" title="1. Not legal advice">
        <p>
          PocketBuddy by SmartProBono is <strong>informational only</strong>. SmartProBono is <strong>not</strong> a law firm. Nothing in PocketBuddy or these pages is
          legal advice. Users should consult a <strong>licensed attorney</strong> for legal questions. Use of PocketBuddy does <strong>not</strong> create an attorney-client
          relationship and does <strong>not</strong> mean SmartProBono represents you.
        </p>
      </LegalSection>

      <LegalSection id="not-emergency" title="2. Not emergency services">
        <p>
          PocketBuddy is <strong>not</strong> a replacement for emergency services, crisis hotlines, law enforcement, or medical responders. Do not rely on
          PocketBuddy as your sole safety plan.
        </p>
      </LegalSection>

      <LegalSection id="recording-laws" title="3. Recording laws">
        <p>
          Recording laws vary by state, country, and situation. You are responsible for complying with applicable laws before recording or
          sharing sensitive audio, video, or similar materials.
        </p>
      </LegalSection>

      <LegalSection id="sms" title="4. SMS / trusted contact disclaimer">
        <p>
          PocketBuddy may help you prepare or open message alerts to trusted contacts, depending on product implementation. SmartProBono does{' '}
          <strong>not</strong> guarantee that messages are <strong>delivered</strong>, <strong>read</strong>, understood, or that recipients will take any{' '}
          <strong>action</strong>.
        </p>
      </LegalSection>

      <LegalSection id="location" title="5. Location disclaimer">
        <p>
          Location accuracy and availability depend on permissions, GPS hardware, networks, environments (such as indoors), operating-system
          behavior, and user settings. PocketBuddy does <strong>not</strong> guarantee precise or continuous location information.
        </p>
      </LegalSection>

      <LegalSection id="incident-packet" title="6. Incident packet disclaimer">
        <p>
          Incident packets are for <strong>personal organization and documentation</strong>. They are <strong>not</strong> court filings, <strong>not</strong> certified evidence, and{' '}
          <strong>not</strong> a guarantee of admissibility or evidentiary value in any forum.
        </p>
      </LegalSection>

      <LegalSection id="relationship" title="7. SmartProBono relationship">
        <p>
          PocketBuddy is SmartProBono&apos;s <strong>consumer safety documentation</strong> product. SmartProBono may separately offer legal-intake,
          justice-access, or organizational workflows (for example, web-based tools for clinics). Those offerings have their own terms and are{' '}
          <strong>distinct</strong> from PocketBuddy unless expressly stated otherwise.
        </p>
      </LegalSection>

      <LegalSection id="external" title="8. External resources">
        <p>You may find independent educational materials helpful. For example:</p>
        <ul>
          <li>
            <a href={ACLU_KNOW_YOUR_RIGHTS_URL} target="_blank" rel="noopener noreferrer">
              ACLU — Know Your Rights
            </a>{' '}
            (<span className="break-all">{ACLU_KNOW_YOUR_RIGHTS_URL}</span>)
          </li>
        </ul>
        <p>
          SmartProBono <strong>does not control</strong> third-party websites or organizations. Links are for convenience; content may change without notice.
          Inclusion of a link is <strong>not</strong> an endorsement of every statement on a third-party site.
        </p>
      </LegalSection>
    </PocketBuddyLegalLayout>
  );
}
