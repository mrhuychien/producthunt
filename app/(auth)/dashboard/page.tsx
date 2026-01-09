'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Lightbulb,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useLanguage } from '@/lib/i18n';
import type { Idea } from '@/types';

interface Stats {
  ideas: number;
  votesReceived: number;
  comments: number;
  saved: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats>({ ideas: 0, votesReceived: 0, comments: 0, saved: 0 });
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/user/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent ideas
        const ideasRes = await fetch('/api/user/ideas?limit=3');
        if (ideasRes.ok) {
          const ideasData = await ideasRes.json();
          setRecentIdeas(ideasData.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    { label: t.nav.myIdeas, value: stats.ideas, icon: Lightbulb, color: 'text-indigo-600 bg-indigo-100' },
    { label: t.dashboard.totalVotes, value: stats.votesReceived, icon: ThumbsUp, color: 'text-green-600 bg-green-100' },
    { label: t.dashboard.totalComments, value: stats.comments, icon: MessageCircle, color: 'text-blue-600 bg-blue-100' },
    { label: t.dashboard.savedIdeas, value: stats.saved, icon: Bookmark, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <UserAvatar
            src={session?.user?.image}
            name={session?.user?.name || 'User'}
            size="xl"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {t.dashboard.welcome}, {session?.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-[var(--text-secondary)]">
              {t.dashboard.title}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((stat, index) => (
          <Card key={stat.label} className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 sm:p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {isLoading ? '-' : stat.value}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            {t.dashboard.quickActions}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/submit">
              <Button leftIcon={<Lightbulb className="w-4 h-4" />}>
                {t.nav.submitIdea}
              </Button>
            </Link>
            <Link href="/ideas">
              <Button variant="outline" leftIcon={<TrendingUp className="w-4 h-4" />}>
                {t.landing.ctaBrowse}
              </Button>
            </Link>
            <Link href="/saved">
              <Button variant="ghost" leftIcon={<Bookmark className="w-4 h-4" />}>
                {t.nav.saved}
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Recent Ideas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {t.dashboard.recentIdeas}
          </h2>
          <Link href="/my-ideas">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t.landing.viewAll}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">{t.common.loading}</p>
          </Card>
        ) : recentIdeas.length > 0 ? (
          <div className="space-y-4">
            {recentIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} showActions={false} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {t.ideas.noResults}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {t.ideas.beFirst}
            </p>
            <Link href="/submit">
              <Button>{t.landing.ctaSubmit}</Button>
            </Link>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
