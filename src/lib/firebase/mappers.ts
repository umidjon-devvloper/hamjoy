import type { Job, Location } from '@/types';
import type { User, NotificationSettings, ProfileRole, AppLanguage } from '@/types';
import type { Message, Chat } from '@/types';
import type { Category } from '@/types';
import type { JobRow, ProfileRow, MessageRow, ChatRow, CategoryRow, Json } from './document.types';
import type { ScheduleFilter } from '@/types';
import type { WorkType, ScheduleType, JobStatus } from '@/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types';

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function asLocation(value: unknown): Location {
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    return {
      label: String(o.label ?? 'Unknown'),
      city: o.city ? String(o.city) : undefined,
      country: o.country ? String(o.country) : undefined,
      address: o.address ? String(o.address) : undefined,
      lat: typeof o.lat === 'number' ? o.lat : undefined,
      lng: typeof o.lng === 'number' ? o.lng : undefined,
      isRemote: Boolean(o.isRemote),
    };
  }
  return { label: 'Unknown', isRemote: false };
}

function asNotifications(value: unknown): NotificationSettings {
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    return {
      emailAlerts: o.emailAlerts !== false,
      pushAlerts: o.pushAlerts !== false,
      jobMatches: o.jobMatches !== false,
      chatMessages: o.chatMessages !== false,
      marketing: Boolean(o.marketing),
    };
  }
  return { ...DEFAULT_NOTIFICATION_SETTINGS };
}

export function mapJobRow(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    companyId: row.company_id,
    companyName: row.company_name,
    companyLogo: row.company_logo ?? '',
    categoryId: row.category_id,
    posterId: row.poster_id,
    description: row.description,
    requirements: asStringArray(row.requirements),
    responsibilities: asStringArray(row.responsibilities),
    status: row.status as JobStatus,
    workType: row.work_type as WorkType,
    scheduleType: row.schedule_type as ScheduleType,
    schedulePattern: row.schedule_pattern as ScheduleFilter,
    location: asLocation(row.location),
    salaryMin: Number(row.salary_min),
    salaryMax: Number(row.salary_max),
    salaryCurrency: row.salary_currency,
    skills: asStringArray(row.skills),
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contactPhone: row.contact_phone ?? undefined,
    address: row.address ?? undefined,
    district: row.district ?? undefined,
  };
}

export function mapJobToRow(job: Job): JobRow {
  return {
    id: job.id,
    title: job.title,
    company_id: job.companyId,
    company_name: job.companyName,
    company_logo: job.companyLogo,
    category_id: job.categoryId,
    poster_id: job.posterId,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities ?? [],
    status: job.status,
    work_type: job.workType,
    schedule_type: job.scheduleType,
    schedule_pattern: job.schedulePattern,
    location: job.location as unknown as JobRow['location'],
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    salary_currency: job.salaryCurrency,
    skills: job.skills,
    is_featured: job.isFeatured,
    contact_phone: job.contactPhone ?? null,
    address: job.address ?? null,
    district: job.district ?? null,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

export function mapProfileRow(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    title: row.title ?? undefined,
    avatarUrl: row.avatar_url ?? `https://i.pravatar.cc/150?u=${row.id}`,
    role: row.role as User['role'],
    profileRole: row.profile_role as ProfileRole,
    language: row.language as AppLanguage,
    notifications: asNotifications(row.notifications),
    badge: row.badge ?? undefined,
    companyId: row.company_id ?? undefined,
    blocked: row.blocked ?? false,
  };
}

export function mapProfileToRow(user: User): Partial<ProfileRow> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? null,
    title: user.title ?? null,
    avatar_url: user.avatarUrl,
    role: user.role,
    profile_role: user.profileRole,
    language: user.language,
    notifications: user.notifications as unknown as Json,
    badge: user.badge ?? null,
    company_id: user.companyId ?? null,
    blocked: user.blocked ?? false,
  };
}

export function mapCategoryRow(row: CategoryRow, jobCount = 0): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    jobCount,
  };
}

export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    read: row.read,
  };
}

export function mapChatRow(row: ChatRow): Chat {
  return {
    id: row.id,
    participantIds: row.participant_ids,
    jobId: row.job_id ?? undefined,
    lastMessageId: row.last_message_id ?? '',
    updatedAt: row.updated_at,
  };
}
