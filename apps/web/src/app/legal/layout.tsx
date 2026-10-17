import { PlatformNavbar } from '@/components/layout/PlatformNavbar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { LegalTabs } from './LegalTabs';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <PlatformNavbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-9 sm:px-6">
        <LegalTabs />
        <article className="card rounded-3xl p-6 text-[var(--color-secondary)] sm:p-9 [&_h1]:text-[clamp(1.875rem,3.6vw,2.625rem)] [&_h1]:font-extrabold [&_h1]:tracking-[-0.03em] [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_li]:leading-[1.7] [&_p]:leading-[1.7]">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
