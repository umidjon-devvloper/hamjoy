import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// --- enums ---
export const userRole = pgEnum('user_role', ['user', 'moderator', 'admin']);
export const userStatus = pgEnum('user_status', ['active', 'blocked', 'pending']);
export const listingType = pgEnum('listing_type', [
  'job',
  'rent',
  'sale',
  'service',
  'worker_offer',
  'car_sale',
  'car_salon',
  'free_give',
]);
export const vertical = pgEnum('vertical', ['uy-joy', 'ish', 'avto', 'bepul']);
export const promoTier = pgEnum('promo_tier', ['bronze', 'silver', 'gold']);
export const listingStatus = pgEnum('listing_status', [
  'draft',
  'pending',
  'active',
  'sold',
  'archived',
  'blocked',
]);
export const currency = pgEnum('currency', ['UZS', 'USD']);

// --- users ---
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: text('phone').unique(),
    email: text('email').unique(),
    passwordHash: text('password_hash'),
    role: userRole('role').notNull().default('user'),
    status: userStatus('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    phoneIdx: index('users_phone_idx').on(t.phone),
  }),
);

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  cityId: integer('city_id'),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  device: text('device'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const otpCodes = pgTable(
  'otp_codes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    phone: text('phone').notNull(),
    codeHash: text('code_hash').notNull(),
    purpose: text('purpose').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ phoneIdx: index('otp_phone_idx').on(t.phone) }),
);

// --- taxonomy ---
export const categories = pgTable('categories', {
  id: integer('id').primaryKey(),
  parentId: integer('parent_id'),
  vertical: vertical('vertical').notNull().default('uy-joy'),
  slug: text('slug').notNull().unique(),
  nameUz: text('name_uz').notNull(),
  nameRu: text('name_ru').notNull(),
  icon: text('icon'),
  schema: jsonb('schema'),
});

export const locations = pgTable('locations', {
  id: integer('id').primaryKey(),
  parentId: integer('parent_id'),
  nameUz: text('name_uz').notNull(),
  nameRu: text('name_ru').notNull(),
  // PostGIS GEOGRAPHY(POINT) added by raw migration (see 0001_postgis.sql)
});

// --- listings ---
export const listings = pgTable(
  'listings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: listingType('type').notNull(),
    vertical: vertical('vertical').notNull().default('uy-joy'),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    priceAmount: numeric('price_amount', { precision: 14, scale: 2 }),
    priceCurrency: currency('price_currency'),
    priceNegotiable: boolean('price_negotiable').notNull().default(false),
    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id),
    status: listingStatus('status').notNull().default('draft'),
    viewsCount: integer('views_count').notNull().default(0),
    favoritesCount: integer('favorites_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (t) => ({
    statusPublishedIdx: index('listings_status_published_idx').on(t.status, t.publishedAt),
    userIdx: index('listings_user_idx').on(t.userId),
    ftsIdx: index('listings_fts_idx').using(
      'gin',
      sql`to_tsvector('simple', coalesce(${t.title}, '') || ' ' || coalesce(${t.description}, ''))`,
    ),
  }),
);

export const listingMedia = pgTable('listing_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  kind: text('kind').notNull().default('image'),
  order: integer('order').notNull().default(0),
});

export const listingAttrs = pgTable(
  'listing_attrs',
  {
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    value: text('value').notNull(),
  },
  (t) => ({
    pk: uniqueIndex('listing_attrs_pk').on(t.listingId, t.key),
  }),
);

// --- interactions ---
export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: uniqueIndex('favorites_pk').on(t.userId, t.listingId) }),
);

export const chats = pgTable(
  'chats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    unreadCounts: jsonb('unread_counts').notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pairIdx: uniqueIndex('chats_pair_idx').on(t.listingId, t.buyerId, t.sellerId),
  }),
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull().default(''),
    mediaUrl: text('media_url'),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ chatCreatedIdx: index('messages_chat_created_idx').on(t.chatId, t.createdAt) }),
);

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  coverLetter: text('cover_letter'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull().default(sql`'{}'::jsonb`),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ userIdx: index('notifications_user_idx').on(t.userId, t.createdAt) }),
);

export const deviceTokens = pgTable(
  'device_tokens',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ userIdx: index('device_tokens_user_idx').on(t.userId) }),
);

export const promotions = pgTable(
  'promotions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    tier: promoTier('tier').notNull(),
    durationDays: integer('duration_days').notNull(),
    paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }),
    paidCurrency: currency('paid_currency'),
    /** Null until the payment provider confirms; admin grants bypass this. */
    paidAt: timestamp('paid_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    listingExpiresIdx: index('promotions_listing_expires_idx').on(t.listingId, t.expiresAt),
  }),
);

// Silence unused imports when a column that uses them is commented out.
void bigint;
