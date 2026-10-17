import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { ROUTES } from '@/lib/navigation/routes';

const STEPS = ['Rasm yuklang', 'Narx va manzil', 'Chop eting'];

/** Two cards under the listings: post a listing (gold) and the Ish section (deep green). */
export function HomeCtaBand() {
  return (
    <section className="mt-14 grid gap-5 lg:grid-cols-2">
      <div className="flex flex-col justify-between gap-6 rounded-[28px] bg-[var(--color-brand-gold-soft)] p-7 text-[var(--color-ink-on-gold)] sm:p-9">
        <div className="flex flex-col gap-2.5">
          <h2 className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em]">
            Uyingizni sotyapsizmi yoki ijaraga beryapsizmi?
          </h2>
          <p className="text-base text-[#4A3A12]">Eʼlon joylash bepul. Rasmlar, narx va manzil — tamom.</p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-1.5 rounded-2xl bg-white/55 p-3.5">
              <span className="text-[13px] font-extrabold">0{i + 1}</span>
              <span className="font-semibold">{s}</span>
            </li>
          ))}
        </ol>
        <Link
          href={ROUTES.createListing}
          className="inline-flex h-[50px] items-center gap-2 self-start rounded-2xl bg-[#0B0B0C] px-6 font-bold text-white transition-colors hover:bg-[#23262B]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.6} />
          Eʼlon joylash
        </Link>
      </div>
      <div className="relative flex min-h-[340px] flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-[var(--color-brand-green-deep)] p-7 text-white sm:p-9">
        <Image
          src="/listings/ofis-1.webp"
          alt=""
          width={420}
          height={340}
          className="absolute bottom-0 right-0 h-full w-[46%] object-cover opacity-80 [mask-image:linear-gradient(90deg,transparent,black_35%)]"
        />
        <div className="relative flex max-w-[56%] flex-col gap-2.5">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-brand-gold-soft)]">ISH BOʻLIMI</span>
          <h2 className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em]">Ish ham shu yerda</h2>
          <p className="text-base text-white/80">Vakansiyalar va kunlik ishlar — roʻyxatda yoki xaritada.</p>
        </div>
        <Link
          href={ROUTES.jobs}
          className="relative inline-flex h-[50px] items-center gap-2 self-start rounded-2xl bg-[var(--color-brand-gold)] px-6 font-bold text-[var(--color-ink-on-gold)] transition-[filter] hover:brightness-95"
        >
          Ishlarni koʻrish
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </Link>
      </div>
    </section>
  );
}
