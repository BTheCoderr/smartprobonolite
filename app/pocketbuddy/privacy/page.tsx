import type { Metadata } from 'next';
import { PocketBuddyLegalLayout } from '@/components/pocketbuddy/PocketBuddyLegalLayout';
import { LegalSection } from '@/components/pocketbuddy/LegalSection';
import { pocketBuddyCanonicalUrl } from '@/lib/pocketbuddy/legalSite';

export async function generateMetadata(): Promise<Metadata> {
  const canonical = pocketBuddyCanonicalUrl('/pocketbuddy/privacy');
  return {
    title: 'PocketBuddy Privacy Policy | SmartProBono',
    description:
      'Privacy Policy for PocketBuddy by SmartProBono — local-first safety documentation, location, recordings, trusted contacts, SMS limitations, and incident packets.',
    robots: { index: true, follow: true },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export default function PocketBuddyPrivacyPage() {
  return (
    <PocketBuddyLegalLayout
      active="privacy"
      title="PocketBuddy Privacy Policy"
      subtitle="PocketBuddy by SmartProBono is designed as a local-first safety documentation tool."
    >
      <LegalSection id="overview" title="1. Overview">
        <p>
          This Privacy Policy describes how PocketBuddy handles information when you use the PocketBuddy mobile application and related
          materials published by SmartProBono (&quot;SmartProBono,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). PocketBuddy is intended to help you start safety sessions,
          coordinate optional sharing with trusted contacts, document important moments, maintain session history on your device, and export
          structured incident packets when <strong>you</strong> choose to do so.
        </p>
        <p>
          PocketBuddy is <strong>not</strong> emergency services, <strong>not</strong> a law firm, and <strong>does not</strong> provide legal advice. Nothing in this Policy changes that.
        </p>
      </LegalSection>

      <LegalSection id="local-first" title="2. Local-first storage">
        <p>
          Session history and related app data you generate are stored <strong>on your device</strong> by default, consistent with PocketBuddy&apos;s
          local-first design. We do <strong>not</strong> describe or promise cloud backup, synchronization across devices, or server-side storage of your
          sessions unless and until a specific feature is separately documented in-product and, if required, in this Policy.
        </p>
      </LegalSection>

      <LegalSection id="information" title="3. Information users may enter or generate">
        <p>You may enter or generate various types of information, such as:</p>
        <ul>
          <li>Notes, labels, timestamps, or similar documentation you choose to record;</li>
          <li>Optional trusted-contact details you provide;</li>
          <li>Exported incident packets when you initiate an export;</li>
          <li>Diagnostics or feedback you voluntarily send to SmartProBono (if offered), as described in applicable in-app notices.</li>
        </ul>
        <p>The categories actually collected may evolve as features change; we will update this Policy when material changes occur.</p>
      </LegalSection>

      <LegalSection id="location" title="4. Location data">
        <p>
          Location-related features depend on <strong>your device permissions</strong>, <strong>your actions</strong>, and factors outside SmartProBono&apos;s control (for
          example, GPS accuracy, network availability, operating-system behavior, and battery-saving settings). PocketBuddy does{' '}
          <strong>not</strong> guarantee continuous, precise, or uninterrupted location sharing.
        </p>
      </LegalSection>

      <LegalSection id="recordings" title="5. Recordings">
        <p>
          Recordings you create are stored <strong>on your device</strong> unless and until <strong>you</strong> choose to share or export them using tools outside
          PocketBuddy (such as your device&apos;s share sheet). Recording laws vary by jurisdiction; <strong>you are responsible</strong> for compliance with
          applicable laws before recording others or sharing recordings.
        </p>
      </LegalSection>

      <LegalSection id="trusted-contacts" title="6. Trusted contacts and SMS">
        <p>
          If you use features that involve messaging trusted contacts, delivery depends on carriers, device settings, message apps, spam
          filters, and other factors SmartProBono does not control. PocketBuddy <strong>cannot</strong> guarantee that SMS or other messages are{' '}
          <strong>delivered</strong>, <strong>read</strong>, or that recipients will <strong>respond</strong> or take action.
        </p>
      </LegalSection>

      <LegalSection id="incident-packets" title="7. Incident packets">
        <p>
          Incident packets are generated <strong>only when you export them</strong>. Exported packets may contain sensitive information; treat them
          accordingly. Packets are intended as <strong>informational documentation aids</strong>; they are <strong>not legal proof</strong>, <strong>not legal advice</strong>,
          and <strong>not</strong> a guarantee of accuracy, completeness, or usefulness in any legal process.
        </p>
      </LegalSection>

      <LegalSection id="future-cloud" title="8. Future cloud features">
        <p>
          If SmartProBono introduces optional cloud features (for example, backup or sync), those features will be described in-product and
          this Policy will be updated before reliance on new collection or processing practices. Until then, do not assume cloud storage or
          backup exists.
        </p>
      </LegalSection>

      <LegalSection id="children" title="9. Children / family features">
        <p>
          PocketBuddy may include experiences intended for general audiences. If you allow a minor to use PocketBuddy, you are responsible
          for supervising that use and for determining whether the app is appropriate. SmartProBono does not provide tailored legal guidance
          about children&apos;s privacy obligations in every jurisdiction.
        </p>
      </LegalSection>

      <LegalSection id="user-control" title="10. User control">
        <p>
          You can typically manage permissions (such as location, microphone, and notifications) through your device settings. Deleting the
          app may remove locally stored data depending on your operating system; refer to your device documentation for retention behavior.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. Contact">
        <p>For questions about this Privacy Policy, use the contact email shown in the box below.</p>
      </LegalSection>
    </PocketBuddyLegalLayout>
  );
}
