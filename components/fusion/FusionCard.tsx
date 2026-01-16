'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, ArrowRight, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import type { FusedIdea, Idea } from '@/types';

interface FusionCardProps {
  fusion: FusedIdea;
  onVote?: () => void;
  hasVoted?: boolean;
}

export function FusionCard({ fusion, onVote, hasVoted }: FusionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format description with markdown-like rendering
  const formatDescription = (desc: string) => {
    if (!desc) return null;

    return desc.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-lg font-bold text-[var(--text-primary)] mt-4 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-base font-semibold text-[var(--text-primary)] mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // List items
      if (line.match(/^\d+\./)) {
        return (
          <p key={i} className="text-sm text-[var(--text-secondary)] ml-4 my-1">
            {line}
          </p>
        );
      }
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-sm text-[var(--text-secondary)] my-1">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-[var(--text-primary)]">{part}</strong> : part
            )}
          </p>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={i} className="h-2" />;
      }
      // Regular text
      return (
        <p key={i} className="text-sm text-[var(--text-secondary)] my-1">
          {line}
        </p>
      );
    });
  };

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

        {/* Description - Collapsible */}
        <div className="mb-4">
          <AnimatePresence initial={false}>
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
                  {formatDescription(fusion.description)}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-[var(--text-secondary)] line-clamp-3"
              >
                {fusion.description?.split('\n').slice(0, 3).join(' ').replace(/[#*]/g, '')}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Xem chi tiết
              </>
            )}
          </button>
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
