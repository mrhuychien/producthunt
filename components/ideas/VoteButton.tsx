'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface VoteButtonProps {
  voteCount: number;
  userVote?: number; // 1, -1, or 0/undefined
  onVote: (value: 1 | -1) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'px-2 py-1.5 gap-0.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  md: {
    container: 'px-3 py-2 gap-1',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
  lg: {
    container: 'px-4 py-3 gap-1.5',
    icon: 'w-6 h-6',
    text: 'text-lg',
  },
};

export function VoteButton({
  voteCount,
  userVote,
  onVote,
  disabled = false,
  size = 'md',
}: VoteButtonProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn(
      'flex flex-col items-center rounded-lg bg-gray-50 border border-[var(--border)]',
      styles.container
    )}>
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={() => onVote(1)}
        disabled={disabled}
        className={cn(
          'p-1 rounded transition-colors',
          userVote === 1
            ? 'text-[var(--success)] bg-green-50'
            : 'text-[var(--text-secondary)] hover:text-[var(--success)] hover:bg-green-50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <ChevronUp className={styles.icon} />
      </motion.button>

      <motion.span
        key={voteCount}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={cn(
          'font-bold',
          styles.text,
          voteCount > 0 && 'text-[var(--success)]',
          voteCount < 0 && 'text-[var(--danger)]',
          voteCount === 0 && 'text-[var(--text-secondary)]'
        )}
      >
        {formatNumber(voteCount)}
      </motion.span>

      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={() => onVote(-1)}
        disabled={disabled}
        className={cn(
          'p-1 rounded transition-colors',
          userVote === -1
            ? 'text-[var(--danger)] bg-red-50'
            : 'text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-red-50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <ChevronDown className={styles.icon} />
      </motion.button>
    </div>
  );
}
