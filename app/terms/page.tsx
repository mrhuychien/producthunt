'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui';
import { useLanguage } from '@/lib/i18n';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
            {t.terms.title}
          </h1>

          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-4">
            <p>{t.terms.lastUpdated}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.terms.section1Title}</h2>
            <p>{t.terms.section1Content}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.terms.section2Title}</h2>
            <p>{t.terms.section2Content}</p>
            <ul className="list-disc ml-6 space-y-2">
              {t.terms.section2List.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.terms.section3Title}</h2>
            <p>{t.terms.section3Content}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.terms.section4Title}</h2>
            <p>{t.terms.section4Content}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.terms.section5Title}</h2>
            <p>{t.terms.section5Content}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.terms.section6Title}</h2>
            <p>{t.terms.section6Content}</p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
