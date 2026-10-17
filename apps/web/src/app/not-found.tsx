import Link from 'next/link';
import { ROUTES } from '@/lib/navigation/routes';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <section className="card flex w-full max-w-xl flex-col gap-3.5 rounded-[26px] p-9">
        <span className="text-xs font-bold tracking-[0.14em] text-[var(--color-muted)]">404 · SAHIFA TOPILMADI</span>
        <span aria-hidden className="text-[120px] font-extrabold leading-[0.9] tracking-[-0.06em] text-[var(--color-brand-green)]">
          4<span className="text-[var(--color-brand-gold)]">0</span>4
        </span>
        <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[var(--color-secondary)]">Bu manzilda hech narsa yoʻq</h1>
        <p className="text-[var(--color-muted)]">Eʼlon oʻchirilgan yoki havola notoʻgʻri boʻlishi mumkin.</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <Link
            href={ROUTES.home}
            className="flex h-[46px] items-center rounded-[14px] bg-[var(--color-brand-green)] px-[18px] font-bold text-white hover:bg-[var(--color-brand-green-deep)]"
          >
            Bosh sahifaga
          </Link>
          <Link
            href={ROUTES.search}
            className="flex h-[46px] items-center rounded-[14px] border border-[#DADBD5] bg-white px-[18px] font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-primary-light)]"
          >
            Qidiruvga oʻtish
          </Link>
        </div>
      </section>
    </main>
  );
}
