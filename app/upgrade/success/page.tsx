import { redirect } from 'next/navigation';

/** Legacy URL — checkout now lands on /success; keep this redirect for bookmarks and old emails. */
export default function UpgradeSuccessRedirectPage({
  searchParams,
}: {
  searchParams: { session_id?: string | string[] };
}) {
  const raw = searchParams.session_id;
  const sid = Array.isArray(raw) ? raw[0] : raw;
  const q = sid ? `?session_id=${encodeURIComponent(sid)}` : '';
  redirect(`/success${q}`);
}
