import React from 'react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { PlatformNavbar } from '@/components/layout/PlatformNavbar';
import { MainShell } from '@/components/layout/MainShell';

/** Account pages share the platform navbar with /home, so the whole site has one header. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <PlatformNavbar />
      <main className="relative mx-auto w-full max-w-5xl flex-1 pb-28 md:pb-10">
        <MainShell>{children}</MainShell>
      </main>
      <BottomNavigation />
    </div>
  );
}
