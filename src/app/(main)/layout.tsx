import React from 'react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { DesktopNavigation } from '@/components/layout/DesktopNavigation';
import { MainShell } from '@/components/layout/MainShell';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <DesktopNavigation />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-3xl lg:max-w-5xl mx-auto pb-28 md:pb-8 relative">
          <MainShell>{children}</MainShell>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
