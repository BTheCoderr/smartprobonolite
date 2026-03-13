'use client';

export function Stepper({
  steps,
  currentIndex,
}: {
  steps: string[];
  currentIndex: number;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        {steps.map((label, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={label} className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className={[
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border',
                    isDone
                      ? 'bg-spb-blue text-white border-spb-blue'
                      : isCurrent
                        ? 'bg-white text-spb-ink border-spb-blue'
                        : 'bg-white text-gray-500 border-gray-200',
                  ].join(' ')}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div
                    className={[
                      'text-xs md:text-sm font-medium truncate',
                      isCurrent ? 'text-spb-ink' : 'text-gray-600',
                    ].join(' ')}
                    title={label}
                  >
                    {label}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="h-1 mt-3 rounded-full bg-gray-100">
                  <div
                    className={[
                      'h-1 rounded-full transition-all',
                      isDone ? 'w-full bg-spb-blue' : 'w-0 bg-spb-blue',
                    ].join(' ')}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

