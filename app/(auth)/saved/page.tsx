'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { IdeaList } from '@/components/ideas/IdeaList';
import { useLanguage } from '@/lib/i18n';
import type { Idea } from '@/types';

export default function SavedIdeasPage() {
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchSavedIdeas() {
      try {
        const res = await fetch('/api/saved');
        if (res.ok) {
          const data = await res.json();
          setIdeas(data.data || []);
          setTotalCount(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching saved ideas:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedIdeas();
  }, []);

  const handleUnsave = async (ideaId: string) => {
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });

      if (res.ok) {
        setIdeas(ideas.filter((idea) => idea.id !== ideaId));
        setTotalCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error unsaving idea:', error);
    }
  };

  const handleVote = async (ideaId: string) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIdeas(ideas.map((idea) => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              voteCount: data.data.newVoteCount,
              userVote: data.data.hasVoted ? 1 : 0,
            };
          }
          return idea;
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t.nav.saved}
        </h1>
        <p className="text-[var(--text-secondary)]">
          {t.dashboard.savedIdeas}
        </p>
      </motion.div>

      {/* Count Badge */}
      <div className="mb-4">
        <Badge variant="default">
          {totalCount} {t.dashboard.savedIdeas}
        </Badge>
      </div>

      {/* Ideas List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">{t.common.loading}</p>
          </Card>
        ) : ideas.length > 0 ? (
          <IdeaList
            ideas={ideas}
            onVote={handleVote}
            onSave={handleUnsave}
          />
        ) : (
          <Card className="p-8 text-center">
            <Bookmark className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {t.ideas.noResults}
            </h3>
            <p className="text-[var(--text-secondary)]">
              {t.ideas.noResultsDesc}
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
