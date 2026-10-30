import type { AppLanguage } from '@/types';

export interface Translations {
  // Navbar
  nav_home: string;
  nav_jobs: string;
  nav_search_placeholder_home: string;
  nav_search_placeholder_jobs: string;
  nav_login: string;
  nav_my_account: string;
  nav_saved: string;
  nav_notifications: string;
  nav_post: string;
  nav_post_what: string;
  nav_post_rent: string;
  nav_post_rent_desc: string;
  nav_post_job: string;
  nav_post_job_desc: string;
  nav_dark_mode: string;
  nav_light_mode: string;
  nav_language: string;
  nav_menu_open: string;
  nav_menu_close: string;
  nav_view_profile: string;
  nav_login_register: string;
  nav_login_register_desc: string;
  nav_clear: string;

  // Sections
  section_uy_joy: string;
  section_uy_joy_desc: string;
  section_ish: string;
  section_ish_desc: string;
  section_account: string;
  section_account_desc: string;

  // Uy-joy links
  link_sale: string;
  link_sale_desc: string;
  link_rent: string;
  link_rent_desc: string;
  link_buy: string;
  link_buy_desc: string;

  // Ish links
  link_search_jobs: string;
  link_search_jobs_desc: string;
  link_post_vacancy: string;
  link_post_vacancy_desc: string;
  link_post_cv: string;
  link_post_cv_desc: string;

  // Account links
  link_profile: string;
  link_profile_desc: string;
  link_my_listings: string;
  link_my_listings_desc: string;
  link_saved: string;
  link_saved_desc: string;
  link_chat: string;
  link_chat_desc: string;
  link_notifications: string;
  link_notifications_desc: string;

  // Common
  coming_soon: string;
  loading: string;
  save_changes: string;
  cancel: string;
  delete: string;
  confirm: string;
  back: string;

  // Profile
  profile_edit: string;
  profile_edit_desc: string;
  profile_full_name: string;
  profile_phone: string;
  profile_title: string;
  profile_title_placeholder: string;
  profile_role: string;
  profile_language: string;
  profile_change_avatar: string;
  profile_image_uploaded: string;
  profile_image_failed: string;

  // Listings
  listings_history: string;
  listings_all: string;
  listings_active: string;
  listings_sold: string;
  listings_archived: string;
  listings_draft: string;
  listings_activate: string;
  listings_activated: string;
  listings_activate_failed: string;
  listings_none: string;
  listings_count: string;
  listings_no_filter: string;
  listings_clear_filter: string;
  listings_post: string;
  listings_post_request: string;
  listings_delete_confirm: string;
  listings_deleted: string;
  listings_not_found: string;
  listings_not_found_desc: string;
  listings_go_home: string;

  // Role labels
  role_seeker: string;
  role_poster: string;
  role_both: string;

  // Footer / misc
  unread_count: string;
  saved_count: string;
}

