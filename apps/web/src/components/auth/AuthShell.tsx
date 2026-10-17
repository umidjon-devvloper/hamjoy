import Image from 'next/image';
import Link from 'next/link';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Login / register: photo panel with the brand promise on the left, the form on the right. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-wrap gap-4 bg-[var(--color-background)] p-4">
      <aside className="relative hidden min-h-[360px] flex-[1_1_420px] flex-col justify-between overflow-hidden rounded-[28px] bg-[var(--color-brand-green-deep)] p-8 text-white lg:flex">
        <Image
          src="/listings/hovli-zamonaviy.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-45"
        />
        <Link href="/" className="relative flex items-center gap-2.5 text-white">
          <Image src="/brand/hamjoy-logo.png" alt="" width={42} height={42} className="h-[42px] w-[42px] rounded-xl" />
          <span className="text-lg font-extrabold tracking-[0.04em]">HAMJOY</span>
        </Link>
        <div className="relative flex max-w-[460px] flex-col gap-3">
          <p className="text-[clamp(1.875rem,3.4vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
            Saqlangan eʼlonlar, xabarlar va arizalaringiz — hammasi bitta raqamda.
          </p>
          <p className="text-base text-white/85">Parol yoʻq. Telefon raqamingizga SMS kod keladi.</p>
        </div>
      </aside>

      <main className="flex flex-[1_1_460px] items-center justify-center px-2 py-6 sm:px-6">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image src="/brand/hamjoy-logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
            <span className="text-[17px] font-extrabold tracking-[0.04em] text-[var(--color-secondary)]">HAMJOY</span>
          </Link>
          <div className="mb-6">
            <h1 className="text-[34px] font-extrabold tracking-[-0.03em] text-[var(--color-secondary)]">{title}</h1>
            <p className="mt-1.5 text-[var(--color-muted)]">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-[var(--color-muted)]">{footer}</div>}
          <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
            Davom etib, <Link href="/legal/terms" className="text-[var(--color-brand-green)] hover:underline">Foydalanish shartlari</Link> va{' '}
            <Link href="/legal/privacy" className="text-[var(--color-brand-green)] hover:underline">Maxfiylik siyosati</Link>ga rozilik bildirasiz.
          </p>
        </div>
      </main>
    </div>
  );
}
