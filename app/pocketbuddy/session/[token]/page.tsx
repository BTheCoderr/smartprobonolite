import type { Metadata } from 'next';
import { PocketBuddyRecipientChrome } from '@/components/pocketbuddy/PocketBuddyRecipientChrome';
import {
  loadRecipientSessionView,
  validateRecipientSessionToken,
  type RecipientSessionViewModel,
} from '@/lib/pocketbuddy/recipientSession';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ROBOTS_NOINDEX = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Trusted contact update | PocketBuddy',
    description:
      'Information shared with you through PocketBuddy by SmartProBono. Not emergency services. Does not guarantee message delivery.',
    robots: ROBOTS_NOINDEX,
  };
}

function DisclaimerCard() {
  return (
    <div className="rounded-xl border border-[#349B98]/25 bg-[#EEF8F7] p-4 text-xs text-[#475569] leading-relaxed space-y-2">
      <p className="font-semibold text-[#0F2F55]">Please read</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>This page is informational only — not legal advice and not emergency services.</li>
        <li>PocketBuddy does not guarantee SMS delivery, that messages were read, or any particular response.</li>
        <li>SmartProBono does not represent you; nothing here creates an attorney–client relationship.</li>
        <li>
          Location accuracy, timing, and what appears here depend on the sender&apos;s device, permissions, networks, and settings — we do
          not guarantee accuracy or completeness.
        </li>
      </ul>
    </div>
  );
}

function EmergencyStrip() {
  return (
    <div className="rounded-xl border border-[#DC2626]/35 bg-red-50 p-4 text-sm text-[#475569] space-y-2">
      <p className="font-bold text-[#DC2626]">Immediate danger?</p>
      <p>
        Call <strong className="text-[#0F2F55]">911</strong> or your <strong className="text-[#0F2F55]">local emergency number</strong>. PocketBuddy cannot dispatch police,
        medical help, or crisis responders.
      </p>
      <p className="text-xs">
        Outside the U.S., use the emergency number for your location.
      </p>
      <a
        href="tel:911"
        className="inline-flex mt-1 rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-bold text-white hover:bg-[#b91c1c] sm:hidden"
      >
        Call 911 (U.S.)
      </a>
    </div>
  );
}

function SessionBody({ model }: { model: RecipientSessionViewModel }) {
  switch (model.kind) {
    case 'invalid_token':
      return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
          <p className="font-semibold text-[#0F2F55]">Link not recognized</p>
          <p className="text-sm text-[#475569] leading-relaxed">
            This URL doesn&apos;t match the format we expect for PocketBuddy trusted-contact links. Open the full link from the SMS you
            received (without edits). If you pasted part of the link, try again from the original message.
          </p>
        </div>
      );

    case 'unconfigured':
      return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
          <p className="font-semibold text-[#0F2F55]">Shared session</p>
          <p className="text-sm text-[#475569] leading-relaxed">
            Someone may have sent you this link from PocketBuddy by SmartProBono so you could view limited session-related information in a
            browser. In this environment, detailed session content isn&apos;t loaded from the PocketBuddy service yet.
          </p>
          <p className="text-sm text-[#475569] leading-relaxed">
            Ask the person who texted you to confirm you have the correct link, or contact PocketBuddy support using the email below if this
            keeps happening.
          </p>
        </div>
      );

    case 'not_found':
      return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
          <p className="font-semibold text-[#0F2F55]">Link unavailable</p>
          <p className="text-sm text-[#475569] leading-relaxed">
            This link may have expired, been withdrawn, or no longer exists. Ask the sender for an updated link if they still want to share
            information with you.
          </p>
        </div>
      );

    case 'upstream_error':
      return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
          <p className="font-semibold text-[#0F2F55]">Couldn&apos;t load right now</p>
          <p className="text-sm text-[#475569] leading-relaxed">
            We couldn&apos;t retrieve session details at the moment. You can try opening the link again shortly. If the problem continues,
            contact support — please don&apos;t share full URLs with strangers.
          </p>
        </div>
      );

    case 'ok': {
      const { headline, bodyText, sharedAtIso } = model.data;
      const when =
        sharedAtIso &&
        (() => {
          try {
            const d = new Date(sharedAtIso);
            return Number.isFinite(d.getTime()) ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : null;
          } catch {
            return null;
          }
        })();

      return (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4">
          {headline ? <h2 className="text-lg font-bold text-[#133659] leading-snug">{headline}</h2> : null}
          {when ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-[#475569]">Shared ~ {when}</p>
          ) : null}
          {bodyText ? (
            <div className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap break-words">{bodyText}</div>
          ) : (
            <p className="text-sm text-[#475569] leading-relaxed">
              No additional text was included with this link. Check with the sender if you expected more detail.
            </p>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

export default async function PocketBuddyRecipientSessionPage({ params }: { params: { token: string } }) {
  const normalized = validateRecipientSessionToken(params.token);
  const model: RecipientSessionViewModel = normalized ? await loadRecipientSessionView(normalized) : { kind: 'invalid_token' };

  return (
    <PocketBuddyRecipientChrome>
      <div className="space-y-5 pb-8">
        <EmergencyStrip />
        <SessionBody model={model} />
        <DisclaimerCard />
      </div>
    </PocketBuddyRecipientChrome>
  );
}
