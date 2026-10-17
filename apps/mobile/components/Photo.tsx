import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { fallbackPhoto } from '@/lib/images';

/** expo-image that swaps to a bundled photo when a remote URL fails to load. */
export function Photo({ source, seed, ...rest }: Omit<ImageProps, 'source'> & { source: ImageSourcePropType | undefined; seed: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      {...rest}
      source={failed || !source ? fallbackPhoto(seed) : source}
      onError={() => setFailed(true)}
      contentFit={rest.contentFit ?? 'cover'}
    />
  );
}
