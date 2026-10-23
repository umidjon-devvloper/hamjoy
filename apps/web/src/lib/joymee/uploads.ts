import { joymeeTokens } from './client';

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token
    ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
    : { 'content-type': 'application/json' };
}

export type UploadKind = 'listing' | 'verify' | 'avatar' | 'chat';

export interface Presigned {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  headers: Record<string, string>;
}

export const joymeeUploads = {
  async enabled(): Promise<boolean> {
    try {
      const res = await fetch(`${base()}/uploads/config`);
      if (!res.ok) return false;
      const body = (await res.json()) as { enabled: boolean };
      return body.enabled;
    } catch {
      return false;
    }
  },

  async presign(kind: UploadKind, file: File): Promise<Presigned> {
    const res = await fetch(`${base()}/uploads/presign`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify({ kind, contentType: file.type || 'application/octet-stream', byteSize: file.size }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? `Yuklash URL olinmadi (${res.status})`);
    }
    return (await res.json()) as Presigned;
  },

  /** Pick-and-upload: presign, PUT the file, resolve with the public URL. */
  async upload(kind: UploadKind, file: File): Promise<string> {
    const p = await this.presign(kind, file);
    const put = await fetch(p.uploadUrl, { method: 'PUT', headers: p.headers, body: file });
    if (!put.ok) throw new Error(`Fayl yuklanmadi (${put.status})`);
    return p.publicUrl;
  },
};
