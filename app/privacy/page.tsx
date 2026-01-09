'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui';
import { useLanguage } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
            {t.privacy.title}
          </h1>

          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-4">
            <p>{t.privacy.lastUpdated}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.privacy.section1Title}</h2>
            <p>{t.privacy.section1Content}</p>
            <ul className="list-disc ml-6 space-y-2">
              {t.privacy.section1List.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.privacy.section2Title}</h2>
            <p>{t.privacy.section2Content}</p>
            <ul className="list-disc ml-6 space-y-2">
              {t.privacy.section2List.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.privacy.section3Title}</h2>
            <p>{t.privacy.section3Content}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.privacy.section4Title}</h2>
            <p>{t.privacy.section4Content}</p>
            <ul className="list-disc ml-6 space-y-2">
              {t.privacy.section4List.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.privacy.section5Title}</h2>
            <p>{t.privacy.section5Content}</p>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-6">{t.privacy.section6Title}</h2>
            <p>{t.privacy.section6Content}</p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
