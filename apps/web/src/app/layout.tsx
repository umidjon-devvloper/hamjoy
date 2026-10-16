import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { AppProviders } from '@/context/AppProviders';
import { createPageMetadata, siteConfig } from '@/lib/seo/metadata';
import { THEME_INIT_SCRIPT } from '@/lib/theme-script';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Used by the hero carousel (its spec calls for Inter).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = createPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
      // The theme script sets data-theme before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-background)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[var(--color-primary)] focus:text-white"
        >
          Asosiy kontentga oʻtish
        </a>
        <AppProviders>
          <div id="main-content" className="flex-1 flex flex-col">
            {children}
          </div>
        </AppProviders>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
