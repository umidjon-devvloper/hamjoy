import type { LocationRecord } from '@/types';
import { LOCATIONS_STORAGE_KEY } from '@/data/constants';

const DEFAULT_LOCATIONS: LocationRecord[] = [
  { id: 'loc-remote', label: 'Remote', slug: 'remote', isActive: true },
  { id: 'loc-sf', label: 'San Francisco, CA', slug: 'san-francisco', isActive: true },
  { id: 'loc-ny', label: 'New York, NY', slug: 'new-york', isActive: true },
  { id: 'loc-london', label: 'London, UK', slug: 'london', isActive: true },
  { id: 'loc-berlin', label: 'Berlin, Germany', slug: 'berlin', isActive: true },
];

function readLocations(): LocationRecord[] {
  if (typeof window === 'undefined') return DEFAULT_LOCATIONS;
  try {
    const raw = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCATIONS;
    return JSON.parse(raw) as LocationRecord[];
  } catch {
    return DEFAULT_LOCATIONS;
  }
}

function writeLocations(locations: LocationRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const locationsStore = {
  list(): LocationRecord[] {
    return readLocations();
  },

  create(label: string): LocationRecord {
    const locations = readLocations();
    const record: LocationRecord = {
      id: `loc-${Date.now()}`,
      label: label.trim(),
      slug: slugify(label),
      isActive: true,
    };
    locations.push(record);
    writeLocations(locations);
    return record;
  },

  update(id: string, patch: Partial<Pick<LocationRecord, 'label' | 'isActive'>>): LocationRecord | undefined {
    const locations = readLocations();
    const index = locations.findIndex((l) => l.id === id);
    if (index < 0) return undefined;
    const next = {
      ...locations[index],
      ...patch,
      slug: patch.label ? slugify(patch.label) : locations[index].slug,
    };
    locations[index] = next;
    writeLocations(locations);
    return next;
  },

  remove(id: string): boolean {
    const locations = readLocations().filter((l) => l.id !== id);
    if (locations.length === readLocations().length) return false;
    writeLocations(locations);
    return true;
  },
};
