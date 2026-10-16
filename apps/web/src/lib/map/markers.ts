import type { Job } from '@/types';
import type { MapMarkerData } from '@/types';
import { formatSalary } from '@/lib/mappers/job.mapper';
import {
  coordsToPercent,
  fallbackPositionForId,
  remoteMarkerPosition,
} from './coordinates';

export function jobToMapMarker(job: Job, options?: { active?: boolean; index?: number }): MapMarkerData {
  const { lat, lng, isRemote } = job.location;
  let position: MapMarkerData['position'];

  if (lat !== undefined && lng !== undefined) {
    position = coordsToPercent(lat, lng);
  } else if (isRemote) {
    position = remoteMarkerPosition(options?.index ?? 0);
  } else {
    position = fallbackPositionForId(job.id, options?.index ?? 0);
  }

  return {
    id: `pin-${job.id}`,
    jobId: job.id,
    title: job.title,
    salary: formatSalary(job),
    location: job.location.label,
    company: job.companyName,
    isRemote,
    coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    position,
    active: options?.active,
  };
}

export function jobsToMapMarkers(
  jobs: Job[],
  options?: { selectedJobId?: string | null }
): MapMarkerData[] {
  let remoteIndex = 0;

  return jobs.map((job, index) => {
    const markerIndex = job.location.isRemote ? remoteIndex++ : index;
    return jobToMapMarker(job, {
      index: markerIndex,
      active: options?.selectedJobId === job.id,
    });
  });
}
