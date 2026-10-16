export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface ChatParticipantRow {
  chat_id: string;
  user_id: string;
}

export interface FavoriteRow {
  user_id: string;
  job_id: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  title: string | null;
  avatar_url: string | null;
  role: string;
  profile_role: string;
  language: string;
  notifications: Json;
  badge: string | null;
  company_id: string | null;
  blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface JobRow {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  company_logo: string | null;
  category_id: string;
  poster_id: string;
  description: string;
  requirements: Json;
  responsibilities: Json | null;
  status: string;
  work_type: string;
  schedule_type: string;
  schedule_pattern: string;
  location: Json;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  skills: Json;
  is_featured: boolean;
  contact_phone: string | null;
  address: string | null;
  district: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatRow {
  id: string;
  job_id: string | null;
  last_message_id: string | null;
  updated_at: string;
  created_at: string;
  participant_ids: string[];
}

export interface MessageRow {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface LocationRow {
  id: string;
  label: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}