const uz: Translations = {
  nav_home: 'Bosh sahifa',
  nav_jobs: 'Ish',
  nav_search_placeholder_home: 'Uy, ish qidiring...',
  nav_search_placeholder_jobs: 'Ish yoki kompaniya qidiring...',
  nav_login: 'Kirish',
  nav_my_account: 'Hisobim',
  nav_saved: 'Saqlangan',
  nav_notifications: 'Bildirishnomalar',
  nav_post: 'Eʼlon joylash',
  nav_post_what: 'Nima joylaysiz?',
  nav_post_rent: 'Uy-joy ijara',
  nav_post_rent_desc: 'Uy-joyni ijaraga bering',
  nav_post_job: 'Ish joylash',
  nav_post_job_desc: 'Xodim topish uchun vakansiya',
  nav_dark_mode: 'Tungi rejim',
  nav_light_mode: 'Kunduzgi rejim',
  nav_language: 'Tilni tanlash',
  nav_menu_open: 'Menyuni ochish',
  nav_menu_close: 'Menyuni yopish',
  nav_view_profile: 'Profilni koʻrish',
  nav_login_register: 'Kirish yoki roʻyxatdan oʻtish',
  nav_login_register_desc: "E'lon joylash va saqlash uchun",
  nav_clear: 'Tozalash',

  section_uy_joy: 'Uy-joy',
  section_uy_joy_desc: 'Uy-joy sotuvi, ijarasi va xarid soʻrovlari',
  section_ish: 'Ish',
  section_ish_desc: 'Ish qidiring yoki vakansiya va CV joylang',
  section_account: 'Hisobim',
  section_account_desc: 'Profil, eʼlonlaringiz va xabarlar',

  link_sale: 'Sotuv',
  link_sale_desc: 'Sotiladigan kvartira, hovli va yerlar',
  link_rent: 'Ijara',
  link_rent_desc: 'Ijaraga beriladigan uy-joylar',
  link_buy: 'Sotib olish',
  link_buy_desc: 'Xaridorlarning uy-joy soʻrovlari',

  link_search_jobs: 'Ish qidirish',
  link_search_jobs_desc: 'Filtr va xarita bilan vakansiyalar',
  link_post_vacancy: 'Vakansiya joylash',
  link_post_vacancy_desc: 'Xodim topish uchun eʼlon bering',
  link_post_cv: 'CV joylash',
  link_post_cv_desc: 'Rezyumeingizni eʼlon qiling',

  link_profile: 'Profil',
  link_profile_desc: 'Shaxsiy maʼlumotlar',
  link_my_listings: 'Eʼlonlarim',
  link_my_listings_desc: 'Joylagan eʼlonlaringiz',
  link_saved: 'Saqlanganlar',
  link_saved_desc: 'Saqlab qoʻygan eʼlonlaringiz',
  link_chat: 'Chat',
  link_chat_desc: 'Suhbatlar',
  link_notifications: 'Xabarlar va bildirishnomalar',
  link_notifications_desc: 'Yangiliklar va eslatmalar',

  coming_soon: 'Tez orada',
  loading: 'Yuklanmoqda…',
  save_changes: 'Saqlash',
  cancel: 'Bekor qilish',
  delete: 'Oʻchirish',
  confirm: 'Tasdiqlash',
  back: 'Orqaga',

  profile_edit: 'Profilni tahrirlash',
  profile_edit_desc: 'Shaxsiy maʼlumotlaringizni yangilang',
  profile_full_name: 'Toʻliq ism',
  profile_phone: 'Telefon',
  profile_title: 'Kasbiy lavozim',
  profile_title_placeholder: 'masalan, Dizayner',
  profile_role: 'Rol',
  profile_language: 'Til',
  profile_change_avatar: 'Rasmni oʻzgartirish uchun bosing',
  profile_image_uploaded: 'Rasm yuklandi',
  profile_image_failed: 'Rasm yuklanmadi',

  listings_history: 'Eʼlonlar tarixi',
  listings_all: 'Hammasi',
  listings_active: 'Faol',
  listings_sold: 'Sotildi',
  listings_archived: 'Arxiv',
  listings_draft: 'Qoralama',
  listings_activate: 'Faol qilish',
  listings_activated: 'Eʼlon faollashtirildi',
  listings_activate_failed: 'Faollashtirish amalga oshmadi',
  listings_none: 'Bu boʻlimda hali eʼlon yoʻq.',
  listings_count: 'ta eʼlon',
  listings_no_filter: 'Hozircha eʼlon yoʻq',
  listings_clear_filter: 'Filtrlarni tozalash',
  listings_post: 'Eʼlon joylash',
  listings_post_request: 'Soʻrov joylash',
  listings_delete_confirm: 'Eʼlon oʻchirilsinmi?',
  listings_deleted: 'Eʼlon oʻchirildi',
  listings_not_found: 'Eʼlon topilmadi',
  listings_not_found_desc: 'U oʻchirilgan yoki boshqa qurilmada joylangan boʻlishi mumkin.',
  listings_go_home: 'Bosh sahifaga',

  role_seeker: 'Ish izlovchi',
  role_poster: 'Ish beruvchi',
  role_both: 'Ikkalasi',

  unread_count: 'ta oʻqilmagan',
  saved_count: 'ta eʼlon',
};

