import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUserError } from '@/lib/errors/format-user-error';

interface QueryErrorBannerProps {
  message: string | null;
  className?: string;
  onRetry?: () => void;
}

export function QueryErrorBanner({ message, className, onRetry }: QueryErrorBannerProps) {
  if (!message) return null;

  const friendlyMessage = formatUserError(message);

  return (
    <div
      className={cn(
        'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2',
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">Could not load data</p>
        <p className="text-xs mt-0.5 opacity-90">{friendlyMessage}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold underline hover:no-underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
