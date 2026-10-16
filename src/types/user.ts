export type ProfileRole = 'seeker' | 'poster' | 'both';

export type AppLanguage = 'en' | 'uz' | 'ru';

export interface NotificationSettings {
  emailAlerts: boolean;
  pushAlerts: boolean;
  jobMatches: boolean;
  chatMessages: boolean;
  marketing: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailAlerts: true,
  pushAlerts: true,
  jobMatches: true,
  chatMessages: true,
  marketing: false,
};

export const PROFILE_ROLE_LABELS: Record<ProfileRole, string> = {
  seeker: 'Ish izlovchi',
  poster: 'Ish beruvchi',
  both: 'Ikkalasi',
};

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'Inglizcha',
  uz: 'Oʻzbekcha',
  ru: 'Ruscha',
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  avatarUrl: string;
  /** Legacy system role — prefer profileRole for UI */
  role: 'seeker' | 'poster' | 'admin';
  profileRole: ProfileRole;
  language: AppLanguage;
  notifications: NotificationSettings;
  badge?: string;
  companyId?: string;
  blocked?: boolean;
}

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  title?: string;
  profileRole?: ProfileRole;
  language?: AppLanguage;
  notifications?: Partial<NotificationSettings>;
}
