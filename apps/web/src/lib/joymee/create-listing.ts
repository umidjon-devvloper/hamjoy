import type { CreateJobFormData, Job } from '@/types';
import { getJoymeeClient } from './client';
import { parseSalary } from '@/lib/validations/create-job.validation';

const DEFAULT_LOCATION_ID = 1; // Toshkent sh. (seed)

/**
 * Map the create-job form into a Joymee /listings POST, publish it,
 * then return the Job shape the UI already renders.
 */
export async function createListingFromForm(data: CreateJobFormData): Promise<Job> {
  const client = getJoymeeClient();
  const amount = parseSalary(data.salaryMin) ?? parseSalary(data.salaryMax) ?? 0;

  const geo =
    data.mapLat != null && data.mapLng != null
      ? { lat: data.mapLat, lng: data.mapLng }
      : null;

  const created = await client.listings.create({
    type: 'job',
    categoryId: Number(data.categoryId) || 2, // Ish as fallback
    locationId: DEFAULT_LOCATION_ID,
    title: data.title.trim(),
    description: data.description.trim(),
    price: amount > 0 ? { amount, currency: 'UZS', negotiable: false } : null,
    geo,
  } as never);

  // Submit for moderation.
  await client.listings.publish(created.id);

  const now = new Date().toISOString();
  return {
    id: created.id,
    title: created.title,
    companyId: created.userId,
    companyName: 'Joymee foydalanuvchi',
    companyLogo: '',
    categoryId: String(created.categoryId),
    posterId: created.userId,
    description: created.description,
    requirements: [],
    status: 'pending',
    workType: 'onsite',
    scheduleType: 'full-time',
    schedulePattern: 'standard',
    location: {
      label: data.cityDistrict || '',
      isRemote: data.workType === 'remote',
      lat: geo?.lat,
      lng: geo?.lng,
    },
    salaryMin: amount,
    salaryMax: amount,
    salaryCurrency: 'UZS',
    skills: [],
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
    contactPhone: data.phone || undefined,
    address: data.address || undefined,
    district: data.cityDistrict || undefined,
  };
}
