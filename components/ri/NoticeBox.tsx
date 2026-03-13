'use client';

export function NoticeBox({
  title,
  children,
  tone = 'info',
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'info' | 'warning';
}) {
  const styles =
    tone === 'warning'
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-blue-50 border-blue-200 text-blue-900';

  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${styles}`}>
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm leading-relaxed text-gray-800">{children}</div>
    </div>
  );
}

