'use client';

import { useState } from 'react';
import { Loader2, MapPin, X } from 'lucide-react';

export interface NearbyState {
  lat: number;
  lng: number;
  radiusKm: number;
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50];

/**
 * "Yaqinimdagi" filter — asks the browser for geolocation and lets the user
 * pick a radius. Reports changes up via onChange; stays silent until the user
 * opts in (no automatic geo prompt on page load).
 */
export function NearbyFilter({
  value,
  onChange,
}: {
  value: NearbyState | null;
  onChange: (v: NearbyState | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const enable = () => {
    if (!('geolocation' in navigator)) {
      setErr('Brauzer joylashuvni qoʻllab-quvvatlamaydi');
      return;
    }
    setBusy(true);
    setErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, radiusKm: 5 });
        setBusy(false);
      },
      (e) => {
        setErr(e.code === 1 ? 'Joylashuvga ruxsat berilmagan' : 'Joylashuvni aniqlab boʻlmadi');
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const clear = () => {
    onChange(null);
    setErr(null);
  };

  if (!value) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--color-secondary)] hover:border-[var(--color-brand-green)]/40 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-[var(--color-brand-green)]" />}
          Yaqinimdagi
        </button>
        {err ? <span className="text-xs text-[#B42318]">{err}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-brand-green)]/40 bg-[var(--color-primary-light)] px-3 py-2">
      <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand-green)]" />
      <span className="text-sm font-semibold text-[var(--color-brand-green)]">Yaqinimdagi</span>
      <div className="flex flex-wrap gap-1">
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange({ ...value, radiusKm: r })}
            className={
              r === value.radiusKm
                ? 'rounded-full bg-[var(--color-brand-green)] px-2.5 py-0.5 text-xs font-bold text-white'
                : 'rounded-full border border-[var(--color-border)] bg-white px-2.5 py-0.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-secondary)]'
            }
          >
            {r} km
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="Yaqinimdagi filterni oʻchirish"
        onClick={clear}
        className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
