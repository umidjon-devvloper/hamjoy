import type { ImageSourcePropType } from 'react-native';

/** Bundled photos (same set the web app ships in public/listings). */
export const photos = {
  hovliZamonaviy: require('../assets/images/hovli-zamonaviy.webp'),
  hovliBasseyn: require('../assets/images/hovli-basseyn.webp'),
  hovliYogoch: require('../assets/images/hovli-yogoch.webp'),
  kvartira: require('../assets/images/kvartira-bino-1.webp'),
  studiya: require('../assets/images/studiya-1.webp'),
  oshxona: require('../assets/images/oshxona-1.webp'),
  villa1: require('../assets/images/villa-1.webp'),
  villa2: require('../assets/images/villa-2.webp'),
  villa3: require('../assets/images/villa-3.webp'),
  mehmonxona1: require('../assets/images/mehmonxona-1.webp'),
  mehmonxona2: require('../assets/images/mehmonxona-2.webp'),
  mehmonxona3: require('../assets/images/mehmonxona-3.webp'),
  mehmonxona4: require('../assets/images/mehmonxona-4.webp'),
  ofis1: require('../assets/images/ofis-1.webp'),
  ofis2: require('../assets/images/ofis-2.webp'),
  uyJoyHovli: require('../assets/images/uy-joy-hovli.webp'),
  ishQuruvchi: require('../assets/images/ish-quruvchi.webp'),
  logo: require('../assets/images/logo.png'),
} satisfies Record<string, ImageSourcePropType>;

const fallbackPool = [
  photos.kvartira,
  photos.hovliZamonaviy,
  photos.studiya,
  photos.villa1,
  photos.oshxona,
  photos.hovliYogoch,
  photos.mehmonxona2,
  photos.villa2,
];

/** Stable placeholder photo for an API listing that has no media yet. */
export function fallbackPhoto(seed: string): ImageSourcePropType {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return fallbackPool[h % fallbackPool.length]!;
}
