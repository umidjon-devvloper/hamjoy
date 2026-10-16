import React from 'react';
import { PlatformNavbar } from '@/components/layout/PlatformNavbar';

/**
 * Pages under the platform navbar (/home, /home/ish, /uy-joy/*). The navbar lives here so it
 * stays mounted while the page below it changes — open menus, scroll state and theme survive.
 */
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <PlatformNavbar />
      {children}
    </div>
  );
}
