'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
            Privacy Policy
          </h1>

          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-4">
            <p>Last updated: January 2025</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">1. Information We Collect</h2>
            <p>When you use IdeaVault, we collect:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Account information (name, email) from Google OAuth</li>
              <li>Ideas and comments you post</li>
              <li>Votes and saved items</li>
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Display your ideas and profile to other users</li>
              <li>Send important notifications about your account</li>
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">3. Data Storage</h2>
            <p>Your data is securely stored using Supabase infrastructure with encryption at rest and in transit.</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">4. Third-Party Services</h2>
            <p>We use:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Google OAuth for authentication</li>
              <li>Supabase for database</li>
              <li>Vercel for hosting</li>
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">5. Your Rights</h2>
            <p>You can request to delete your account and data at any time by contacting us.</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">6. Contact</h2>
            <p>For privacy concerns, please contact us through the platform.</p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
