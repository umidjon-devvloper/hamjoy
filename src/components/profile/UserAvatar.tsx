import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 96,
};

const sizeClasses = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-12 h-12 rounded-xl',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl',
};

export function UserAvatar({
  src,
  alt,
  size = 'md',
  isOnline,
  className,
}: UserAvatarProps) {
  const px = sizePixels[size];

  return (
    <div className={cn('relative shrink-0', className)}>
      <Image
        src={src || '/favicon.ico'}
        alt={alt}
        width={px}
        height={px}
        className={cn(sizeClasses[size], 'object-cover border-2 border-white shadow-sm')}
      />
      {isOnline && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--color-success)] rounded-full border-2 border-white"
          aria-hidden
        />
      )}
    </div>
  );
}
