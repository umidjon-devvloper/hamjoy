'use client';

import { useState } from 'react';
import { LocateFixed, Loader2, MapPinned, SearchX } from 'lucide-react';
import { JobsTileMap } from '@/components/map/JobsTileMap';
import { JobGridCard, JobGridSkeleton } from '@/components/jobs/JobGridCard';
import { useJobs, useNearbyJobs } from '@/hooks/useJobs';
import { useGeolocation } from '@/hooks/useGeolocation';
import { DEFAULT_MAP_CENTER } from '@/lib/map/config';
import { cn } from '@/lib/utils';
import { JobsViewToggle } from './JobsViewToggle';

const RADII = [5, 15, 30, 50];

/** Ish mode, map view (/home/ish/xarita): jobs on a map, optionally around the user's location. */
export function JobsMapView() {
  const { coords, status, error, request } = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(15);

  const allJobs = useJobs({});
  const nearby = useNearbyJobs(coords, radiusKm);

  const usingLocation = Boolean(coords);
  const center = coords ?? DEFAULT_MAP_CENTER;
  const jobs = usingLocation ? nearby.data : allJobs.data;
  const loading = usingLocation ? nearby.isLoading : allJobs.isLoading;

  const subtitle = usingLocation
    ? `${jobs.length} ta ish ${radiusKm} km radiusda`
    : `${jobs.length} ta faol ish — xaritada ko‘ring`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-secondary)] sm:text-3xl">
            Xaritadagi ishlar
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-600">{subtitle}</p>
        </div>
        <JobsViewToggle />
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={request}
          disabled={status === 'loading'}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
            usingLocation
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15'
          )}
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          Yaqinimdagi ishlar
        </button>

        {usingLocation &&
          RADII.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadiusKm(r)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                radiusKm === r
                  ? 'bg-[var(--color-secondary)] text-white'
                  : 'bg-gray-100 text-[var(--color-muted)] hover:bg-gray-200'
              )}
            >
              {r} km
            </button>
          ))}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <JobsTileMap
        jobs={jobs}
        center={center}
        radiusKm={usingLocation ? radiusKm : 14}
        userLocation={coords}
        className="mb-6 h-[340px] sm:h-[440px]"
      />

      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-secondary)]">
        <MapPinned className="h-4 w-4 text-[var(--color-primary)]" />
        {usingLocation ? 'Eng yaqin ishlar' : 'Barcha faol ishlar'}
      </div>

      {loading ? (
        <JobGridSkeleton count={4} />
      ) : jobs.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-8 text-center">
          <SearchX className="h-8 w-8 text-[var(--color-muted)]" />
          <p className="text-sm text-[var(--color-muted)]">
            Bu radiusda ish topilmadi. Radiusni kattalashtiring yoki keyinroq qayta urinib ko‘ring.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {jobs.map((job) => (
            <JobGridCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
