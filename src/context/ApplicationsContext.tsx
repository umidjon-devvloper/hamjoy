'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Application } from '@/types';
import { applicationsService } from '@/services/applications.service';
import { useAuth } from '@/context/AuthContext';
import { formatUserError } from '@/lib/errors/format-user-error';

interface ApplicationsContextValue {
  appliedIds: Set<string>;
  isApplied: (jobId: string) => boolean;
  apply: (jobId: string, coverNote?: string) => Promise<Application>;
  myApplications: Application[];
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const { isHydrated: authHydrated } = useAuth();
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const apps = await applicationsService.getMyApplications();
        if (!cancelled) {
          setMyApplications(apps);
          setAppliedIds(new Set(apps.map((a) => a.jobId)));
          setIsHydrated(true);
        }
      } catch (err) {
        if (!cancelled) setError(formatUserError(err, 'Arizalarni yuklab boʻlmadi'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [version, authHydrated]);

  const isApplied = useCallback((jobId: string) => appliedIds.has(jobId), [appliedIds]);

  const apply = useCallback(
    async (jobId: string, coverNote?: string) => {
      const application = await applicationsService.apply(jobId, coverNote);
      setAppliedIds((prev) => new Set(prev).add(jobId));
      refresh();
      return application;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      appliedIds,
      isApplied,
      apply,
      myApplications,
      isHydrated,
      isLoading,
      error,
      refresh,
    }),
    [appliedIds, isApplied, apply, myApplications, isHydrated, isLoading, error, refresh]
  );

  return (
    <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
  );
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error('useApplications must be used within ApplicationsProvider');
  }
  return ctx;
}
