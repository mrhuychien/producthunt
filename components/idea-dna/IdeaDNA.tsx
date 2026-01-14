'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dna,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Swords,
  Rocket,
  Flag,
  CheckCircle,
  PlusCircle,
  Loader2,
  Trophy,
  XCircle
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

type DNAEventType =
  | 'created'
  | 'approved'
  | 'vote'
  | 'comment'
  | 'fusion_source'
  | 'battle'
  | 'claimed'
  | 'progress_update'
  | 'completed';

interface DNAEvent {
  id: string;
  type: DNAEventType;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
  details?: Record<string, unknown>;
}

interface DNAStats {
  totalVotes: number;
  totalComments: number;
  totalBattles: number;
  battlesWon: number;
  fusionCount: number;
  builderCount: number;
  isCompleted: boolean;
}

interface IdeaDNAProps {
  ideaId: string;
}

const eventConfig: Record<DNAEventType, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  bgColor: string;
}> = {
  created: {
    icon: PlusCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Ý tưởng được tạo',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Được duyệt',
  },
  vote: {
    icon: ThumbsUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Vote',
  },
  comment: {
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Bình luận',
  },
  fusion_source: {
    icon: Sparkles,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Fusion',
  },
  battle: {
    icon: Swords,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Battle',
  },
  claimed: {
    icon: Rocket,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    label: 'Được claim',
  },
  progress_update: {
    icon: Flag,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'Cập nhật tiến độ',
  },
  completed: {
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Hoàn thành',
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventItem({ event }: { event: DNAEvent }) {
  const config = eventConfig[event.type];
  const Icon = config.icon;

  const getBattleResult = (): React.ReactNode => {
    if (event.type !== 'battle' || !event.details) return null;
    const won = Boolean(event.details.won);
    const opponent = event.details.opponent as { title?: string } | null;
    const opponentTitle = opponent?.title ? String(opponent.title).slice(0, 30) : 'Unknown';
    return (
      <span className={cn('font-medium', won ? 'text-green-600' : 'text-red-600')}>
        {won ? 'Thắng' : 'Thua'} vs &quot;{opponentTitle}...&quot;
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2"
    >
      {/* Icon */}
      <div className={cn('p-1.5 rounded-full', config.bgColor)}>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-[var(--text-primary)]">
            {config.label}
          </span>
          {event.user && (
            <span className="text-xs text-[var(--text-secondary)]">
              bởi {event.user.name}
            </span>
          )}
          {event.type === 'battle' && getBattleResult()}
        </div>

        {/* Details */}
        {event.details?.content !== undefined && event.details?.content !== null ? (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
            &quot;{String(event.details.content)}&quot;
          </p>
        ) : null}
        {event.details?.milestoneTitle !== undefined && event.details?.milestoneTitle !== null ? (
          <Badge variant="outline" size="sm" className="mt-1">
            {String(event.details.milestoneTitle)}
          </Badge>
        ) : null}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDate(event.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

function StatsCard({ stats }: { stats: DNAStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-orange-50 rounded-lg p-3 text-center">
        <ThumbsUp className="w-5 h-5 text-orange-500 mx-auto mb-1" />
        <p className="text-xl font-bold text-orange-600">{stats.totalVotes}</p>
        <p className="text-xs text-orange-500">Votes</p>
      </div>
      <div className="bg-purple-50 rounded-lg p-3 text-center">
        <MessageSquare className="w-5 h-5 text-purple-500 mx-auto mb-1" />
        <p className="text-xl font-bold text-purple-600">{stats.totalComments}</p>
        <p className="text-xs text-purple-500">Comments</p>
      </div>
      <div className="bg-red-50 rounded-lg p-3 text-center">
        <Swords className="w-5 h-5 text-red-500 mx-auto mb-1" />
        <p className="text-xl font-bold text-red-600">
          {stats.battlesWon}/{stats.totalBattles}
        </p>
        <p className="text-xs text-red-500">Battles Won</p>
      </div>
      <div className="bg-cyan-50 rounded-lg p-3 text-center">
        {stats.isCompleted ? (
          <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
        ) : (
          <Rocket className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
        )}
        <p className="text-xl font-bold text-cyan-600">
          {stats.isCompleted ? '1' : stats.builderCount}
        </p>
        <p className="text-xs text-cyan-500">
          {stats.isCompleted ? 'Built' : 'Builders'}
        </p>
      </div>
    </div>
  );
}

export function IdeaDNA({ ideaId }: IdeaDNAProps) {
  const [events, setEvents] = useState<DNAEvent[]>([]);
  const [stats, setStats] = useState<DNAStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchDNA = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}/dna`);
        const data = await response.json();

        if (data.success) {
          setEvents(data.data.events || []);
          setStats(data.data.stats || null);
        } else {
          setError(data.error || 'Failed to load DNA');
        }
      } catch (err) {
        setError('Failed to fetch DNA data');
      } finally {
        setLoading(false);
      }
    };

    fetchDNA();
  }, [ideaId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8 text-red-500">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </Card>
    );
  }

  const displayEvents = showAll ? events : events.slice(-10);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
          <Dna className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">Idea DNA</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Lịch sử phát triển của ý tưởng
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && <StatsCard stats={stats} />}

      {/* Timeline */}
      <div className="border-t border-[var(--border)] pt-4">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Timeline ({events.length} sự kiện)
        </h4>

        {events.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] py-4">
            Chưa có hoạt động nào
          </p>
        ) : (
          <>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {displayEvents.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>

            {events.length > 10 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full mt-3 py-2 text-sm text-[var(--primary)] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Xem tất cả {events.length} sự kiện
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
