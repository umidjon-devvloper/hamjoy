'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MockAuthNotice } from './MockAuthNotice';
import { useAuth } from '@/context/AuthContext';
import { isRestBackendEnabled } from '@/lib/api/config';
import { appToast } from '@/lib/feedback/toast';

export function LoginForm() {
  const router = useRouter();
  const { login, otpSend, otpVerify, isMockAuth } = useAuth();

  const isRest = isRestBackendEnabled();

  // --- OTP flow (REST / Joymee API) ---
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [expiresInSec, setExpiresInSec] = useState<number | null>(null);

  // --- Email+password flow (mock / Firebase) ---
  const [email, setEmail] = useState('demo@jobmarket.app');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      appToast.error('Telefon raqamingizni to\'liq kiriting');
      return;
    }
    setIsSubmitting(true);
    try {
      const { expiresInSec } = await otpSend(phone);
      setExpiresInSec(expiresInSec);
      setStep('code');
      appToast.success('SMS kod yuborildi');
    } catch (err) {
      appToast.error(err, 'Kod yuborishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      appToast.error('6 raqamli kodni kiriting');
      return;
    }
    setIsSubmitting(true);
    try {
      await otpVerify(phone, code);
      appToast.success('Xush kelibsiz!');
      router.push('/home');
    } catch (err) {
      appToast.error(err, 'Kirishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
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

  // ---- REST OTP: phone step ----
  if (isRest && step === 'phone') {
    return (
      <form onSubmit={handleSendCode} className="space-y-4">
        <Input
          label="Telefon raqam"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          hint="O'zbekiston raqamiga SMS kod yuboriladi"
        />
        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Kod yuborish
        </Button>
      </form>
    );
  }

  // ---- REST OTP: code step ----
  if (isRest && step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-4">
        <Input
          label="SMS kod"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          hint={expiresInSec ? `Kod ${Math.floor(expiresInSec / 60)} daqiqa amal qiladi` : undefined}
          autoFocus
        />
        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Tasdiqlash
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep('phone');
            setCode('');
          }}
          className="w-full text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)]"
        >
          ← Telefon raqamni o'zgartirish
        </button>
      </form>
    );
  }

  // ---- Mock / Firebase email+password ----
  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      {isMockAuth && <MockAuthNotice />}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <Input
        label="Parol"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
