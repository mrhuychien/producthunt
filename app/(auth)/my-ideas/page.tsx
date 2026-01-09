'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lightbulb, Plus, Filter } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { useLanguage } from '@/lib/i18n';
import type { Idea, IdeaStatus } from '@/types';

export default function MyIdeasPage() {
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all');
  const [totalCount, setTotalCount] = useState(0);

  const statusFilters: { value: IdeaStatus | 'all'; label: string }[] = [
    { value: 'all', label: t.common.all },
    { value: 'approved', label: t.status.approved },
    { value: 'in_progress', label: t.status.inProgress },
    { value: 'built', label: t.status.built },
    { value: 'pending', label: t.status.pending },
  ];

  useEffect(() => {
    async function fetchIdeas() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') {
          params.set('status', statusFilter);
        }

        const res = await fetch(`/api/user/ideas?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setIdeas(data.data || []);
          setTotalCount(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching ideas:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIdeas();
  }, [statusFilter]);

  const handleDelete = async (ideaId: string) => {
    if (!confirm(t.common.delete + '?')) return;

    try {
      const res = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' });
      if (res.ok) {
        setIdeas(ideas.filter((idea) => idea.id !== ideaId));
        setTotalCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {t.nav.myIdeas}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t.dashboard.totalIdeas}
          </p>
        </div>
        <Link href="/submit">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            {t.nav.submitIdea}
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6 overflow-x-auto pb-2"
      >
        <Filter className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </motion.div>

      {/* Ideas Count */}
      <div className="mb-4">
        <Badge variant="default">
          {totalCount} idea{totalCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Ideas List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">{t.common.loading}</p>
          </Card>
        ) : ideas.length > 0 ? (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="relative group">
                <IdeaCard idea={idea} showActions={false} />
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/ideas/${idea.id}/edit`}>
                    <Button variant="outline" size="sm">
                      {t.common.edit}
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(idea.id)}
                  >
                    {t.common.delete}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {t.ideas.noResults}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {statusFilter === 'all'
                ? t.ideas.beFirst
                : t.ideas.noResultsDesc}
            </p>
            {statusFilter === 'all' && (
              <Link href="/submit">
                <Button>{t.landing.ctaSubmit}</Button>
              </Link>
            )}
          </Card>
        )}
      </motion.div>
    </div>
  );
}
