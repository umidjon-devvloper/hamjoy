import { getApiBaseUrl, isRestBackendEnabled } from '@/lib/api/config';
import { joymeeTokens } from '@/lib/joymee/client';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' } : { 'content-type': 'application/json' };
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API URL not configured');
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { ...(await authHeaders()), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  openReports: number;
  totalReviews: number;
}

export interface AdminUserDto {
  id: string;
  phone: string | null;
  email: string | null;
  role: string;
  status: string;
  trusted: boolean;
  createdAt: string;
  name: string;
  avatarUrl: string | null;
}

export interface AdminListingDto {
  id: string;
  userId: string;
  type: string;
  vertical: string;
  title: string;
  status: string;
  priceAmount: string | null;
  priceCurrency: string | null;
  locationId: number;
  viewsCount: number;
  createdAt: string;
  publishedAt: string | null;
  ownerName: string;
  image: string | null;
}

export const adminApi = {
  isAvailable: isRestBackendEnabled,

  getStats: () => adminFetch<AdminStats>('/admin/stats'),

  listUsers: (status?: string) =>
    adminFetch<AdminUserDto[]>(`/admin/users${status ? `?status=${status}` : ''}`),

  setUserStatus: (userId: string, status: 'active' | 'blocked') =>
    adminFetch<{ id: string; status: string }>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  listListings: (status?: string) =>
    adminFetch<AdminListingDto[]>(`/admin/listings${status ? `?status=${status}` : ''}`),

  moderateListing: (id: string, decision: 'approve' | 'reject' | 'block') =>
    adminFetch(`/listings/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),

  listReports: (status?: string) =>
    adminFetch(`/admin/reports${status ? `?status=${status}` : ''}`),

  resolveReport: (id: string) =>
    adminFetch(`/admin/reports/${id}/resolve`, { method: 'POST' }),

  dismissReport: (id: string) =>
    adminFetch(`/admin/reports/${id}/dismiss`, { method: 'POST' }),

  listReviews: () => adminFetch('/admin/reviews'),

  getReviewStats: () =>
    adminFetch<{ total: number; avg: number; last7: number }>('/admin/reviews/stats'),

  hideReview: (id: string) =>
    adminFetch(`/admin/reviews/${id}/hide`, { method: 'POST' }),

  unhideReview: (id: string) =>
    adminFetch(`/admin/reviews/${id}/unhide`, { method: 'POST' }),

  deleteReview: (id: string) =>
    adminFetch(`/admin/reviews/${id}`, { method: 'DELETE' }),

  listVerifications: () => adminFetch('/admin/verifications'),

  approveVerification: (id: string) =>
    adminFetch(`/admin/verifications/${id}/approve`, { method: 'POST' }),

  rejectVerification: (id: string, note?: string) =>
    adminFetch(`/admin/verifications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  setUserTrusted: (userId: string, trusted: boolean) =>
    adminFetch(`/users/${userId}/trust`, {
      method: 'PATCH',
      body: JSON.stringify({ trusted }),
    }),

  listCategories: () =>
    adminFetch<Array<{ id: number; slug: string; nameUz: string; nameRu: string; icon: string | null; parentId: number | null }>>('/admin/categories'),

  createCategory: (data: { slug: string; nameUz: string; nameRu: string; icon?: string; parentId?: number }) =>
    adminFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),

  updateCategory: (id: number, data: { slug?: string; nameUz?: string; nameRu?: string; icon?: string }) =>
    adminFetch(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteCategory: (id: number) =>
    adminFetch(`/admin/categories/${id}`, { method: 'DELETE' }),

  listLocations: () =>
    adminFetch<Array<{ id: number; nameUz: string; nameRu: string; parentId: number | null }>>('/admin/locations'),

  createLocation: (data: { nameUz: string; nameRu: string; parentId?: number }) =>
    adminFetch('/admin/locations', { method: 'POST', body: JSON.stringify(data) }),

  updateLocation: (id: number, data: { nameUz?: string; nameRu?: string }) =>
    adminFetch(`/admin/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteLocation: (id: number) =>
    adminFetch(`/admin/locations/${id}`, { method: 'DELETE' }),
};
