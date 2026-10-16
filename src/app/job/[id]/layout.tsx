import type { Metadata } from 'next';
import { jobs } from '@/data/jobs';
import { createPageMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = jobs.find((item) => item.id === id);

  if (!job) {
    return createPageMetadata({
      title: 'Job not found',
      description: 'This job listing is unavailable.',
      path: `/job/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${job.title} at ${job.companyName}`,
    description: job.description.slice(0, 160),
    path: `/job/${id}`,
  });
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
