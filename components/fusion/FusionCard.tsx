'use client';

import { motion } from 'framer-motion';
import { Dna, ArrowRight, ThumbsUp } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import type { FusedIdea, Idea } from '@/types';

interface FusionCardProps {
  fusion: FusedIdea;
  onVote?: () => void;
  hasVoted?: boolean;
}

export function FusionCard({ fusion, onVote, hasVoted }: FusionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Dna className="w-5 h-5 text-purple-600" />
          </div>
          <Badge variant="primary" className="bg-purple-100 text-purple-700">
            🧬 AI Fusion
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {fusion.title}
        </h3>

        {/* Concept */}
        <p className="text-sm text-purple-600 font-medium mb-4">
          {fusion.concept}
        </p>

        {/* Source Ideas */}
        <div className="mb-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            Kết hợp từ:
          </p>
          <div className="flex flex-wrap gap-2">
            {fusion.sourceIdeas?.map((idea, index) => (
              <div key={idea.id} className="flex items-center gap-1">
                <Badge variant="outline" size="sm" className="bg-white">
                  {idea.category?.icon} {idea.title?.slice(0, 30)}...
                </Badge>
                {index < fusion.sourceIdeas.length - 1 && (
                  <span className="text-purple-400">+</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Description Preview */}
        <div className="prose prose-sm max-w-none text-[var(--text-secondary)] mb-4 line-clamp-3">
          {fusion.description?.split('\n')[0]}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onVote}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
              hasVoted
                ? 'bg-green-50 border-green-500 text-green-600'
                : 'bg-white border-purple-200 text-purple-600 hover:border-purple-400'
            )}
          >
            <ThumbsUp className={cn('w-4 h-4', hasVoted && 'fill-current')} />
            <span className="font-semibold">{formatNumber(fusion.voteCount)}</span>
          </motion.button>

          <span className="text-xs text-[var(--text-secondary)]">
            {new Date(fusion.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
