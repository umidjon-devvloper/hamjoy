import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { getActiveSectionId, getPlatformMode, HUB_SECTIONS, PLATFORM_SECTIONS } from '@/lib/navigation/platform';
import { MEGA_MENUS } from '@/lib/navigation/mega-menu';

/** Every app route as a regex, built from src/app/**\/page.tsx (route groups dropped). */
function appRoutePatterns(): RegExp[] {
  const appDir = path.resolve(__dirname, '../../app');
  const patterns: RegExp[] = [];
  const walk = (dir: string, segments: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
        walk(path.join(dir, entry.name), isGroup ? segments : [...segments, entry.name]);
      } else if (entry.name === 'page.tsx') {
        const source = segments
          .map((s) => (s.startsWith('[') ? '[^/]+' : s.replace(/[.*+?^${}()|\\]/g, '\\$&')))
          .join('/');
        patterns.push(new RegExp(`^/${source}$`));
      }
    }
  };
  walk(appDir, []);
  return patterns;
}

const routes = appRoutePatterns();
const resolves = (href: string) => routes.some((r) => r.test(href.split('?')[0]));

describe('platform sections', () => {
  it('has exactly Uy-joy, Ish and Hisobim, in that order', () => {
    expect(PLATFORM_SECTIONS.map((s) => s.title)).toEqual(['Uy-joy', 'Ish', 'Hisobim']);
  });

  it('keeps the requested sub-sections', () => {
    const labels = (id: string) =>
      PLATFORM_SECTIONS.find((s) => s.id === id)?.links.map((l) => l.label);
    expect(labels('uy-joy')).toEqual(['Sotuv', 'Ijara', 'Sotib olish']);
    expect(labels('ish')).toEqual(['Ish qidirish', 'Vakansiya joylash', 'CV joylash']);
    expect(labels('account')).toEqual([
      'Profil',
      'Eʼlonlarim',
      'Saqlanganlar',
      'Chat',
      'Xabarlar va bildirishnomalar',
    ]);
  });

  it('shows only Uy-joy and Ish cards on the home page', () => {
    expect(HUB_SECTIONS.map((s) => s.title)).toEqual(['Uy-joy', 'Ish']);
  });

  it('never repeats a destination inside a section', () => {
    for (const section of PLATFORM_SECTIONS) {
      const hrefs = section.links.flatMap((l) => (l.href ? [l.href] : []));
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it('links every section, sub-section and filter to an existing page', () => {
    const hrefs = [
      ...PLATFORM_SECTIONS.flatMap((s) => [s.href, ...s.links.map((l) => l.href)]),
      ...MEGA_MENUS.flatMap((m) => [
          m.href,
          ...m.columns.flat().flatMap((g) => [g.href, ...g.items.map((i) => i.href)]),
        ]),
    ].filter((h): h is string => Boolean(h));

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((h) => !resolves(h))).toEqual([]);
  });

  it('keeps Sotuv and Ijara filters apart', () => {
    const sale = MEGA_MENUS.find((m) => m.id === 'sotuv')!;
    const rent = MEGA_MENUS.find((m) => m.id === 'ijara')!;
    const items = (m: typeof sale) => m.columns.flat().flatMap((g) => g.items.map((i) => i.href));
    expect(items(sale).every((h) => !h.startsWith('/uy-joy/ijara'))).toBe(true);
    expect(items(rent).every((h) => h.startsWith('/uy-joy/ijara'))).toBe(true);
  });
});

describe('getActiveSectionId', () => {
  it('maps pages to their section', () => {
    expect(getActiveSectionId('/uy-joy/sotuv')).toBe('uy-joy');
    expect(getActiveSectionId('/home/ish')).toBe('ish');
    expect(getActiveSectionId('/home/ish/xarita')).toBe('ish');
    expect(getActiveSectionId('/search')).toBe('ish');
    expect(getActiveSectionId('/job/42')).toBe('ish');
    expect(getActiveSectionId('/chat/abc')).toBe('account');
    expect(getActiveSectionId('/notifications')).toBe('account');
  });

  it('highlights nothing on the hub or unknown pages', () => {
    expect(getActiveSectionId('/home')).toBeNull();
    expect(getActiveSectionId('/legal/terms')).toBeNull();
    expect(getActiveSectionId(null)).toBeNull();
  });

  it('does not match on a shared prefix only', () => {
    expect(getActiveSectionId('/ishonch')).toBeNull();
  });
});

describe('getPlatformMode', () => {
  it('switches to Ish mode only on the jobs views of home', () => {
    expect(getPlatformMode('/home/ish')).toBe('ish');
    expect(getPlatformMode('/home/ish/xarita')).toBe('ish');
    expect(getPlatformMode('/home')).toBe('uy-joy');
    expect(getPlatformMode('/uy-joy/sotuv')).toBe('uy-joy');
    expect(getPlatformMode('/home/ishonch')).toBe('uy-joy');
  });
});
