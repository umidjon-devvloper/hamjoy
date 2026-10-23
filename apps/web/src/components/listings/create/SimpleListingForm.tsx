'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { appToast } from '@/lib/feedback/toast';
import { getJoymeeClient } from '@/lib/joymee/client';
import { ROUTES } from '@/lib/navigation/routes';

type Vertical = 'avto' | 'bepul';
type Currency = 'USD' | 'UZS';

interface Config {
  vertical: Vertical;
  typeOptions: { value: 'sale' | 'car_sale' | 'car_salon' | 'free_give'; label: string }[];
  defaultType: 'car_sale' | 'free_give';
  defaultCategoryId: number;
  pageTitle: string;
  pageSubtitle: string;
  priceLabel: string | null; // null = free
}

const CONFIG: Record<Vertical, Config> = {
  avto: {
    vertical: 'avto',
    typeOptions: [
      { value: 'car_sale', label: 'Avto sotuv' },
      { value: 'car_salon', label: 'Avtosalon' },
    ],
    defaultType: 'car_sale',
    defaultCategoryId: 30,
    pageTitle: 'Avto eʼlon',
    pageSubtitle: 'Avtomobil sotuvi yoki avtosalon eʼloni',
    priceLabel: 'Narxi',
  },
  bepul: {
    vertical: 'bepul',
    typeOptions: [{ value: 'free_give', label: 'Bepul beraman' }],
    defaultType: 'free_give',
    defaultCategoryId: 4,
    pageTitle: 'Bepul eʼlon',
    pageSubtitle: 'Hadya qilmoqchi bo\'lgan narsangiz',
    priceLabel: null,
  },
};

// Shared seed locations — keep in sync with /post on mobile and the seed file.
const LOCATIONS = [
  { id: 11, name: 'Yunusobod (Toshkent)' },
  { id: 12, name: 'Chilonzor (Toshkent)' },
  { id: 13, name: 'Mirzo Ulugʻbek (Toshkent)' },
  { id: 14, name: 'Shayxontohur (Toshkent)' },
  { id: 15, name: 'Sergeli (Toshkent)' },
  { id: 16, name: 'Yakkasaroy (Toshkent)' },
  { id: 2, name: 'Samarqand' },
  { id: 3, name: 'Buxoro' },
];

export function SimpleListingForm({
  vertical,
  editId,
}: {
  vertical: Vertical;
  editId?: string;
}) {
  const router = useRouter();
  const cfg = CONFIG[vertical];

  const [listingType, setListingType] = useState<Config['typeOptions'][number]['value']>(
    cfg.defaultType,
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>(vertical === 'avto' ? 'USD' : 'UZS');
  const [locationId, setLocationId] = useState<number>(LOCATIONS[0]!.id);
  const [loadingEdit, setLoadingEdit] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    void (async () => {
      try {
        const l = await getJoymeeClient().listings.get(editId);
        if (cancelled) return;
        setTitle(l.title ?? '');
        setDescription(l.description ?? '');
        if (l.price) {
          setPrice(String(l.price.amount));
          setCurrency(l.price.currency === 'UZS' ? 'UZS' : 'USD');
        }
        if (l.locationId) setLocationId(l.locationId);
        if (cfg.typeOptions.some((o) => o.value === l.type)) {
          setListingType(l.type as Config['typeOptions'][number]['value']);
        }
      } catch (err) {
        appToast.error(err, "Eʼlonni yuklab bo'lmadi");
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId, cfg.typeOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (t.length < 10) {
      appToast.error(null, 'Sarlavha kamida 10 belgi bo\'lsin');
      return;
    }
    const d = description.trim();
    if (d.length < 30) {
      appToast.error(null, 'Tavsif kamida 30 belgi bo\'lsin');
      return;
    }
    setSubmitting(true);
    try {
      const amount = Number(price.replace(/\D/g, ''));
      const body = {
        type: listingType,
        categoryId: cfg.defaultCategoryId,
        locationId,
        title: t,
        description: d,
        price: cfg.priceLabel && amount > 0 ? { amount, currency, negotiable: false } : null,
        attrs: {},
      };
      let listingId: string;
      if (editId) {
        const updated = await getJoymeeClient().listings.update(editId, body as never);
        listingId = updated.id;
        appToast.success("O'zgarishlar saqlandi");
      } else {
        const created = await getJoymeeClient().listings.create(body as never);
        try {
          await getJoymeeClient().listings.publish(created.id);
        } catch {
          /* stays a draft until moderation */
        }
        listingId = created.id;
        appToast.success('Eʼlon joylandi');
      }
      router.push(ROUTES.listing(listingId));
    } catch (err) {
      appToast.error(err, "Saqlab bo'lmadi");
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand-green)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[var(--color-brand-green)] to-[#2E8B57] px-4 py-3.5 text-white shadow-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Orqaga"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black sm:text-2xl">
              {editId ? "Eʼlonni tahrirlash" : cfg.pageTitle}
            </h1>
            <p className="text-sm font-medium text-white/85">
              {editId ? "O'zgarishlarni saqlang" : cfg.pageSubtitle}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={submit} noValidate className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-5 sm:px-6">
        {cfg.typeOptions.length > 1 ? (
          <section className="card rounded-2xl p-4">
            <label className="mb-2 block text-sm font-medium text-[var(--color-secondary)]">
              Turi
            </label>
            <Select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as typeof listingType)}
              options={cfg.typeOptions.map((o) => ({ value: o.value, label: o.label }))}
            />
          </section>
        ) : null}

        <section className="card rounded-2xl p-4">
          <label className="mb-2 block text-sm font-medium text-[var(--color-secondary)]">
            Sarlavha
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={vertical === 'avto' ? 'Chevrolet Cobalt 2022, oq rang' : 'Bepul kiyim-kechak, 3-5 yosh'}
            maxLength={120}
            required
          />
        </section>

        {cfg.priceLabel ? (
          <section className="card rounded-2xl p-4">
            <label className="mb-2 block text-sm font-medium text-[var(--color-secondary)]">
              {cfg.priceLabel}
            </label>
            <div className="flex gap-2">
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                placeholder="0"
                className="flex-1"
              />
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-28"
                options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'UZS', label: 'UZS' },
                ]}
              />
            </div>
          </section>
        ) : null}

        <section className="card rounded-2xl p-4">
          <label className="mb-2 block text-sm font-medium text-[var(--color-secondary)]">
            Hudud
          </label>
          <Select
            value={String(locationId)}
            onChange={(e) => setLocationId(Number(e.target.value))}
            options={LOCATIONS.map((l) => ({ value: String(l.id), label: l.name }))}
          />
        </section>

        <section className="card rounded-2xl p-4">
          <label className="mb-2 block text-sm font-medium text-[var(--color-secondary)]">
            Tavsif
          </label>
          <Textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              vertical === 'avto'
                ? 'Model, yili, bosib o\'tgan masofa, holat, hujjatlar, qoʻshimcha jihozlar…'
                : 'Nima berasiz, hajmi, qanday holatda, qayerdan olib ketish mumkin…'
            }
            maxLength={2000}
            required
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">{description.length} / 2000</p>
        </section>

        <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-[var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
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
            isLoading={submitting}
          >
            {editId ? "O'zgarishlarni saqlash" : 'Eʼlonni joylash'}
          </Button>
        </div>
      </form>
    </div>
  );
}
