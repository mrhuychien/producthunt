'use client';

import { motion } from 'framer-motion';
import { IdeaCard } from './IdeaCard';
import type { Idea } from '@/types';

interface IdeaListProps {
  ideas: Idea[];
  onVote?: (ideaId: string) => void;
  onSave?: (ideaId: string) => void;
  emptyMessage?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function IdeaList({
  ideas,
  onVote,
  onSave,
  emptyMessage = 'No ideas found',
}: IdeaListProps) {
  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-secondary)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onVote={onVote}
          onSave={onSave}
        />
      ))}
    </motion.div>
  );
}
