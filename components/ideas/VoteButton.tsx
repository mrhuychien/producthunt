'use client';

import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface VoteButtonProps {
  voteCount: number;
  hasVoted?: boolean;
  onVote: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'px-2.5 py-1.5 gap-1.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  md: {
    container: 'px-3 py-2 gap-2',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
  lg: {
    container: 'px-4 py-2.5 gap-2',
    icon: 'w-6 h-6',
    text: 'text-lg',
  },
};

export function VoteButton({
  voteCount,
  hasVoted,
  onVote,
  disabled = false,
  size = 'md',
}: VoteButtonProps) {
  const styles = sizeStyles[size];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('VoteButton clicked, disabled:', disabled);
    if (!disabled && onVote) {
      onVote();
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center rounded-lg border transition-all',
        styles.container,
        hasVoted
          ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
          : 'bg-gray-50 border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <ThumbsUp className={cn(styles.icon, hasVoted && 'fill-current')} />
      <motion.span
        key={voteCount}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={cn('font-semibold', styles.text)}
      >
        {formatNumber(voteCount)}
      </motion.span>
    </motion.button>
  );
}
