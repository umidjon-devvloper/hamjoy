'use client';

import React, { useState } from 'react';
import type { JobListItem } from '@/types';
import { Bookmark, MapPin, Clock, Star, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { appToast } from '@/lib/feedback/toast';
import { JobCardMiniMap } from '@/components/map/JobCardMiniMap';

export interface JobCardProps {
  job: JobListItem;
  index?: number;
  featured?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function JobCard({ job, index = 0, featured }: JobCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isSaved = isFavorite(job.id);
  const showFeatured = featured ?? job.isFeatured;
  const [showPhone, setShowPhone] = useState(false);

  const handlePhone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // First tap reveals the number; a second tap places a call.
    if (!showPhone) {
      setShowPhone(true);
    } else if (job.contactPhone) {
      window.location.href = `tel:${job.contactPhone.replace(/[^\d+]/g, '')}`;
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const newState = await toggleFavorite(job.id);
      appToast.favoriteToggled(newState);
    } catch (err) {
      appToast.error(err, 'Could not update favorites');
    }
  };

  return (
    <Link href={`/job/${job.id}`} className="block">
      <motion.article
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05, ease: 'easeOut' }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'card card-hover p-4 sm:p-5 relative overflow-hidden',
          showFeatured &&
            'border-[var(--color-primary)]/20 bg-gradient-to-br from-white to-[var(--color-primary-light)]/30'
        )}
      >
        <div className="flex gap-3 sm:gap-4">
          {/* Left — job content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-[var(--color-border)] shrink-0 relative">
                <Image
                  src={job.logo}
                  alt=""
                  width={28}
                  height={28}
                  className="object-contain"
                  aria-hidden
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--color-secondary)] text-base sm:text-[17px] leading-snug truncate">
                  {job.title}
                </h3>
                <p className="text-[var(--color-muted)] text-sm truncate">{job.company}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)] mb-3">
              <span className="inline-flex items-center gap-1 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
              <span className="font-semibold text-[var(--color-success)] whitespace-nowrap">
                {job.salary}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
              <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" />
                {job.postedAt}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {job.contactPhone && (
                <button
                  type="button"
                  onClick={handlePhone}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
                    'bg-[var(--color-success-light)] text-[var(--color-success)] hover:bg-[var(--color-success)]/15'
                  )}
                  aria-label={
                    showPhone ? `Qoʻngʻiroq qilish: ${job.contactPhone}` : 'Telefon raqamini koʻrsatish'
                  }
                >
                  <Phone className="w-3 h-3" />
                  {showPhone ? job.contactPhone : 'Telefon'}
                </button>
              )}
              {showFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-light)]">
                  <Star className="w-3 h-3" fill="currentColor" />
                  Tavsiya
                </span>
              )}
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-medium text-[var(--color-muted)] border border-[var(--color-border)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right — region mini-map + save */}
          <div className="shrink-0 relative">
            <JobCardMiniMap
              lat={job.lat}
              lng={job.lng}
              isRemote={job.isRemote}
              region={job.region}
              distanceKm={job.distanceKm}
              className="w-[72px] h-[72px] sm:w-24 sm:h-24"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              className={cn(
                'absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md border border-[var(--color-border)] transition-colors',
                isSaved
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white/95 backdrop-blur text-gray-400 hover:text-[var(--color-primary)]'
              )}
              onClick={handleSave}
              aria-label={isSaved ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
