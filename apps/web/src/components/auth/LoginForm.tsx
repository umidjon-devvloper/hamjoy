'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MockAuthNotice } from './MockAuthNotice';
import { useAuth } from '@/context/AuthContext';
import { validateLogin, hasAuthErrors, type AuthFormErrors } from '@/lib/validations/auth.validation';
import { appToast } from '@/lib/feedback/toast';

export function LoginForm() {
  const router = useRouter();
  const { login, isMockAuth } = useAuth();
  const [email, setEmail] = useState('demo@jobmarket.app');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateLogin({ email, password });
    setErrors(validation);
    if (hasAuthErrors(validation)) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      appToast.success('Xush kelibsiz!');
      router.push('/home');
    } catch (err) {
      appToast.error(err, 'Kirishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isMockAuth && <MockAuthNotice />}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@example.com"
      />

      <Input
        label="Parol"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        hint={isMockAuth ? 'Mock rejimda istalgan parol ishlaydi' : undefined}
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Kirish
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        Hisobingiz yoʻqmi?{' '}
        <Link href="/register" className="text-[var(--color-primary)] font-semibold hover:underline">
          Roʻyxatdan oʻting
        </Link>
      </p>
    </form>
  );
}
