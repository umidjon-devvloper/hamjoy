/**
 * Boshlang'ich ma'lumotlar — kategoriyalar daraxti va O'zbekiston viloyatlari.
 * Ishga tushirish:  pnpm --filter @joymee/api db:seed
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv({ path: resolve(process.cwd(), '.env') });

async function main() {
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const postgres = (await import('postgres')).default;
  const { sql } = await import('drizzle-orm');
  const { categories, locations } = await import('./schema');

  const CATEGORIES = [
    // --- Uy-joy ---
    { id: 1, parentId: null, vertical: 'uy-joy', slug: 'uy-joy', nameUz: 'Uy-joy', nameRu: 'Недвижимость', icon: 'home' },
    { id: 10, parentId: 1, vertical: 'uy-joy', slug: 'kvartira-ijara', nameUz: 'Kvartira ijara', nameRu: 'Квартира аренда', icon: 'key' },
    { id: 11, parentId: 1, vertical: 'uy-joy', slug: 'kvartira-sotuv', nameUz: 'Kvartira sotuv', nameRu: 'Квартира продажа', icon: 'tag' },
    { id: 12, parentId: 1, vertical: 'uy-joy', slug: 'uy-sotuv', nameUz: 'Hovli uy', nameRu: 'Частный дом', icon: 'house' },
    { id: 13, parentId: 1, vertical: 'uy-joy', slug: 'kunlik-ijara', nameUz: 'Kunlik ijara', nameRu: 'Посуточно', icon: 'bed' },
    { id: 14, parentId: 1, vertical: 'uy-joy', slug: 'tijorat', nameUz: 'Tijorat obyekti', nameRu: 'Коммерческая', icon: 'building' },

    // --- Ish ---
    { id: 2, parentId: null, vertical: 'ish', slug: 'ish', nameUz: 'Ish', nameRu: 'Работа', icon: 'briefcase' },
    { id: 20, parentId: 2, vertical: 'ish', slug: 'doimiy-ish', nameUz: 'Doimiy ish', nameRu: 'Постоянная работа', icon: 'briefcase' },
    { id: 21, parentId: 2, vertical: 'ish', slug: 'kunlik-ish', nameUz: 'Kunlik ish', nameRu: 'Поденная работа', icon: 'calendar-clock' },
    { id: 22, parentId: 2, vertical: 'ish', slug: 'men-qila-olaman', nameUz: "Men qila olaman", nameRu: 'Я могу выполнить', icon: 'hand' },
    { id: 23, parentId: 2, vertical: 'ish', slug: 'ish-xizmatlar', nameUz: 'Xizmatlar', nameRu: 'Услуги', icon: 'wrench' },

    // --- Avto ---
    { id: 3, parentId: null, vertical: 'avto', slug: 'avto', nameUz: 'Avto', nameRu: 'Авто', icon: 'car' },
    { id: 30, parentId: 3, vertical: 'avto', slug: 'avto-sotuv', nameUz: 'Avto sotuv', nameRu: 'Авто продажа', icon: 'car' },
    { id: 31, parentId: 3, vertical: 'avto', slug: 'avto-salon', nameUz: 'Avtosalon', nameRu: 'Автосалон', icon: 'store' },
    { id: 32, parentId: 3, vertical: 'avto', slug: 'avto-ijara', nameUz: 'Avto ijara', nameRu: 'Авто аренда', icon: 'car-front' },

    // --- Bepul ---
    { id: 4, parentId: null, vertical: 'bepul', slug: 'bepul', nameUz: 'Bepul beraman', nameRu: 'Отдам бесплатно', icon: 'gift' },
  ];

  const LOCATIONS = [
    // --- Toshkent shahri + 11 tumani ---
    { id: 1, parentId: null, nameUz: 'Toshkent sh.', nameRu: 'г. Ташкент' },
    { id: 11, parentId: 1, nameUz: 'Yunusobod', nameRu: 'Юнусабад' },
    { id: 12, parentId: 1, nameUz: 'Chilonzor', nameRu: 'Чиланзар' },
    { id: 13, parentId: 1, nameUz: "Mirzo Ulug'bek", nameRu: 'Мирзо-Улугбек' },
    { id: 14, parentId: 1, nameUz: 'Shayxontohur', nameRu: 'Шайхантахур' },
    { id: 15, parentId: 1, nameUz: 'Sergeli', nameRu: 'Сергели' },
    { id: 16, parentId: 1, nameUz: 'Yakkasaroy', nameRu: 'Яккасарай' },
    { id: 17, parentId: 1, nameUz: 'Mirobod', nameRu: 'Мирабад' },
    { id: 18, parentId: 1, nameUz: 'Olmazor', nameRu: 'Алмазар' },
    { id: 19, parentId: 1, nameUz: 'Uchtepa', nameRu: 'Учтепа' },
    { id: 101, parentId: 1, nameUz: 'Bektemir', nameRu: 'Бектемир' },
    { id: 102, parentId: 1, nameUz: 'Yashnobod', nameRu: 'Яшнабад' },

    // --- Viloyatlar + yirik tumanlari ---
    { id: 2, parentId: null, nameUz: 'Samarqand', nameRu: 'Самарканд' },
    { id: 201, parentId: 2, nameUz: 'Samarqand sh.', nameRu: 'г. Самарканд' },
    { id: 202, parentId: 2, nameUz: 'Kattaqo‘rg‘on', nameRu: 'Каттакурган' },
    { id: 203, parentId: 2, nameUz: 'Urgut', nameRu: 'Ургут' },

    { id: 3, parentId: null, nameUz: 'Buxoro', nameRu: 'Бухара' },
    { id: 301, parentId: 3, nameUz: 'Buxoro sh.', nameRu: 'г. Бухара' },
    { id: 302, parentId: 3, nameUz: 'G‘ijduvon', nameRu: 'Гиждуван' },

    { id: 4, parentId: null, nameUz: 'Namangan', nameRu: 'Наманган' },
    { id: 401, parentId: 4, nameUz: 'Namangan sh.', nameRu: 'г. Наманган' },
    { id: 402, parentId: 4, nameUz: 'Chust', nameRu: 'Чуст' },

    { id: 5, parentId: null, nameUz: 'Andijon', nameRu: 'Андижан' },
    { id: 501, parentId: 5, nameUz: 'Andijon sh.', nameRu: 'г. Андижан' },
    { id: 502, parentId: 5, nameUz: 'Asaka', nameRu: 'Асака' },

    { id: 6, parentId: null, nameUz: "Farg'ona", nameRu: 'Фергана' },
    { id: 601, parentId: 6, nameUz: "Farg'ona sh.", nameRu: 'г. Фергана' },
    { id: 602, parentId: 6, nameUz: "Qo'qon", nameRu: 'Коканд' },
    { id: 603, parentId: 6, nameUz: 'Marg‘ilon', nameRu: 'Маргилан' },

    { id: 7, parentId: null, nameUz: 'Qashqadaryo', nameRu: 'Кашкадарья' },
    { id: 701, parentId: 7, nameUz: 'Qarshi', nameRu: 'Карши' },
    { id: 702, parentId: 7, nameUz: 'Shahrisabz', nameRu: 'Шахрисабз' },

    { id: 8, parentId: null, nameUz: 'Surxondaryo', nameRu: 'Сурхандарья' },
    { id: 801, parentId: 8, nameUz: 'Termiz', nameRu: 'Термез' },

    { id: 9, parentId: null, nameUz: 'Jizzax', nameRu: 'Джизак' },
    { id: 901, parentId: 9, nameUz: 'Jizzax sh.', nameRu: 'г. Джизак' },

    { id: 10, parentId: null, nameUz: 'Sirdaryo', nameRu: 'Сырдарья' },
    { id: 1001, parentId: 10, nameUz: 'Guliston', nameRu: 'Гулистан' },

    { id: 20, parentId: null, nameUz: 'Navoiy', nameRu: 'Навои' },
    { id: 2001, parentId: 20, nameUz: 'Navoiy sh.', nameRu: 'г. Навои' },
    { id: 2002, parentId: 20, nameUz: 'Zarafshon', nameRu: 'Зарафшан' },

    { id: 21, parentId: null, nameUz: 'Xorazm', nameRu: 'Хорезм' },
    { id: 2101, parentId: 21, nameUz: 'Urganch', nameRu: 'Ургенч' },
    { id: 2102, parentId: 21, nameUz: 'Xiva', nameRu: 'Хива' },

    { id: 22, parentId: null, nameUz: "Qoraqalpog'iston", nameRu: 'Каракалпакстан' },
    { id: 2201, parentId: 22, nameUz: 'Nukus', nameRu: 'Нукус' },

    // --- Toshkent viloyati va yirik shaharlari ---
    { id: 23, parentId: null, nameUz: 'Toshkent viloyati', nameRu: 'Ташкентская область' },
    { id: 2301, parentId: 23, nameUz: 'Chirchiq', nameRu: 'Чирчик' },
    { id: 2302, parentId: 23, nameUz: 'Olmaliq', nameRu: 'Алмалык' },
    { id: 2303, parentId: 23, nameUz: 'Qibray', nameRu: 'Кибрай' },
    { id: 2304, parentId: 23, nameUz: 'Zangiota', nameRu: 'Зангиата' },
  ];

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL env missing');
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  await db
    .insert(categories)
    .values(CATEGORIES as never)
    .onConflictDoUpdate({
      target: categories.id,
      set: {
        vertical: sql`EXCLUDED.vertical`,
        parentId: sql`EXCLUDED.parent_id`,
        slug: sql`EXCLUDED.slug`,
        nameUz: sql`EXCLUDED.name_uz`,
        nameRu: sql`EXCLUDED.name_ru`,
        icon: sql`EXCLUDED.icon`,
      },
    });
  await db
    .insert(locations)
    .values(LOCATIONS)
    .onConflictDoUpdate({
      target: locations.id,
      set: {
        parentId: sql`EXCLUDED.parent_id`,
        nameUz: sql`EXCLUDED.name_uz`,
        nameRu: sql`EXCLUDED.name_ru`,
      },
    });

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
