'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, ImagePlus, Loader2, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormErrorSummary } from '@/components/ui/FormErrorSummary';
import { useAuth } from '@/context/AuthContext';
import { LISTING_FEATURES, UZ_REGIONS } from '@/data/listings';
import { appToast } from '@/lib/feedback/toast';
import { compressImage } from '@/lib/listings/image';
import { addUserListing } from '@/lib/listings/user-listings';
import {
  formatListingPrice,
  LISTING_INTENTS,
  groupDigits,
  PROPERTY_TYPE_LABELS,
} from '@/lib/listings/format';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import {
  EMPTY_LISTING_FORM,
  MAX_LISTING_IMAGES,
  toPropertyListing,
  validateListingForm,
  type ListingFormData,
  type ListingFormErrors,
} from '@/lib/validations/listing.validation';
import type { ListingIntent, ListingPropertyType } from '@/types/listing';
import { IntentNav } from '@/components/listings/IntentNav';
import { sideAsideScrollClass } from '@/components/listings/side-nav-styles';

const GREEN_THEME = {
  '--color-primary': 'var(--color-brand-green)',
  '--color-primary-hover': '#18573A',
  '--color-primary-light': '#EAF4EE',
} as React.CSSProperties;

const segment = (active: boolean) =>
  cn(
    'flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70',
    active
      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
      : 'text-[var(--color-muted)] hover:bg-gray-100 hover:text-[var(--color-secondary)]',
  );

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card rounded-2xl p-4 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[var(--color-secondary)]">
        <span aria-hidden className="h-5 w-1 rounded-full bg-[var(--color-brand-green)]" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-[var(--color-secondary)]">{label}</p>
      <div
        role="group"
        aria-label={label}
        className="flex gap-1 rounded-2xl bg-gray-50 p-1 ring-1 ring-[var(--color-border)]"
      >
        {(Object.keys(options) as T[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={segment(value === key)}
          >
            {options[key]}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Uy-joy posting form — one page, validated on submit, saved via the listings store. */
export function CreateListingForm({ initialIntent = 'sotuv' }: { initialIntent?: ListingIntent }) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<ListingFormData>(() => ({
    ...EMPTY_LISTING_FORM,
    intent: initialIntent,
  }));
  const [errors, setErrors] = useState<ListingFormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const digitsOnly = (v: string) => v.replace(/\D/g, '');

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_LISTING_IMAGES - form.images.length;
    if (room <= 0) {
      appToast.info(`Koʻpi bilan ${MAX_LISTING_IMAGES} ta rasm`);
      return;
    }
    setIsUploading(true);
    try {
      const picked = Array.from(files).slice(0, room);
      const urls = await Promise.all(picked.map(compressImage));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      setErrors((e) => ({ ...e, images: undefined }));
      if (files.length > room) appToast.info(`Faqat ${room} ta rasm qoʻshildi (limit ${MAX_LISTING_IMAGES})`);
    } catch (err) {
      appToast.error(err, 'Rasmni yuklab boʻlmadi');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removePhoto = (i: number) =>
    set(
      'images',
      form.images.filter((_, idx) => idx !== i),
    );
  const makeCover = (i: number) =>
    set('images', [form.images[i], ...form.images.filter((_, idx) => idx !== i)]);

  const toggleFeature = (f: string) =>
    set('features', form.features.includes(f) ? form.features.filter((x) => x !== f) : [...form.features, f]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateListingForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsSubmitting(true);
    try {
      const listing = addUserListing(toPropertyListing(form, user.id));
      appToast.success('Eʼlon joylandi');
      router.push(ROUTES.listing(listing.id));
    } catch (err) {
      appToast.error(err, 'Eʼlonni saqlab boʻlmadi');
      setIsSubmitting(false);
    }
  };

  const intent = LISTING_INTENTS.find((i) => i.id === form.intent) ?? LISTING_INTENTS[2];
  const seeking = intent.seeking;
  const isFlat = form.type === 'kvartira';
  const isHouse = form.type === 'uy';
  const isLand = form.type === 'yer';
  const roomsOptional = seeking || form.type === 'tijorat';

  return (
    // Brand green replaces the default blue for every field, focus ring and accent in this form.
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]" style={GREEN_THEME}>
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[var(--color-brand-green)] to-[#2E8B57] px-4 py-3.5 text-white shadow-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Orqaga"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black sm:text-2xl">Eʼlon joylash</h1>
            <p className="text-sm font-medium text-white/85">
              Sotuv, ijara yoki xarid soʻrovi — bir sahifada
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={submit} noValidate className="flex-1 px-4 py-4 pb-28 sm:px-6 sm:py-5 lg:pb-8">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside className={cn('mb-4 lg:sticky lg:top-28 lg:mb-0 lg:max-h-[calc(100dvh-8rem)]', sideAsideScrollClass)}>
            <div className="lg:card lg:rounded-2xl lg:p-3">
              <p className="mb-2 hidden px-3.5 pt-1 text-lg font-bold text-[var(--color-secondary)] lg:block">
                Eʼlon turi
              </p>
              <IntentNav
                variant="post"
                label="Eʼlon turi"
                active={form.intent}
                onSelect={(v) => set('intent', v)}
              />
            </div>
          </aside>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:items-start">
            <FormErrorSummary
              errors={errors}
              title="Quyidagi maydonlarni tekshiring"
              className="xl:col-span-2"
            />

            {/* Left: what is offered */}
            <div className="space-y-4">
              {/* The headline buyers see first — on cards, in search and on the listing page. */}
              <section className="card rounded-2xl border-[var(--color-brand-green)]/40 p-4 ring-1 ring-[var(--color-brand-green)]/20 sm:p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="listing-title"
                    className="flex items-center gap-2 text-lg font-bold text-[var(--color-secondary)]"
                  >
                    Eʼlon sarlavhasi{' '}
                    <span className="text-red-500" aria-hidden>
                      *
                    </span>
                    <span className="rounded-full bg-[var(--color-brand-green)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      Asosiy
                    </span>
                  </label>
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      form.title.length > 70 ? 'text-orange-600' : 'text-[var(--color-muted)]',
                    )}
                  >
                    {form.title.length}/80
                  </span>
                </div>
                <input
                  id="listing-title"
                  value={form.title}
                  maxLength={80}
                  required
                  aria-invalid={errors.title ? true : undefined}
                  aria-describedby="listing-title-help"
                  placeholder={
                    seeking
                      ? 'Masalan: 2 xonali kvartira kerak, Chilonzor'
                      : isFlat
                        ? 'Masalan: 3 xonali kvartira, Yunusobod'
                        : 'Masalan: Zamonaviy hovli, Qibray'
                  }
                  onChange={(e) => set('title', e.target.value)}
                  className={cn(
                    'h-12 w-full rounded-xl border-2 bg-white px-4 text-lg font-semibold text-[var(--color-secondary)] outline-none transition placeholder:font-normal placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/15',
                    errors.title ? 'border-red-400' : 'border-[var(--color-border)]',
                  )}
                />
                <p
                  id="listing-title-help"
                  className={cn(
                    'mt-2 text-[13px] font-medium',
                    errors.title ? 'text-red-600' : 'text-gray-700',
                  )}
                >
                  {errors.title ??
                    'Bu sarlavha eʼloningizda, kartochkada va qidiruv natijalarida koʻrinadi. Xonalar soni va hududni yozing.'}
                </p>

                <div className="mt-3 rounded-xl bg-gray-50 p-3 ring-1 ring-[var(--color-border)]">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    Eʼlonda shunday koʻrinadi
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200 text-gray-400">
                      {form.images[0] ? (
                        <Image src={form.images[0]} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <ImagePlus className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-[var(--color-secondary)]">
                        {form.price
                          ? formatListingPrice({
                              price: Number(form.price),
                              currency: form.currency,
                              rentPeriod: intent.rentPeriod,
                            })
                          : 'Narx'}
                      </p>
                      <p
                        className={cn(
                          'truncate text-[15px] font-semibold',
                          form.title.trim() ? 'text-[var(--color-secondary)]' : 'text-[var(--color-muted)]',
                        )}
                      >
                        {form.title.trim() || 'Sarlavha shu yerda chiqadi'}
                      </p>
                      <p className="truncate text-xs font-medium text-gray-600">
                        {intent.badge} · {form.district.trim() || form.region || 'Hudud'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <Section title="Mulk turi">
                <Select
                  id="listing-type"
                  aria-label="Mulk turi"
                  value={form.type}
                  onChange={(e) => set('type', e.target.value as ListingPropertyType)}
                  options={(Object.keys(PROPERTY_TYPE_LABELS) as ListingPropertyType[]).map((t) => ({
                    value: t,
                    label: PROPERTY_TYPE_LABELS[t],
                  }))}
                />
                {seeking && (
                  <p className="rounded-xl bg-[var(--color-primary-light)] px-3 py-2 text-[13px] font-medium text-[var(--color-primary)]">
                    Xaridor eʼloni: qanday uy-joy kerakligini va byudjetingizni yozing. Rasm shart emas.
                  </p>
                )}
              </Section>

              <Section title="Asosiy maʼlumotlar">
                {isLand ? (
                  <Input
                    id="listing-land"
                    label="Yer maydoni, sotix"
                    inputMode="numeric"
                    wrapperClassName="sm:max-w-xs"
                    value={form.landArea}
                    onChange={(e) => set('landArea', digitsOnly(e.target.value).slice(0, 6))}
                    error={errors.landArea}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Input
                      id="listing-rooms"
                      label={roomsOptional ? 'Xonalar (ixt.)' : 'Xonalar'}
                      inputMode="numeric"
                      value={form.rooms}
                      onChange={(e) => set('rooms', digitsOnly(e.target.value).slice(0, 2))}
                      error={errors.rooms}
                    />
                    <Input
                      id="listing-area"
                      label={seeking ? 'Maydon, m² (ixt.)' : 'Maydon, m²'}
                      inputMode="numeric"
                      value={form.area}
                      onChange={(e) => set('area', digitsOnly(e.target.value).slice(0, 6))}
                      error={errors.area}
                    />
                    {isHouse ? (
                      <Input
                        id="listing-land"
                        label="Yer, sotix"
                        inputMode="numeric"
                        value={form.landArea}
                        onChange={(e) => set('landArea', digitsOnly(e.target.value).slice(0, 4))}
                        error={errors.landArea}
                      />
                    ) : (
                      <Input
                        id="listing-floor"
                        label="Qavat"
                        inputMode="numeric"
                        value={form.floor}
                        onChange={(e) => set('floor', digitsOnly(e.target.value).slice(0, 3))}
                        error={errors.floor}
                      />
                    )}
                    <Input
                      id="listing-total-floors"
                      label={isHouse ? 'Qavatlar soni' : 'Bino qavatlari'}
                      inputMode="numeric"
                      value={form.totalFloors}
                      onChange={(e) => set('totalFloors', digitsOnly(e.target.value).slice(0, 3))}
                      error={errors.totalFloors}
                    />
                  </div>
                )}
                <Textarea
                  id="listing-description"
                  label="Tavsif"
                  rows={4}
                  maxLength={2000}
                  placeholder="Taʼmir, jihozlar, atrof-muhit, hujjatlar haqida yozing"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  error={errors.description}
                />
                <div>
                  <p className="mb-1.5 text-sm font-medium text-[var(--color-secondary)]">Qulayliklar</p>
                  <div className="flex flex-wrap gap-2">
                    {LISTING_FEATURES.map((f) => {
                      const on = form.features.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleFeature(f)}
                          className={cn(
                            'inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-sm transition-colors',
                            on
                              ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 font-semibold text-[var(--color-brand-green)]'
                              : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-gray-300',
                          )}
                        >
                          {on && <Check className="h-3.5 w-3.5" />}
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Section>

              <Section title={seeking ? 'Byudjet' : 'Narx'}>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                  <Input
                    id="listing-price"
                    label={seeking ? 'Byudjet' : 'Narx'}
                    inputMode="numeric"
                    placeholder="0"
                    value={form.price ? groupDigits(Number(form.price)) : ''}
                    onChange={(e) => set('price', digitsOnly(e.target.value).slice(0, 12))}
                    error={errors.price}
                  />
                  <Select
                    id="listing-currency"
                    label="Valyuta"
                    value={form.currency}
                    onChange={(e) => set('currency', e.target.value as ListingFormData['currency'])}
                    options={[
                      { value: 'USD', label: '$ (USD)' },
                      { value: 'UZS', label: 'soʻm' },
                    ]}
                  />
                  {intent.rentPeriod && !seeking && (
                    <p className="pb-3 text-sm font-semibold text-[var(--color-muted)]">
                      / {intent.rentPeriod === 'kun' ? 'kuniga' : 'oyiga'}
                    </p>
                  )}
                </div>
              </Section>
            </div>

            {/* Right: photos, place, contact */}
            <div className="space-y-4">
              <Section title={`Rasmlar (${form.images.length}/${MAX_LISTING_IMAGES})`}>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-4">
                  {form.images.map((src, i) => (
                    <div
                      key={src.slice(-32) + i}
                      className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
                    >
                      <Image src={src} alt={`${i + 1}-rasm`} fill sizes="160px" className="object-cover" />
                      {i === 0 ? (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-[var(--color-brand-green)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Muqova
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeCover(i)}
                          aria-label={`${i + 1}-rasmni muqova qilish`}
                          className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:text-[var(--color-brand-green)]"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        aria-label={`${i + 1}-rasmni oʻchirish`}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {form.images.length < MAX_LISTING_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={isUploading}
                      className={cn(
                        'flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-sm font-semibold transition-colors',
                        errors.images
                          ? 'border-red-300 text-red-600'
                          : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]',
                      )}
                    >
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <ImagePlus className="h-6 w-6" />
                      )}
                      {isUploading ? 'Yuklanmoqda' : 'Rasm qoʻshish'}
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => addPhotos(e.target.files)}
                />
                <p
                  className={cn('text-[13px] font-medium', errors.images ? 'text-red-600' : 'text-gray-700')}
                >
                  {errors.images ?? 'Birinchi rasm muqova boʻladi. ★ bilan boshqasini muqova qiling.'}
                </p>
              </Section>

              <Section title="Joylashuv">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    id="listing-region"
                    label="Viloyat"
                    value={form.region}
                    onChange={(e) => set('region', e.target.value)}
                    error={errors.region}
                    options={[
                      { value: '', label: 'Tanlang' },
                      ...UZ_REGIONS.map((r) => ({ value: r, label: r })),
                    ]}
                  />
                  <Input
                    id="listing-district"
                    label="Tuman / shahar"
                    placeholder="Masalan: Yunusobod tumani"
                    value={form.district}
                    onChange={(e) => set('district', e.target.value)}
                    error={errors.district}
                  />
                </div>
              </Section>

              <Section title="Aloqa">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    id="listing-seller"
                    label="Ismingiz"
                    placeholder="Ismingizni kiriting"
                    autoComplete="name"
                    value={form.sellerName}
                    onChange={(e) => set('sellerName', e.target.value)}
                    error={errors.sellerName}
                  />
                  <Input
                    id="listing-phone"
                    label="Telefon"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value.replace(/[^\d+\s]/g, '').slice(0, 17))}
                    error={errors.phone}
                  />
                </div>
                <Segmented
                  label="Siz kimsiz"
                  value={form.sellerType}
                  options={{ mulkdor: 'Mulkdor', agentlik: 'Agentlik' }}
                  onChange={(v) => set('sellerType', v)}
                />
              </Section>

              <div className="hidden gap-3 lg:flex">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-[2]"
                  isLoading={isSubmitting}
                  disabled={isUploading}
                >
                  Eʼlonni joylash
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-2xl gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => router.back()}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-[2]"
              isLoading={isSubmitting}
              disabled={isUploading}
            >
              Eʼlonni joylash
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
