import type { Job } from '@/types';
import type { MapCoordinates, MapMarkerData } from '@/types';
import { coordsToPercent } from '@/lib/map/coordinates';
import { jobsService } from '@/services/jobs.service';
import { jobsToMapMarkers, jobToMapMarker } from '@/lib/map/markers';

export const mapService = {
  getMarkersForActiveJobs(selectedJobId?: string | null): MapMarkerData[] {
    const jobs = jobsService.getAllRaw().filter((job) => job.status === 'active');
    return jobsToMapMarkers(jobs, { selectedJobId });
  },

  getMarkersForJobIds(jobIds: string[], selectedJobId?: string | null): MapMarkerData[] {
    const jobs = jobIds
      .map((id) => jobsService.getById(id))
      .filter((job): job is Job => Boolean(job));
    return jobsToMapMarkers(jobs, { selectedJobId });
  },

  getMarkerForJob(jobId: string): MapMarkerData | undefined {
    const job = jobsService.getById(jobId);
    if (!job) return undefined;
    return jobToMapMarker(job, { active: true });
  },

  getActiveJobCount(): number {
    return jobsService.getAllRaw().filter((job) => job.status === 'active').length;
  },

  /** Jobs with physical coordinates suitable for a detail map preview */
  canShowLocationMap(jobId: string): boolean {
    const job = jobsService.getById(jobId);
    if (!job) return false;
    if (job.location.isRemote) return false;
    return (
      job.location.lat !== undefined ||
      job.location.lng !== undefined ||
      Boolean(job.location.city)
    );
  },

  getPickerMarker(coords: MapCoordinates): MapMarkerData {
    return {
      id: 'picker-pin',
      jobId: 'picker',
      title: 'Selected location',
      salary: '',
      location: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      company: '',
      isRemote: false,
      coordinates: coords,
      position: coordsToPercent(coords.lat, coords.lng),
      active: true,
    };
  },
};
