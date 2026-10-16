'use client';

import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { AuthProvider } from './AuthContext';
import { FavoritesProvider } from './FavoritesContext';
import { ChatsProvider } from './ChatsContext';
import { ApplicationsProvider } from './ApplicationsContext';
import { NotificationsProvider } from './NotificationsContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ApplicationsProvider>
          <NotificationsProvider>
            <ChatsProvider>
              <OfflineBanner />
              <CookieConsent />
              {children}
              <Analytics />
            </ChatsProvider>
          </NotificationsProvider>
        </ApplicationsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
