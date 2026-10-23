import { randomUUID } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../env';

type Kind = 'listing' | 'verify' | 'avatar' | 'chat';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const EXT_FOR_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

/** Cloudflare R2 (S3-compatible) presign — a short-lived PUT URL per upload. */
@Injectable()
export class UploadsService {
  private readonly client: S3Client | null;

  constructor() {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY || !env.S3_BUCKET || !env.S3_PUBLIC_URL) {
      this.client = null;
      return;
    }
    this.client = new S3Client({
      // R2 uses the "auto" region; falls back to env override if the caller
      // mounted the bucket on another region alias.
      region: env.S3_REGION ?? 'auto',
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }

  isEnabled(): boolean {
    return !!this.client;
  }

  async presign(userId: string, kind: Kind, contentType: string, byteSize?: number) {
    if (!this.client) {
      throw new ServiceUnavailableException({
        code: 'uploads_disabled',
        message: 'Rasm yuklash hali sozlanmagan',
      });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      throw new ServiceUnavailableException({
        code: 'unsupported_type',
        message: 'Faqat JPG, PNG, WebP, HEIC qabul qilinadi',
      });
    }
    const ext = EXT_FOR_TYPE[contentType] ?? 'bin';
    const date = new Date().toISOString().slice(0, 10);
    const key = `${kind}/${date}/${userId}/${randomUUID()}.${ext}`;
    const cmd = new PutObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: key,
      ContentType: contentType,
      ContentLength: byteSize,
    });
    const uploadUrl = await getSignedUrl(this.client, cmd, { expiresIn: 60 * 5 });
    const publicUrl = `${env.S3_PUBLIC_URL!.replace(/\/$/, '')}/${key}`;
    return { uploadUrl, publicUrl, key, headers: { 'Content-Type': contentType } };
  }
}
