/**
 * Boshlang'ich ma'lumotlar — kategoriyalar daraxti va O'zbekiston viloyatlari.
 * Ishga tushirish:  pnpm --filter @joymee/api db:seed
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
loadEnv();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { env } from '../env';
import { categories, locations } from './schema';

const CATEGORIES = [
  { id: 1, parentId: null, slug: 'uy-joy', nameUz: 'Uy-joy', nameRu: 'Недвижимость', icon: 'home' },
  { id: 10, parentId: 1, slug: 'kvartira-ijara', nameUz: 'Kvartira ijara', nameRu: 'Квартира аренда', icon: 'key' },
  { id: 11, parentId: 1, slug: 'kvartira-sotuv', nameUz: 'Kvartira sotuv', nameRu: 'Квартира продажа', icon: 'tag' },
  { id: 12, parentId: 1, slug: 'uy-sotuv', nameUz: 'Hovli uy', nameRu: 'Частный дом', icon: 'house' },

  { id: 2, parentId: null, slug: 'ish', nameUz: 'Ish', nameRu: 'Работа', icon: 'briefcase' },
  { id: 20, parentId: 2, slug: 'it-dasturchi', nameUz: 'IT va dasturchi', nameRu: 'IT и разработка', icon: 'code' },
  { id: 21, parentId: 2, slug: 'savdo', nameUz: 'Savdo', nameRu: 'Продажи', icon: 'store' },
  { id: 22, parentId: 2, slug: 'quruvchi', nameUz: 'Quruvchi', nameRu: 'Строитель', icon: 'hard-hat' },
  { id: 23, parentId: 2, slug: 'oshpaz', nameUz: 'Oshpaz', nameRu: 'Повар', icon: 'chef-hat' },

  { id: 3, parentId: null, slug: 'xizmatlar', nameUz: 'Xizmatlar', nameRu: 'Услуги', icon: 'wrench' },
  { id: 30, parentId: 3, slug: 'tozalash', nameUz: 'Tozalash', nameRu: 'Уборка', icon: 'sparkles' },
  { id: 31, parentId: 3, slug: 'tarjima', nameUz: 'Tarjima', nameRu: 'Перевод', icon: 'languages' },
  { id: 32, parentId: 3, slug: 'tamir', nameUz: "Ta'mir", nameRu: 'Ремонт', icon: 'hammer' },

  { id: 4, parentId: null, slug: 'transport', nameUz: 'Transport', nameRu: 'Транспорт', icon: 'car' },
  { id: 40, parentId: 4, slug: 'avto-sotuv', nameUz: 'Avto sotuv', nameRu: 'Авто продажа', icon: 'car' },
  { id: 41, parentId: 4, slug: 'avto-ijara', nameUz: 'Avto ijara', nameRu: 'Авто аренда', icon: 'car-front' },
];

const LOCATIONS = [
  { id: 1, parentId: null, nameUz: 'Toshkent sh.', nameRu: 'г. Ташкент' },
  { id: 11, parentId: 1, nameUz: 'Yunusobod', nameRu: 'Юнусабад' },
  { id: 12, parentId: 1, nameUz: 'Chilonzor', nameRu: 'Чиланзар' },
  { id: 13, parentId: 1, nameUz: 'Mirzo Ulug\'bek', nameRu: 'Мирзо-Улугбек' },
  { id: 14, parentId: 1, nameUz: 'Shayxontohur', nameRu: 'Шайхантахур' },
  { id: 15, parentId: 1, nameUz: 'Sergeli', nameRu: 'Сергели' },
  { id: 16, parentId: 1, nameUz: 'Yakkasaroy', nameRu: 'Яккасарай' },

  { id: 2, parentId: null, nameUz: 'Samarqand', nameRu: 'Самарканд' },
  { id: 3, parentId: null, nameUz: 'Buxoro', nameRu: 'Бухара' },
  { id: 4, parentId: null, nameUz: 'Namangan', nameRu: 'Наманган' },
  { id: 5, parentId: null, nameUz: 'Andijon', nameRu: 'Андижан' },
  { id: 6, parentId: null, nameUz: "Farg'ona", nameRu: 'Фергана' },
  { id: 7, parentId: null, nameUz: 'Qashqadaryo', nameRu: 'Кашкадарья' },
  { id: 8, parentId: null, nameUz: 'Surxondaryo', nameRu: 'Сурхандарья' },
  { id: 9, parentId: null, nameUz: 'Jizzax', nameRu: 'Джизак' },
  { id: 10, parentId: null, nameUz: 'Sirdaryo', nameRu: 'Сырдарья' },
  { id: 20, parentId: null, nameUz: 'Navoiy', nameRu: 'Навои' },
  { id: 21, parentId: null, nameUz: 'Xorazm', nameRu: 'Хорезм' },
  { id: 22, parentId: null, nameUz: "Qoraqalpog'iston", nameRu: 'Каракалпакстан' },
];

async function main() {
  const client = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  // Insert in order so parents exist first.
  await db.insert(categories).values(CATEGORIES).onConflictDoNothing();
  await db.insert(locations).values(LOCATIONS).onConflictDoNothing();

  // Toshkent geo center (41.3111, 69.2797)
  await db.execute(sql`
    UPDATE locations SET geo = ST_SetSRID(ST_MakePoint(69.2797, 41.3111), 4326)::geography
    WHERE id = 1 AND geo IS NULL
  `);

  // eslint-disable-next-line no-console
  console.log(`✓ Seeded ${CATEGORIES.length} categories, ${LOCATIONS.length} locations`);
  await client.end();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
