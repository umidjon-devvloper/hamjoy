import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Terms of Service',
  description: 'Terms and conditions for using the HamJoy platform.',
  path: '/legal/terms',
});

export default function TermsPage() {
  return (
    <div className="page-container max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-[var(--color-muted)] mb-4">Last updated: June 2026</p>

      <section className="space-y-4 text-[var(--color-secondary)]">
        <p>
          By using HamJoy you agree to these terms. If you do not agree, do not use the
          service.
        </p>

        <h2 className="text-xl font-semibold mt-8">Accounts</h2>
        <p>
          You are responsible for your account credentials and for activity under your account.
          Provide accurate information and keep your password secure.
        </p>

        <h2 className="text-xl font-semibold mt-8">Job listings</h2>
        <p>
          Employers and posters must publish lawful, accurate listings. We may remove content
          that violates these terms or applicable law. Listings may be reviewed before publication.
        </p>

        <h2 className="text-xl font-semibold mt-8">Prohibited conduct</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Spam, scams, or misleading job offers</li>
          <li>Harassment in chat or profile content</li>
          <li>Attempts to bypass security or scrape the platform abusively</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">Limitation of liability</h2>
        <p>
          HamJoy is provided &quot;as is&quot;. We are not a party to employment agreements
          between users. Use listings and messages at your own discretion.
        </p>

        <h2 className="text-xl font-semibold mt-8">Changes</h2>
        <p>
          We may update these terms. Continued use after changes constitutes acceptance of the
          updated terms.
        </p>
      </section>
    </div>
  );
}
