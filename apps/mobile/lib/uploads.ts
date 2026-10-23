import { API_URL, tokens } from './api';

async function authHeader(): Promise<Record<string, string>> {
  const t = await tokens.getAccess();
  return t
    ? { authorization: `Bearer ${t}`, 'content-type': 'application/json' }
    : { 'content-type': 'application/json' };
}

export type UploadKind = 'listing' | 'verify' | 'avatar' | 'chat';

export interface Presigned {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  headers: Record<string, string>;
}

export const uploads = {
  async enabled(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/uploads/config`);
      if (!res.ok) return false;
      const body = (await res.json()) as { enabled: boolean };
      return body.enabled;
    } catch {
      return false;
    }
  },

  async presign(kind: UploadKind, contentType: string, byteSize?: number): Promise<Presigned> {
    const res = await fetch(`${API_URL}/uploads/presign`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify({ kind, contentType, byteSize }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? `Yuklash URL olinmadi (${res.status})`);
    }
    return (await res.json()) as Presigned;
  },

  /**
   * Pick-and-upload: given a local file URI and MIME type (what
   * expo-image-picker returns), presign, PUT the bytes, resolve the public URL.
   */
  async uploadLocal(kind: UploadKind, localUri: string, contentType: string): Promise<string> {
    const resp = await fetch(localUri);
    const blob = await resp.blob();
    const p = await this.presign(kind, contentType, blob.size);
    const put = await fetch(p.uploadUrl, { method: 'PUT', headers: p.headers, body: blob });
    if (!put.ok) throw new Error(`Fayl yuklanmadi (${put.status})`);
    return p.publicUrl;
  },
};
