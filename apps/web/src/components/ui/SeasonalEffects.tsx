'use client';

import { useEffect, useState } from 'react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function currentSeason(now = new Date()): Season {
  const m = now.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

const CONFIG: Record<Season, { count: number; glyphs: string[]; name: string }> = {
  spring: { count: 18, glyphs: ['🌸', '🌼', '🌺'], name: 'bahor' },
  summer: { count: 0, glyphs: [], name: 'yoz' },
  autumn: { count: 22, glyphs: ['🍂', '🍁', '🍃'], name: 'kuz' },
  winter: { count: 32, glyphs: ['❄', '❆', '✻'], name: 'qish' },
};

/**
 * Fon mavsumiy effekti — kuzda yaproqlar, qishda qor, bahorda gullar
 * tushadi. Yoz uchun hech nima render qilmaymiz (ortiqcha shovqin bo'lmasin).
 * Prefers-reduced-motion yoqilgan bo'lsa chiqarmaymiz.
 */
export function SeasonalEffects() {
  const [season, setSeason] = useState<Season | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setSeason(currentSeason());
  }, []);

  if (!season) return null;
  const cfg = CONFIG[season];
  if (cfg.count === 0) return null;

  const items = Array.from({ length: cfg.count }).map((_, i) => {
    const left = (i * 97) % 100;
    const delay = (i * 1.37) % 12;
    const duration = 10 + (i * 2.3) % 14;
    const drift = (i % 2 === 0 ? 1 : -1) * ((i * 7) % 40);
    const size = 14 + (i * 3) % 16;
    const opacity = 0.55 + ((i * 5) % 30) / 100;
    const glyph = cfg.glyphs[i % cfg.glyphs.length];
    return (
      <span
        key={i}
        aria-hidden
        className="seasonal-piece"
        style={{
          left: `${left}%`,
          animationDelay: `-${delay}s`,
          animationDuration: `${duration}s`,
          fontSize: `${size}px`,
          opacity,
          ['--drift' as string]: `${drift}px`,
        }}
      >
        {glyph}
      </span>
    );
  });

  return (
    <div
      aria-label={`Mavsumiy effekt — ${cfg.name}`}
      className="seasonal-overlay pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {items}
    </div>
  );
}
