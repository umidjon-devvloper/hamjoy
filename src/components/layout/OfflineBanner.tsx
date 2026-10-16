'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] bg-amber-600 text-white text-sm font-medium px-4 py-2.5 flex items-center justify-center gap-2 shadow-md"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden />
      <span>Internet aloqasi yoʻq. Aloqa tiklanmaguncha baʼzi amallar ishlamasligi mumkin.</span>
    </div>
  );
}
