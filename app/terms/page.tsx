'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
            Terms of Service
          </h1>

          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-4">
            <p>Last updated: January 2025</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">1. Acceptance of Terms</h2>
            <p>By accessing and using IdeaVault, you agree to be bound by these Terms of Service.</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">2. Use of Service</h2>
            <p>You may use IdeaVault to share ideas, vote on ideas, and engage with the community. You agree not to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Post spam or misleading content</li>
              <li>Harass or abuse other users</li>
              <li>Violate any applicable laws</li>
              <li>Attempt to hack or disrupt the service</li>
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">3. User Content</h2>
            <p>You retain ownership of ideas you submit. By posting, you grant IdeaVault a license to display your content on the platform.</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">4. Account</h2>
            <p>You are responsible for maintaining the security of your account and all activities under it.</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">5. Changes</h2>
            <p>We may update these terms at any time. Continued use of the service constitutes acceptance of updated terms.</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">6. Contact</h2>
            <p>For questions about these terms, please contact us through the platform.</p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
