'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthGateSkeleton } from '@/components/ui/LoadingState';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
    if (user.blocked) {
      router.replace('/login?blocked=1');
    }
  }, [isAuthenticated, isHydrated, user.blocked, redirectTo, router]);

  if (!isHydrated) {
    return <AuthGateSkeleton />;
  }

  if (!isAuthenticated || user.blocked) {
    return <AuthGateSkeleton />;
  }

  return <>{children}</>;
}
