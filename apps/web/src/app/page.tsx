import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/navigation/routes';

/** Welcome: pick a side of the platform — Uy-joy or Ish. */
export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-secondary)]">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-5 sm:px-6">
        <span className="flex items-center gap-2.5">
          <Image src="/brand/hamjoy-logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl border border-[var(--color-border)]" />
          <span className="flex flex-col leading-none">
            <span className="text-[19px] font-extrabold tracking-[0.04em]">HAMJOY</span>
            <span className="mt-1.5 text-[10px] font-semibold tracking-[0.22em] text-[var(--color-brand-green)]">UY-JOY · ISH</span>
          </span>
        </span>
        <span className="ml-auto flex gap-2">
          <Link
            href={ROUTES.login}
            className="flex h-11 items-center rounded-[14px] border border-[#DADBD5] bg-white px-[18px] font-semibold hover:bg-[var(--color-primary-light)]"
          >
            Kirish
          </Link>
          <Link
            href={ROUTES.register}
            className="flex h-11 items-center rounded-[14px] bg-[var(--color-brand-green)] px-[18px] font-bold text-white hover:bg-[var(--color-brand-green-deep)]"
          >
            Roʻyxatdan oʻtish
          </Link>
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-9 px-4 pb-12 pt-6 sm:px-6">
        <div className="flex max-w-3xl flex-col gap-3.5">
          <h1 className="text-[clamp(2.625rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
            Uy ham, ish ham —
            <br />
            <span className="text-[var(--color-brand-green)]">bir joyda.</span>
          </h1>
          <p className="max-w-[560px] text-[19px] text-[var(--color-muted)]">
            Kvartira, hovli va kunlik ijara yoki vakansiya va kunlik ish. Egasi bilan bevosita bogʻlaning — vositachilarsiz.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href={ROUTES.home}
            className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[30px] bg-[var(--color-brand-green-deep)] p-7 text-white transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(18_63_38/0.55)]"
          >
            <Image src="/carousel/uy-joy-hovli.webp" alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[#0C2818]/90" aria-hidden />
            <span className="relative flex items-end justify-between gap-4">
              <span className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold tracking-[0.16em] text-[var(--color-brand-gold-soft)]">UY-JOY</span>
                <span className="text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em]">Uy topish yoki<br />eʼlon berish</span>
                <span className="text-[15px] text-white/85">Sotuv · Ijara · Kunlik · Turar joy majmualari</span>
              </span>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[var(--color-brand-green-deep)]">
                <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.2} />
              </span>
            </span>
          </Link>
          <Link
            href={ROUTES.jobs}
            className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[30px] bg-[var(--color-brand-gold-soft)] p-7 text-[var(--color-ink-on-gold)] transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(122_90_18/0.5)]"
          >
            <Image src="/listings/ofis-1.webp" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-right [mask-image:linear-gradient(90deg,transparent_35%,black_75%)]" />
            <span className="relative flex items-end justify-between gap-4">
              <span className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold tracking-[0.16em] text-[#7A5A12]">ISH</span>
                <span className="text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em]">Ish topish yoki<br />xodim qidirish</span>
                <span className="text-[15px] text-[#4A3A12]">Vakansiyalar · Kunlik ish · Xaritadan qidirish</span>
              </span>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#0B0B0C] text-white">
                <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.2} />
              </span>
            </span>
          </Link>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Koʻrish bepul, roʻyxatdan oʻtmasdan ham mumkin.{' '}
          <Link href="/legal/terms" className="text-[var(--color-brand-green)] hover:underline">Foydalanish shartlari</Link> ·{' '}
          <Link href="/legal/privacy" className="text-[var(--color-brand-green)] hover:underline">Maxfiylik siyosati</Link>
        </p>
      </main>
    </div>
  );
}
