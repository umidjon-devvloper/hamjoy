'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Bookmark,
  MapPin,
  DollarSign,
  Clock,
  MessageCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/components/jobs/JobCard';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobDetailSkeleton } from '@/components/ui/LoadingState';
import { useJob } from '@/hooks/useJob';
import { useFavorites } from '@/context/FavoritesContext';
import { useApplications } from '@/context/ApplicationsContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useChats } from '@/context/ChatsContext';
import { appToast } from '@/lib/feedback/toast';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { JobDetailMapPreview } from '@/components/map/JobDetailMapPreview';
import { mapService } from '@/services';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { formatUserError } from '@/lib/errors/format-user-error';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { job, similarJobs, rawJob, isLoading, error, refetch } = useJob(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isApplied, apply } = useApplications();
  const { refresh: refreshNotifications } = useNotifications();
  const { getOrCreateChatForJob } = useChats();
  const { isAuthenticated } = useAuth();
  const [showApply, setShowApply] = useState(false);

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (!job || !rawJob) {
    return (
      <div className="page-container min-h-screen flex items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          title={error ? 'Yuklab boʻlmadi' : 'Ish topilmadi'}
          description={
            error
              ? formatUserError(error)
              : "Bu e'lon oʻchirilgan yoki mavjud emas."
          }
          action={
            error ? (
              <Button onClick={() => refetch()}>Qayta urinish</Button>
            ) : (
              <Button onClick={() => router.push('/search')}>Qidiruvga qaytish</Button>
            )
          }
        />
      </div>
    );
  }

  const isSaved = isFavorite(job.id);
  const currentUserId = authService.getOptionalUserId();
  const isOwnJob = currentUserId !== null && rawJob.posterId === currentUserId;
  const alreadyApplied = isApplied(job.id);

  const openApply = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setShowApply(true);
  };

  const submitApply = async (coverNote: string) => {
    try {
      await apply(job.id, coverNote || undefined);
      refreshNotifications();
      appToast.success('Arizangiz yuborildi! ✅');
      setShowApply(false);
    } catch (err) {
      appToast.error(err, 'Ariza yuborishda xatolik');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const newState = await toggleFavorite(job.id);
    appToast.favoriteToggled(newState);
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const userId = authService.getCurrentUserId();
    if (rawJob.posterId === userId) {
      router.push('/chat');
      appToast.info("E'loningizga kelgan xabarlarni suhbatlar boʻlimida koʻring.");
      return;
    }

    const chat = await getOrCreateChatForJob(job.id);
    if (chat) {
      router.push(`/chat/${chat.id}`);
    } else {
      appToast.error(null, 'Suhbatni boshlab boʻlmadi.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-28">
      <div className="h-44 sm:h-52 bg-gradient-to-br from-[var(--color-primary)] to-blue-700 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              'w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center transition-colors',
              isSaved ? 'bg-white text-[var(--color-primary)]' : 'bg-white/20 text-white hover:bg-white/30'
            )}
            aria-label="Save job"
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 relative -top-14 max-w-2xl mx-auto">
        <div className="card p-5 sm:p-6 flex flex-col items-center text-center shadow-[var(--shadow-card-hover)]">
          <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl flex items-center justify-center -mt-14 mb-4 shadow-md border-4 border-white">
            <Image src={job.logo} alt="" width={48} height={48} className="object-contain" aria-hidden />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary)] mb-1">
            {job.title}
          </h1>
          <p className="text-[var(--color-muted)] font-medium mb-4">{job.company}</p>

          <div className="flex flex-wrap justify-center gap-1.5 mb-5">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="w-full grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-5">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-1.5">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase">Joylashuv</span>
              <span className="text-xs font-medium text-[var(--color-secondary)] mt-0.5 text-center">
                {job.location}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center mb-1.5">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase">Maosh</span>
              <span className="text-xs font-medium text-[var(--color-success)] mt-0.5 text-center">
                {job.salary}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center mb-1.5">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase">Eʼlon</span>
              <span className="text-xs font-medium text-[var(--color-secondary)] mt-0.5 text-center">
                {job.postedAt}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6 mt-2 max-w-2xl mx-auto space-y-6">
        <JobDetailMapPreview
          marker={mapService.getMarkerForJob(job.id)}
          isRemote={rawJob.location.isRemote}
          locationLabel={job.location}
        />

        <div className="card p-5 sm:p-6">
          <h2 className="text-base font-bold text-[var(--color-secondary)] mb-3">Ish tavsifi</h2>
          <div className="text-[var(--color-muted)] leading-relaxed space-y-3 text-sm">
            <p>{job.description}</p>
            {rawJob.requirements.length > 0 && (
              <ul className="list-disc pl-5 space-y-1.5">
                {rawJob.requirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {similarJobs.length > 0 && (
          <section>
            <SectionHeader title="Oʻxshash ishlar" />
            <div className="flex flex-col gap-3">
              {similarJobs.map((similar, index) => (
                <JobCard key={similar.id} job={similar} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-[var(--color-border)] z-50">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button variant="outline" size="lg" className="gap-2 shrink-0" onClick={handleContact}>
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Bogʻlanish</span>
          </Button>
          {isOwnJob ? (
            <Button size="lg" variant="outline" className="flex-1" disabled>
              Bu sizning eʼloningiz
            </Button>
          ) : alreadyApplied ? (
            <Button size="lg" className="flex-1 gap-2" disabled>
              <Check className="w-5 h-5" />
              Ariza yuborilgan
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={openApply}>
              Ariza yuborish
            </Button>
          )}
        </div>
      </div>

      <ApplyModal
        open={showApply}
        jobTitle={job.title}
        company={job.company}
        onClose={() => setShowApply(false)}
        onSubmit={submitApply}
      />
    </div>
  );
}
