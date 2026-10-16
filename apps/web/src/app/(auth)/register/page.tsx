import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Roʻyxatdan oʻtish',
  description: "HamJoy'da ish izlovchi yoki ish beruvchi sifatida roʻyxatdan oʻting.",
  path: '/register',
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hisob yaratish"
      subtitle="Ish izlovchi yoki ish beruvchi sifatida qoʻshiling"
      footer={
        <Link href="/home" className="text-[var(--color-primary)] font-medium hover:underline">
          Hisobsiz davom etish
        </Link>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
