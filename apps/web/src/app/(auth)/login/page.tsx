import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Kirish',
  description: "Profilingiz, xabarlar va eʼlonlaringizni boshqarish uchun HamJoy'ga kiring.",
  path: '/login',
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthShell
      title="Xush kelibsiz"
      subtitle="Profilingiz va xabarlaringizni boshqaring"
      footer={
        <Link href="/home" className="text-[var(--color-primary)] font-medium hover:underline">
          Kirmasdan davom etish
        </Link>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
