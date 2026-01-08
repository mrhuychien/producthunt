'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Lightbulb,
  MessageCircle,
  ThumbsUp,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';

interface Analytics {
  totals: {
    users: number;
    ideas: number;
    comments: number;
    votes: number;
  };
  statusCounts: {
    pending: number;
    approved: number;
    rejected: number;
    in_progress: number;
    built: number;
  };
  categoryCounts: Record<string, { count: number; icon: string }>;
  topIdeas: Array<{
    id: string;
    title: string;
    vote_count: number;
    comment_count: number;
    user: { name: string };
  }>;
  weeklyGrowth: {
    users: number;
    ideas: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-[var(--text-secondary)]">Loading analytics...</p>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-[var(--text-secondary)]">Failed to load analytics</p>
        </Card>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: analytics.totals.users, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Total Ideas', value: analytics.totals.ideas, icon: Lightbulb, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Total Comments', value: analytics.totals.comments, icon: MessageCircle, color: 'text-green-600 bg-green-100' },
    { label: 'Total Votes', value: analytics.totals.votes, icon: ThumbsUp, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Analytics Dashboard
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Overview of platform statistics and trends
        </p>
      </motion.div>

      {/* Total Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 sm:p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Weekly Growth
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  +{analytics.weeklyGrowth.users}
                </p>
                <p className="text-sm text-green-600">New Users</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700">
                  +{analytics.weeklyGrowth.ideas}
                </p>
                <p className="text-sm text-indigo-600">New Ideas</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Ideas by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Ideas by Status
            </h2>
            <div className="space-y-3">
              {Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        status === 'approved' ? 'success' :
                        status === 'pending' ? 'warning' :
                        status === 'rejected' ? 'danger' :
                        status === 'built' ? 'secondary' : 'default'
                      }
                      size="sm"
                    >
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ideas by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Ideas by Category
            </h2>
            <div className="space-y-3">
              {Object.entries(analytics.categoryCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{data.icon}</span>
                      <span className="text-[var(--text-primary)]">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full"
                          style={{
                            width: `${(data.count / analytics.totals.ideas) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-medium text-[var(--text-primary)] w-8 text-right">
                        {data.count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </motion.div>

        {/* Top Ideas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Ideas
            </h2>
            <div className="space-y-4">
              {analytics.topIdeas.map((idea, index) => (
                <div key={idea.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] line-clamp-1">
                      {idea.title}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      by {idea.user?.name} • {idea.vote_count} votes • {idea.comment_count} comments
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
