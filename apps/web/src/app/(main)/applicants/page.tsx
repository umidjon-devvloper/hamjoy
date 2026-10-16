import { ApplicantsContent } from './ApplicantsContent';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Nomzodlar',
  description: "Eʼlonlaringizga kelgan nomzodlarni koʻring va saralang.",
  path: '/applicants',
  noIndex: true,
});

export default function ApplicantsPage() {
  return <ApplicantsContent />;
}
