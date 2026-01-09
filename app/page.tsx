'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  ThumbsUp,
  Rocket,
  ArrowRight,
  Wrench,
  Smartphone,
  Gamepad2,
  BarChart3,
  Palette,
  GraduationCap,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Card, Badge } from '@/components/ui';
import { VoteButton } from '@/components/ideas/VoteButton';
import { useLanguage } from '@/lib/i18n';

// Mock data for trending ideas
const trendingIdeas = [
  {
    id: '1',
    title: 'AI-Powered Code Review Tool',
    description: 'An intelligent tool that automatically reviews code and suggests improvements using machine learning.',
    voteCount: 234,
    category: { name: 'Tools', icon: '🛠' },
    commentCount: 45,
  },
  {
    id: '2',
    title: 'Collaborative Whiteboard for Remote Teams',
    description: 'Real-time whiteboard with video chat integration for brainstorming sessions.',
    voteCount: 189,
    category: { name: 'Apps', icon: '📱' },
    commentCount: 32,
  },
  {
    id: '3',
    title: 'Gamified Learning Platform for Kids',
    description: 'Educational games that make learning math and science fun for children aged 6-12.',
    voteCount: 156,
    category: { name: 'Education', icon: '📚' },
    commentCount: 28,
  },
];

// Categories
const categories = [
  { name: 'Tools', icon: Wrench, color: 'bg-blue-100 text-blue-700' },
  { name: 'Apps', icon: Smartphone, color: 'bg-green-100 text-green-700' },
  { name: 'Games', icon: Gamepad2, color: 'bg-purple-100 text-purple-700' },
  { name: 'Business', icon: BarChart3, color: 'bg-orange-100 text-orange-700' },
  { name: 'Design', icon: Palette, color: 'bg-pink-100 text-pink-700' },
  { name: 'Education', icon: GraduationCap, color: 'bg-yellow-100 text-yellow-700' },
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="primary" size="lg" className="mb-6">
                {t.landing.heroTitle}
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
                {t.landing.heroTitle}
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                {t.landing.heroSubtitle}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/submit">
                  <Button size="lg" rightIcon={<Lightbulb className="w-5 h-5" />}>
                    {t.landing.ctaSubmit}
                  </Button>
                </Link>
                <Link href="/ideas">
                  <Button size="lg" variant="outline" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    {t.landing.ctaBrowse}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                {t.landing.howItWorks}
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {/* Step 1 */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 text-center h-full">
                  <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                    <Lightbulb className="w-8 h-8 text-[var(--primary)]" />
                  </div>
                  <div className="text-sm font-medium text-[var(--primary)] mb-2">1</div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    {t.landing.step1Title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {t.landing.step1Desc}
                  </p>
                </Card>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 text-center h-full">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                    <ThumbsUp className="w-8 h-8 text-[var(--success)]" />
                  </div>
                  <div className="text-sm font-medium text-[var(--success)] mb-2">2</div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    {t.landing.step2Title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {t.landing.step2Desc}
                  </p>
                </Card>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 text-center h-full">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                    <Rocket className="w-8 h-8 text-[var(--secondary)]" />
                  </div>
                  <div className="text-sm font-medium text-[var(--secondary)] mb-2">3</div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    {t.landing.step3Title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {t.landing.step3Desc}
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trending Ideas Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                  {t.landing.trendingIdeas}
                </h2>
              </div>
              <Link href="/ideas">
                <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t.landing.viewAll}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {trendingIdeas.map((idea) => (
                <motion.div key={idea.id} variants={fadeInUp}>
                  <Card hover className="p-6 h-full">
                    <div className="flex gap-4">
                      <VoteButton
                        voteCount={idea.voteCount}
                        onVote={() => {}}
                        size="sm"
                      />
                      <div className="flex-1">
                        <Badge variant="primary" size="sm" className="mb-2">
                          {idea.category.icon} {idea.category.name}
                        </Badge>
                        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2 mb-2">
                          {idea.title}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                          {idea.description}
                        </p>
                        <div className="mt-4 text-sm text-[var(--text-secondary)]">
                          💬 {idea.commentCount} {t.ideas.comments}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                {t.landing.categories}
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {categories.map((category) => (
                <motion.div key={category.name} variants={fadeInUp}>
                  <Link href={`/ideas?category=${category.name.toLowerCase()}`}>
                    <Card hover className="p-6 text-center">
                      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${category.color}`}>
                        <category.icon className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">
                        {category.name}
                      </span>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-8 md:p-16 text-center text-white"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t.landing.ctaSubmit}
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                {t.landing.heroSubtitle}
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-[var(--primary)] border-white hover:bg-white/90"
                >
                  {t.nav.login}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
