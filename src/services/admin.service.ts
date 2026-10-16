import type {
  AdminDashboardStats,
  AdminJobRow,
  AdminUserRow,
  Category,
  CategoryInput,
  CategoryUpdateInput,
  LocationRecord,
  Report,
  ReportStatus,
  JobStatus,
} from '@/types';
import { users as seedUsers } from '@/data/users';
import { categories as seedCategories } from '@/data/categories';
import { isBackendEnabled } from '@/lib/backend/config';
import { jobsService } from '@/services/jobs.service';
import { chatsService } from '@/services/chats.service';
import { reportsStore } from '@/services/reports.store';
import { locationsStore } from '@/services/locations.store';
import { profileStore } from '@/services/profile.store';
import { usersService } from '@/services/users.service';
import { firebaseProfilesRepository } from '@/lib/firebase/repositories/profiles.repository';
import { firebaseJobsRepository } from '@/lib/firebase/repositories/jobs.repository';
import { firebaseReportsRepository } from '@/lib/firebase/repositories/reports.repository';
import { firebaseCategoriesRepository } from '@/lib/firebase/repositories/categories.repository';
import { firebaseLocationsRepository } from '@/lib/firebase/repositories/locations.repository';
import { firebaseChatsRepository } from '@/lib/firebase/repositories/chats.repository';

function mergeUsers(): AdminUserRow[] {
  const byId = new Map<string, AdminUserRow>();
  for (const user of seedUsers) {
    byId.set(user.id, { ...user, blocked: user.blocked ?? false });
  }
  for (const stored of profileStore.listAll()) {
    byId.set(stored.id, {
      ...byId.get(stored.id),
      ...stored,
      blocked: stored.blocked ?? byId.get(stored.id)?.blocked ?? false,
    });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    if (isBackendEnabled()) {
      const [totalJobs, activeJobs, pendingPosts, totalUsers, pendingReports, totalChats] =
        await Promise.all([
          firebaseJobsRepository.countByStatus(),
          firebaseJobsRepository.countByStatus('active'),
          firebaseJobsRepository.countByStatus('pending'),
          firebaseProfilesRepository.count(),
          firebaseReportsRepository.countPending(),
          firebaseChatsRepository.count(),
        ]);
      return {
        totalJobs,
        activeJobs,
        totalUsers,
        totalChats,
        pendingPosts,
        pendingReports,
      };
    }

    const jobs = await jobsService.getAllRawAsync();
    const reports = reportsStore.list();
    const chats = await chatsService.listChatPreviews();

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === 'active').length,
      totalUsers: mergeUsers().length,
      totalChats: chats.length,
      pendingPosts: jobs.filter((j) => j.status === 'pending').length,
      pendingReports: reports.filter((r) => r.status === 'pending').length,
    };
  },

  async listAllJobs(): Promise<AdminJobRow[]> {
    const jobs = await jobsService.getAllRawAsync();
    return jobs
      .map((job) => ({
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        posterId: job.posterId,
        posterName: usersService.getById(job.posterId)?.name ?? 'Unknown',
        status: job.status,
        createdAt: job.createdAt,
        categoryId: job.categoryId,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async approveJob(id: string): Promise<void> {
    await jobsService.updateJobStatus(id, 'active');
  },

  async rejectJob(id: string): Promise<void> {
    await jobsService.updateJobStatus(id, 'closed');
  },

  async deleteJob(id: string): Promise<void> {
    await jobsService.deleteJob(id);
  },

  async setJobStatus(id: string, status: JobStatus): Promise<void> {
    await jobsService.updateJobStatus(id, status);
  },

  async listUsers(): Promise<AdminUserRow[]> {
    if (isBackendEnabled()) {
      const users = await firebaseProfilesRepository.list();
      return users.map((u) => ({ ...u, blocked: u.blocked ?? false }));
    }
    return mergeUsers();
  },

  async setUserBlocked(userId: string, blocked: boolean): Promise<void> {
    if (isBackendEnabled()) {
      await firebaseProfilesRepository.setBlocked(userId, blocked);
      return;
    }
    const seed = seedUsers.find((u) => u.id === userId);
    const existing = profileStore.getById(userId) ?? seed;
    if (!existing) throw new Error('User not found');
    profileStore.save({ ...existing, blocked });
  },

  async listReports(): Promise<Report[]> {
    if (isBackendEnabled()) return firebaseReportsRepository.list();
    return reportsStore.list();
  },

  async updateReportStatus(id: string, status: ReportStatus): Promise<void> {
    if (isBackendEnabled()) {
      await firebaseReportsRepository.updateStatus(id, status);
      return;
    }
    const updated = reportsStore.updateStatus(id, status);
    if (!updated) throw new Error('Report not found');
  },

  async listCategories(): Promise<Category[]> {
    if (isBackendEnabled()) return firebaseCategoriesRepository.list();
    return seedCategories.map((cat) => ({
      ...cat,
      jobCount: 0,
    }));
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    const id = `cat-${Date.now()}`;
    if (isBackendEnabled()) {
      return firebaseCategoriesRepository.create({
        id,
        name: input.name.trim(),
        slug: input.slug.trim(),
        icon: input.icon.trim(),
      });
    }
    const category: Category = {
      id,
      name: input.name.trim(),
      slug: input.slug.trim(),
      icon: input.icon.trim(),
      jobCount: 0,
    };
    seedCategories.push(category);
    return category;
  },

  async updateCategory(id: string, input: CategoryUpdateInput): Promise<Category> {
    if (isBackendEnabled()) return firebaseCategoriesRepository.update(id, input);
    const index = seedCategories.findIndex((c) => c.id === id);
    if (index < 0) throw new Error('Category not found');
    seedCategories[index] = { ...seedCategories[index], ...input };
    return seedCategories[index];
  },

  async deleteCategory(id: string): Promise<void> {
    if (isBackendEnabled()) {
      await firebaseCategoriesRepository.remove(id);
      return;
    }
    const index = seedCategories.findIndex((c) => c.id === id);
    if (index >= 0) seedCategories.splice(index, 1);
  },

  async listLocations(): Promise<LocationRecord[]> {
    if (isBackendEnabled()) return firebaseLocationsRepository.list();
    return locationsStore.list();
  },

  async createLocation(label: string): Promise<LocationRecord> {
    if (isBackendEnabled()) return firebaseLocationsRepository.create(label);
    return locationsStore.create(label);
  },

  async updateLocation(
    id: string,
    patch: Partial<Pick<LocationRecord, 'label' | 'isActive'>>
  ): Promise<LocationRecord> {
    if (isBackendEnabled()) return firebaseLocationsRepository.update(id, patch);
    const updated = locationsStore.update(id, patch);
    if (!updated) throw new Error('Location not found');
    return updated;
  },

  async deleteLocation(id: string): Promise<void> {
    if (isBackendEnabled()) {
      await firebaseLocationsRepository.remove(id);
      return;
    }
    if (!locationsStore.remove(id)) throw new Error('Location not found');
  },
};
