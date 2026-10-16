/**
 * Django REST path constants — services will use these with apiFetch when REST mode is enabled.
 */
export const API_ENDPOINTS = {
  jobs: '/api/jobs/',
  job: (id: string) => `/api/jobs/${id}/`,
  categories: '/api/categories/',
  favorites: '/api/favorites/',
  favorite: (jobId: string) => `/api/favorites/${jobId}/`,
  chats: '/api/chats/',
  chat: (id: string) => `/api/chats/${id}/`,
  chatMessages: (id: string) => `/api/chats/${id}/messages/`,
  applications: '/api/applications/',
  notifications: '/api/notifications/',
  notificationsUnread: '/api/notifications/unread_count/',
  notificationsReadAll: '/api/notifications/read_all/',
  profile: '/api/profile/',
  authLogin: '/api/auth/login/',
  authRegister: '/api/auth/register/',
  authLogout: '/api/auth/logout/',
  authMe: '/api/auth/me/',
} as const;
