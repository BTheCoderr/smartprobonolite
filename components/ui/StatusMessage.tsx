'use client';

type Variant = 'error' | 'success' | 'info' | 'warning';

const styles: Record<Variant, string> = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

type Props = {
  variant: Variant;
  message: string;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
  className?: string;
};

export function StatusMessage({ variant, message, onDismiss, action, className = '' }: Props) {
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={`rounded-lg border p-3 text-sm flex items-start justify-between gap-2 ${styles[variant]} ${className}`}
    >
      <span>{message}</span>
      <span className="flex shrink-0 gap-2 items-center">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="underline font-medium"
          >
            {action.label}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="opacity-60 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        )}
      </span>
    </div>
  );
}
