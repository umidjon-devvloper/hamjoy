const MAX_SIDE = 1280;
const QUALITY = 0.78;

/** Downscales a photo to ≤1280px JPEG and returns it as a data URL (keeps storage small). */
export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name}: rasm fayli emas`);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Rasmni qayta ishlab boʻlmadi');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', QUALITY);
}
