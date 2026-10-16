import type { Metadata } from 'next';

import { getSiteUrl } from '@/lib/site-url';

const SITE_NAME = 'HamJoy';
const SITE_DESCRIPTION =
  "HamJoy — O'zbekistonda uy-joy ijarasi va savdosi, ish qidirish va e'lon joylash uchun yagona platforma.";

export const siteConfig = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  get url() {
    return getSiteUrl();
  },
};

export function createPageMetadata({
  title,
  description,
  path = '',
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const desc = description ?? SITE_DESCRIPTION;
  const url = `${siteConfig.url}${path}`;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: path || '/' },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'uz_UZ',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
    },
  };
}
