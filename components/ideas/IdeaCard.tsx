'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { VoteButton } from './VoteButton';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import type { Idea } from '@/types';

interface IdeaCardProps {
  idea: Idea;
  onVote?: (ideaId: string) => void;
  onSave?: (ideaId: string) => void;
  showActions?: boolean;
}

export function IdeaCard({
  idea,
  onVote,
  onSave,
  showActions = true,
}: IdeaCardProps) {
  const handleVote = () => {
    if (onVote) {
      onVote(idea.id);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(idea.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover variant="bordered" className="p-4">
        <div className="flex gap-4">
          {/* Vote Section */}
          <VoteButton
            voteCount={idea.voteCount}
            hasVoted={idea.userVote === 1}
            onVote={handleVote}
            disabled={!onVote}
            size="md"
          />

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Top Row: Category & Save */}
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant="primary"
                size="sm"
                icon={<span>{idea.category?.icon}</span>}
              >
                {idea.category?.name}
              </Badge>

              {showActions && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    idea.isSaved
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                      : 'text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-gray-100'
                  )}
                >
                  {idea.isSaved ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </motion.button>
              )}
            </div>

            {/* Title */}
            <Link href={`/ideas/${idea.id}`}>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-2">
                {idea.title}
              </h3>
            </Link>

            {/* Description */}
            <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
              {truncate(idea.description, 150)}
            </p>

            {/* Meta Info */}
            <div className="mt-3 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              {/* Author */}
              <div className="flex items-center gap-2">
                {idea.user?.image && (
                  <img
                    src={idea.user.image}
                    alt={idea.user.name}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span>{idea.user?.name || 'Anonymous'}</span>
              </div>

              {/* Date */}
              <span>{formatRelativeTime(idea.createdAt)}</span>

              {/* Comments */}
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{idea.commentCount || 0}</span>
              </div>
            </div>

            {/* Tags */}
            {idea.tags && idea.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {idea.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="outline" size="sm">
                    #{tag.name}
                  </Badge>
                ))}
                {idea.tags.length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{idea.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
