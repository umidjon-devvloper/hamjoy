import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormErrorSummaryProps {
  errors: Record<string, string | undefined>;
  className?: string;
  title?: string;
}

export function FormErrorSummary({
  errors,
  className,
  title = 'Please fix the following',
}: FormErrorSummaryProps) {
  const messages = Object.values(errors).filter((message): message is string => Boolean(message));
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex gap-2',
        className
      )}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {messages.length === 1 ? (
          <p className="text-xs mt-1 opacity-90">{messages[0]}</p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs list-disc pl-4 opacity-90">
            {messages.slice(0, 5).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
