import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description: 'How HamJoy collects, uses, and protects your personal information.',
  path: '/legal/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="page-container max-w-3xl prose prose-gray">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-[var(--color-muted)] mb-4">Last updated: June 2026</p>

      <section className="space-y-4 text-[var(--color-secondary)]">
        <p>
          HamJoy (&quot;we&quot;, &quot;our&quot;) provides a job listing and messaging platform.
          This policy explains what data we process when you use our website and services.
        </p>

        <h2 className="text-xl font-semibold mt-8">Information we collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Account details: name, email, phone, profile information</li>
          <li>Job listings and messages you create</li>
          <li>Usage data: pages visited, device type, approximate location for map features</li>
          <li>Authentication cookies required to keep you signed in</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">How we use data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide search, favorites, chat, and job posting features</li>
          <li>Secure accounts and prevent abuse</li>
          <li>Improve the product and fix errors</li>
          <li>Send service notifications you opt into</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">Sharing</h2>
        <p>
          We do not sell your personal data. We share information only with infrastructure
          providers (hosting, database, email) required to operate the service, or when required
          by law.
        </p>

        <h2 className="text-xl font-semibold mt-8">Your rights</h2>
        <p>
          You may request access, correction, or deletion of your account data by contacting
          support. You can update profile details in Settings at any time.
        </p>

        <h2 className="text-xl font-semibold mt-8">Contact</h2>
        <p>For privacy requests, email: privacy@hamjoy.example</p>
      </section>
    </div>
  );
}
