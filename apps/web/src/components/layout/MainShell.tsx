'use client';

import React from 'react';
import { PageTransition } from '@/components/layout/PageTransition';

export function MainShell({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
