import type { Metadata } from 'next';
import { PocketBuddyLegalLayout } from '@/components/pocketbuddy/PocketBuddyLegalLayout';
import { LegalSection } from '@/components/pocketbuddy/LegalSection';
import { pocketBuddyCanonicalUrl } from '@/lib/pocketbuddy/legalSite';

export async function generateMetadata(): Promise<Metadata> {
  const canonical = pocketBuddyCanonicalUrl('/pocketbuddy/terms');
  return {
    title: 'PocketBuddy Terms of Service | SmartProBono',
    description:
      'Terms of Service for PocketBuddy by SmartProBono — not emergency services, no legal advice, recording laws, incident packets, and limitations.',
    robots: { index: true, follow: true },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export default function PocketBuddyTermsPage() {
  return (
    <PocketBuddyLegalLayout
      active="terms"
      title="PocketBuddy Terms of Service"
      subtitle="Please read these terms before using PocketBuddy."
    >
      <LegalSection id="acceptance" title="1. Acceptance of terms">
        <p>
          By downloading, accessing, or using PocketBuddy, you agree to these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the
          app.
        </p>
      </LegalSection>

      <LegalSection id="what" title="2. What PocketBuddy does">
        <p>
          PocketBuddy by SmartProBono is a consumer safety documentation app that may help you start safety sessions, optionally share
          location with trusted contacts you designate, document important moments, save session history on your device, and export structured
          incident packets when you choose.
        </p>
      </LegalSection>

      <LegalSection id="not-emergency" title="3. Not emergency services">
        <p>
          PocketBuddy is <strong>not</strong> a replacement for <strong>911</strong>, emergency services, law enforcement, medical services, or professional crisis
          response. If you believe you are in <strong>immediate danger</strong>, contact <strong>911</strong> or your <strong>local emergency number</strong>.
        </p>
      </LegalSection>

      <LegalSection id="no-safety-guarantee" title="4. No safety guarantee">
        <p>
          SmartProBono does <strong>not</strong> guarantee your safety, the safety of others, or any particular outcome. Use of PocketBuddy does{' '}
          <strong>not</strong> mean help will arrive, messages will be seen, or risk will be reduced.
        </p>
      </LegalSection>

      <LegalSection id="no-legal-advice" title="5. No legal advice">
        <p>
          PocketBuddy does <strong>not</strong> provide legal advice and SmartProBono does <strong>not</strong> represent you as your attorney. Use does{' '}
          <strong>not</strong> create an attorney-client relationship. For legal questions, consult a qualified lawyer licensed in your jurisdiction.
        </p>
      </LegalSection>

      <LegalSection id="recording-laws" title="6. Recording laws">
        <p>
          Recording laws vary by location. You are solely responsible for determining whether your recording or documentation practices comply
          with federal, state, local, and other applicable rules before recording audio, video, or other sensitive interactions.
        </p>
      </LegalSection>

      <LegalSection id="user-responsibility" title="7. User responsibility">
        <p>You agree that your use of PocketBuddy depends on factors including, without limitation:</p>
        <ul>
          <li>Battery level and power-saving modes;</li>
          <li>Operating-system permissions and restrictions;</li>
          <li>Network availability and quality;</li>
          <li>SMS, MMS, and third-party messaging app limitations;</li>
          <li>GPS and location-service accuracy;</li>
          <li>Your device settings and trusted-contact configurations.</li>
        </ul>
      </LegalSection>

      <LegalSection id="incident-packets" title="8. Incident packets">
        <p>
          Incident packets are outputs you generate for personal organization and documentation. They are <strong>not</strong> guaranteed to be{' '}
          <strong>admissible</strong>, <strong>complete</strong>, <strong>accurate</strong>, or to have any particular <strong>evidentiary value</strong>. They are <strong>not</strong> legal filings.
        </p>
      </LegalSection>

      <LegalSection id="limitations" title="9. Limitations of service">
        <p>
          PocketBuddy does <strong>not</strong> guarantee message delivery, recipient attention, location accuracy, uptime, or error-free operation.
          Features may change, pause, or end with reasonable notice where practicable.
        </p>
      </LegalSection>

      <LegalSection id="future-paid" title="10. Future paid features">
        <p>
          SmartProBono may introduce paid subscriptions or in-app purchases. If it does, pricing and renewal terms will be presented before
          purchase. Until then, do not assume paid tiers exist.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes to terms">
        <p>
          We may update these Terms from time to time. Material updates will be reflected by revising the &quot;Last updated&quot; date on these pages
          and/or through in-app notices where appropriate.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p>For questions about these Terms, use the contact email shown in the box below.</p>
      </LegalSection>
    </PocketBuddyLegalLayout>
  );
}
