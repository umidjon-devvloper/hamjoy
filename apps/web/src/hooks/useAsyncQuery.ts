'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatUserError } from '@/lib/errors/format-user-error';

export interface AsyncQueryState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAsyncQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  initialData: T
): AsyncQueryState<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(formatUserError(err));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, isLoading, error, refetch };
}
