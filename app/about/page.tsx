'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, Button } from '@/components/ui';
import { useLanguage } from '@/lib/i18n';
import {
  Target,
  Lightbulb,
  Users,
  Rocket,
  MessageSquare,
  ThumbsUp,
  Zap,
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  const philosophyItems = [
    {
      icon: MessageSquare,
      title: t.about.philosophy1Title,
      text: t.about.philosophy1Text,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: ThumbsUp,
      title: t.about.philosophy2Title,
      text: t.about.philosophy2Text,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Zap,
      title: t.about.philosophy3Title,
      text: t.about.philosophy3Text,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const stats = [
    { value: '1,000+', label: t.about.statProblems, icon: MessageSquare },
    { value: '5,000+', label: t.about.statUsers, icon: Users },
    { value: '50+', label: t.about.statSolutions, icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-6">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">{t.landing.heroBadge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {t.about.title}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <Card className="p-8 sm:p-12">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 p-4 bg-indigo-100 rounded-2xl">
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  {t.about.missionTitle}
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  {t.about.missionText}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* How We Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <Lightbulb className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  {t.about.howWeStartedTitle}
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  {t.about.howWeStartedText}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] text-center mb-8">
            {t.about.philosophyTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {philosophyItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className={`p-3 rounded-xl ${item.color} w-fit mb-4`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {item.text}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] text-center mb-8">
            {t.about.statsTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-[var(--text-primary)] mb-2">
                    {stat.value}
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    {stat.label}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-indigo-500 to-purple-600 border-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t.about.joinTitle}
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              {t.about.joinText}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/ideas">
                <Button size="lg" variant="outline" className="bg-white text-indigo-600 border-white hover:bg-white/90">
                  {t.landing.ctaBrowse}
                </Button>
              </Link>
              <Link href="/submit">
                <Button size="lg" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {t.landing.ctaSubmit}
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
