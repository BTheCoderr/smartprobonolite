'use client';

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold text-gray-800">{label}</label>
        {hint && <div className="text-xs text-gray-500">{hint}</div>}
      </div>
      {children}
      {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500',
        props.className || '',
      ].join(' ')}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500',
        props.className || '',
      ].join(' ')}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500',
        props.className || '',
      ].join(' ')}
    />
  );
}

export function YesNoButtons({
  value,
  onChange,
  name,
}: {
  value: 'yes' | 'no' | 'unsure';
  onChange: (v: 'yes' | 'no' | 'unsure') => void;
  name: string;
}) {
  const options: Array<{ id: 'yes' | 'no' | 'unsure'; label: string }> = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
    { id: 'unsure', label: 'Not sure' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={[
            'rounded-xl border px-3 py-3 text-sm font-semibold transition',
            value === opt.id
              ? 'border-spb-blue bg-blue-50 text-spb-ink'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
          ].join(' ')}
        >
          <span className="sr-only">{name}: </span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

