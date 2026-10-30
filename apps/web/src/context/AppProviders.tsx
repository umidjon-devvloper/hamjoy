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
import { QueryProvider } from './QueryProvider';
import { I18nProvider } from '@/lib/i18n';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <I18nProvider>
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
      </I18nProvider>
    </QueryProvider>
  );
}