const ru: Translations = {
  nav_home: 'Главная',
  nav_jobs: 'Работа',
  nav_search_placeholder_home: 'Поиск жилья, работы...',
  nav_search_placeholder_jobs: 'Поиск работы или компании...',
  nav_login: 'Войти',
  nav_my_account: 'Мой аккаунт',
  nav_saved: 'Сохранённые',
  nav_notifications: 'Уведомления',
  nav_post: 'Подать объявление',
  nav_post_what: 'Что вы хотите разместить?',
  nav_post_rent: 'Аренда жилья',
  nav_post_rent_desc: 'Сдайте жильё в аренду',
  nav_post_job: 'Вакансия',
  nav_post_job_desc: 'Найдите сотрудников',
  nav_dark_mode: 'Тёмная тема',
  nav_light_mode: 'Светлая тема',
  nav_language: 'Выбор языка',
  nav_menu_open: 'Открыть меню',
  nav_menu_close: 'Закрыть меню',
  nav_view_profile: 'Просмотр профиля',
  nav_login_register: 'Войти или зарегистрироваться',
  nav_login_register_desc: 'Для размещения и сохранения объявлений',
  nav_clear: 'Очистить',

  section_uy_joy: 'Жильё',
  section_uy_joy_desc: 'Продажа, аренда и запросы на жильё',
  section_ish: 'Работа',
  section_ish_desc: 'Поиск работы, вакансии и резюме',
  section_account: 'Мой аккаунт',
  section_account_desc: 'Профиль, объявления и сообщения',

  link_sale: 'Продажа',
  link_sale_desc: 'Квартиры, дома и участки на продажу',
  link_rent: 'Аренда',
  link_rent_desc: 'Жильё в аренду',
  link_buy: 'Купить',
  link_buy_desc: 'Запросы покупателей',

  link_search_jobs: 'Поиск работы',
  link_search_jobs_desc: 'Вакансии с фильтрами и картой',
  link_post_vacancy: 'Разместить вакансию',
  link_post_vacancy_desc: 'Подайте объявление о найме',
  link_post_cv: 'Разместить резюме',
  link_post_cv_desc: 'Опубликуйте своё резюме',

  link_profile: 'Профиль',
  link_profile_desc: 'Личные данные',
  link_my_listings: 'Мои объявления',
  link_my_listings_desc: 'Ваши размещённые объявления',
  link_saved: 'Сохранённые',
  link_saved_desc: 'Сохранённые объявления',
  link_chat: 'Чат',
  link_chat_desc: 'Переписки',
  link_notifications: 'Уведомления',
  link_notifications_desc: 'Новости и напоминания',

  coming_soon: 'Скоро',
  loading: 'Загрузка…',
  save_changes: 'Сохранить',
  cancel: 'Отмена',
  delete: 'Удалить',
  confirm: 'Подтвердить',
  back: 'Назад',

  profile_edit: 'Редактирование профиля',
  profile_edit_desc: 'Обновите свои личные данные',
  profile_full_name: 'Полное имя',
  profile_phone: 'Телефон',
  profile_title: 'Должность',
  profile_title_placeholder: 'например, Дизайнер',
  profile_role: 'Роль',
  profile_language: 'Язык',
  profile_change_avatar: 'Нажмите для смены фото',
  profile_image_uploaded: 'Фото загружено',
  profile_image_failed: 'Не удалось загрузить фото',

  listings_history: 'История объявлений',
  listings_all: 'Все',
  listings_active: 'Активные',
  listings_sold: 'Проданные',
  listings_archived: 'Архив',
  listings_draft: 'Черновик',
  listings_activate: 'Активировать',
  listings_activated: 'Объявление активировано',
  listings_activate_failed: 'Не удалось активировать',
  listings_none: 'В этом разделе пока нет объявлений.',
  listings_count: 'объявлений',
  listings_no_filter: 'Пока нет объявлений',
  listings_clear_filter: 'Сбросить фильтры',
  listings_post: 'Подать объявление',
  listings_post_request: 'Подать запрос',
  listings_delete_confirm: 'Удалить объявление?',
  listings_deleted: 'Объявление удалено',
  listings_not_found: 'Объявление не найдено',
  listings_not_found_desc: 'Оно могло быть удалено или размещено на другом устройстве.',
  listings_go_home: 'На главную',

  role_seeker: 'Ищу работу',
  role_poster: 'Работодатель',
  role_both: 'Оба',

  unread_count: 'непрочитанных',
  saved_count: 'объявлений',
};

