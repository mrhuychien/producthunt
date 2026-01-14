'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Crown, Clock, Users } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import type { Battle, Idea } from '@/types';

interface BattleCardProps {
  battle: Battle;
  onVote: (battleId: string, ideaId: string) => void;
  isVoting?: boolean;
}

function IdeaPanel({
  idea,
  votes,
  totalVotes,
  isWinning,
  isSelected,
  onSelect,
  disabled,
}: {
  idea?: Idea;
  votes: number;
  totalVotes: number;
  isWinning: boolean;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 50;

  if (!idea) return null;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'flex-1 p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
        isSelected
          ? 'border-yellow-500 bg-yellow-50'
          : isWinning
            ? 'border-green-300 bg-green-50'
            : 'border-[var(--border)] hover:border-[var(--primary)]',
        disabled && 'cursor-not-allowed opacity-70'
      )}
    >
      {/* Progress bar background */}
      <div
        className={cn(
          'absolute inset-0 transition-all',
          isWinning ? 'bg-green-100' : 'bg-gray-100'
        )}
        style={{ width: `${percentage}%` }}
      />

      <div className="relative z-10">
        {/* Category */}
        <Badge variant="outline" size="sm" className="mb-2 bg-white">
          {idea.category?.icon} {idea.category?.name}
        </Badge>

        {/* Title */}
        <h4 className="font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
          {idea.title}
        </h4>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
          {idea.description?.slice(0, 100)}...
        </p>

        {/* Votes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="font-bold text-lg">{formatNumber(votes)}</span>
            <span className="text-sm text-[var(--text-secondary)]">votes</span>
          </div>
          <span className="text-lg font-bold text-[var(--primary)]">
            {percentage}%
          </span>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" className="bg-yellow-500 text-white">
              ✓ Đã vote
            </Badge>
          </div>
        )}

        {/* Winning crown */}
        {isWinning && totalVotes > 0 && (
          <Crown className="absolute top-2 right-2 w-6 h-6 text-yellow-500" />
        )}
      </div>
    </motion.button>
  );
}

export function BattleCard({ battle, onVote, isVoting }: BattleCardProps) {
  const totalVotes = battle.idea1Votes + battle.idea2Votes;
  const timeLeft = new Date(battle.expiresAt).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

  const isExpired = timeLeft <= 0;
  const idea1Winning = battle.idea1Votes > battle.idea2Votes;
  const idea2Winning = battle.idea2Votes > battle.idea1Votes;

  return (
    <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Swords className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">
              ⚔️ Battle #{battle.id.slice(0, 6)}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Vòng {battle.round} • Tuần {battle.weekNumber}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className={cn(
          'flex items-center gap-1 px-3 py-1 rounded-full text-sm',
          isExpired
            ? 'bg-red-100 text-red-600'
            : 'bg-orange-100 text-orange-600'
        )}>
          <Clock className="w-4 h-4" />
          {isExpired ? (
            <span>Đã kết thúc</span>
          ) : (
            <span>{hoursLeft}h {minutesLeft}m còn lại</span>
          )}
        </div>
      </div>

      {/* VS Section */}
      <div className="flex gap-4 items-stretch">
        <IdeaPanel
          idea={battle.idea1}
          votes={battle.idea1Votes}
          totalVotes={totalVotes}
          isWinning={idea1Winning}
          isSelected={battle.userVote === battle.idea1Id}
          onSelect={() => onVote(battle.id, battle.idea1Id)}
          disabled={isVoting || isExpired || battle.status !== 'active'}
        />

        <div className="flex items-center">
          <div className="px-3 py-2 bg-orange-500 text-white font-bold rounded-full text-sm">
            VS
          </div>
        </div>

        <IdeaPanel
          idea={battle.idea2}
          votes={battle.idea2Votes}
          totalVotes={totalVotes}
          isWinning={idea2Winning}
          isSelected={battle.userVote === battle.idea2Id}
          onSelect={() => onVote(battle.id, battle.idea2Id)}
          disabled={isVoting || isExpired || battle.status !== 'active'}
        />
      </div>

      {/* Total votes */}
      <div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
        Tổng cộng <span className="font-semibold">{formatNumber(totalVotes)}</span> lượt vote
      </div>
    </Card>
  );
}
