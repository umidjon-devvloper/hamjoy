'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreateJobWizard } from '@/components/jobs/create/CreateJobWizard';
import { CreateListingForm } from '@/components/listings/create/CreateListingForm';
import { RequireAuth } from '@/components/auth/RequireAuth';
import type { ListingIntent } from '@/types/listing';

/** ?bitim= presets for the listing form (navbar "Uy-joy ijara", "Soʻrov joylash", …). */
const INTENT_BY_PARAM: Record<string, ListingIntent> = {
  sotuv: 'sotuv',
  ijara: 'ijara',
  kunlik: 'kunlik-ijara',
  olish: 'sotib-olish',
};

/** Single posting entry: /create (or ?tur=uy-joy) → listing form with a category menu, ?tur=ish → job wizard. */
function CreateInner() {
  const searchParams = useSearchParams();
  const editJobId = searchParams.get('edit') ?? undefined;
  const type = searchParams.get('tur');

  // Editing always means a job (only jobs are editable today).
  if (editJobId || type === 'ish') return <CreateJobWizard editJobId={editJobId} />;
  // Default: the Uy-joy form; its left menu also links to the job wizard.
  return <CreateListingForm initialIntent={INTENT_BY_PARAM[searchParams.get('bitim') ?? ''] ?? 'sotuv'} />;
}

export default function CreatePage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <CreateInner />
      </Suspense>
    </RequireAuth>
  );
}