const en: Translations = {
  nav_home: 'Home',
  nav_jobs: 'Jobs',
  nav_search_placeholder_home: 'Search homes, jobs...',
  nav_search_placeholder_jobs: 'Search jobs or companies...',
  nav_login: 'Sign in',
  nav_my_account: 'My account',
  nav_saved: 'Saved',
  nav_notifications: 'Notifications',
  nav_post: 'Post listing',
  nav_post_what: 'What would you like to post?',
  nav_post_rent: 'Rental listing',
  nav_post_rent_desc: 'List your property for rent',
  nav_post_job: 'Post a job',
  nav_post_job_desc: 'Find employees',
  nav_dark_mode: 'Dark mode',
  nav_light_mode: 'Light mode',
  nav_language: 'Select language',
  nav_menu_open: 'Open menu',
  nav_menu_close: 'Close menu',
  nav_view_profile: 'View profile',
  nav_login_register: 'Sign in or register',
  nav_login_register_desc: 'To post and save listings',
  nav_clear: 'Clear',

  section_uy_joy: 'Housing',
  section_uy_joy_desc: 'Property sales, rentals and purchase requests',
  section_ish: 'Jobs',
  section_ish_desc: 'Find jobs or post vacancies and CVs',
  section_account: 'My account',
  section_account_desc: 'Profile, listings and messages',

  link_sale: 'For sale',
  link_sale_desc: 'Apartments, houses and land for sale',
  link_rent: 'For rent',
  link_rent_desc: 'Properties available for rent',
  link_buy: 'Want to buy',
  link_buy_desc: 'Buyer purchase requests',

  link_search_jobs: 'Find jobs',
  link_search_jobs_desc: 'Vacancies with filters and map',
  link_post_vacancy: 'Post a vacancy',
  link_post_vacancy_desc: 'Post a hiring listing',
  link_post_cv: 'Post CV',
  link_post_cv_desc: 'Publish your resume',

  link_profile: 'Profile',
  link_profile_desc: 'Personal information',
  link_my_listings: 'My listings',
  link_my_listings_desc: 'Your posted listings',
  link_saved: 'Saved',
  link_saved_desc: 'Your saved listings',
  link_chat: 'Chat',
  link_chat_desc: 'Conversations',
  link_notifications: 'Notifications',
  link_notifications_desc: 'News and reminders',

  coming_soon: 'Coming soon',
  loading: 'Loading…',
  save_changes: 'Save changes',
  cancel: 'Cancel',
  delete: 'Delete',
  confirm: 'Confirm',
  back: 'Back',

  profile_edit: 'Edit profile',
  profile_edit_desc: 'Update your personal information',
  profile_full_name: 'Full name',
  profile_phone: 'Phone',
  profile_title: 'Professional title',
  profile_title_placeholder: 'e.g. Product Designer',
  profile_role: 'Role',
  profile_language: 'Language',
  profile_change_avatar: 'Click to change photo',
  profile_image_uploaded: 'Photo uploaded',
  profile_image_failed: 'Failed to upload photo',

  listings_history: 'Listing history',
  listings_all: 'All',
  listings_active: 'Active',
  listings_sold: 'Sold',
  listings_archived: 'Archived',
  listings_draft: 'Draft',
  listings_activate: 'Activate',
  listings_activated: 'Listing activated',
  listings_activate_failed: 'Failed to activate',
  listings_none: 'No listings in this section yet.',
  listings_count: 'listings',
  listings_no_filter: 'No listings yet',
  listings_clear_filter: 'Clear filters',
  listings_post: 'Post a listing',
  listings_post_request: 'Post a request',
  listings_delete_confirm: 'Delete this listing?',
  listings_deleted: 'Listing deleted',
  listings_not_found: 'Listing not found',
  listings_not_found_desc: 'It may have been deleted or posted from another device.',
  listings_go_home: 'Go to home page',

  role_seeker: 'Job seeker',
  role_poster: 'Employer',
  role_both: 'Both',

  unread_count: 'unread',
  saved_count: 'listings',
};

export const TRANSLATION_MAP: Record<AppLanguage, Translations> = { uz, ru, en };
