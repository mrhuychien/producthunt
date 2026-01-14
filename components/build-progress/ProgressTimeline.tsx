'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Image,
  GitCommit,
  Flag,
  CheckCircle,
  Clock,
  Github,
  ExternalLink
} from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ProgressUpdate, BuildClaim, User } from '@/types';

interface ProgressTimelineProps {
  claim: BuildClaim | null;
  updates: ProgressUpdate[];
}

const typeIcons = {
  text: MessageSquare,
  image: Image,
  commit: GitCommit,
  milestone: Flag,
};

const typeColors = {
  text: 'bg-blue-100 text-blue-600',
  image: 'bg-purple-100 text-purple-600',
  commit: 'bg-gray-100 text-gray-600',
  milestone: 'bg-green-100 text-green-600',
};

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ProgressItem({ update }: { update: ProgressUpdate }) {
  const Icon = typeIcons[update.type];
  const colorClass = typeColors[update.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200 last:hidden" />

      {/* Icon */}
      <div
        className={cn(
          'absolute left-0 w-6 h-6 rounded-full flex items-center justify-center',
          colorClass
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {update.user && (
            <>
              <img
                src={update.user.image || '/default-avatar.png'}
                alt={update.user.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-sm text-[var(--text-primary)]">
                {update.user.name}
              </span>
            </>
          )}
          <span className="text-xs text-[var(--text-secondary)]">
            {formatDate(update.createdAt)}
          </span>
        </div>

        {/* Milestone badge */}
        {update.type === 'milestone' && update.milestoneTitle && (
          <Badge variant="success" className="mb-2">
            {update.milestoneTitle}
          </Badge>
        )}

        {/* Content */}
        <p className="text-[var(--text-primary)]">{update.content}</p>

        {/* Image */}
        {update.type === 'image' && update.imageUrl && (
          <img
            src={update.imageUrl}
            alt="Progress screenshot"
            className="mt-3 rounded-lg max-w-full h-auto border border-[var(--border)]"
          />
        )}

        {/* Commit link */}
        {update.type === 'commit' && update.commitUrl && (
          <a
            href={update.commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <GitCommit className="w-4 h-4" />
            Xem commit
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function ProgressTimeline({ claim, updates }: ProgressTimelineProps) {
  if (!claim) {
    return (
      <Card className="p-6 text-center">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-2">
          Chưa có ai claim idea này
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Hãy là người đầu tiên biến ý tưởng này thành hiện thực!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {claim.builder && (
            <>
              <img
                src={claim.builder.image || '/default-avatar.png'}
                alt={claim.builder.name}
                className="w-10 h-10 rounded-full border-2 border-[var(--primary)]"
              />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {claim.builder.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Bắt đầu {formatDate(claim.startedAt)}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {claim.status === 'completed' && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Hoàn thành
            </Badge>
          )}
          {claim.status === 'active' && (
            <Badge variant="warning" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Đang phát triển
            </Badge>
          )}
        </div>
      </div>

      {/* Links */}
      {(claim.githubUrl || claim.liveUrl) && (
        <div className="flex gap-3 mb-6">
          {claim.githubUrl && (
            <a
              href={claim.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          )}
          {claim.liveUrl && (
            <a
              href={claim.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </a>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {updates.length > 0 ? (
          updates.map((update) => (
            <ProgressItem key={update.id} update={update} />
          ))
        ) : (
          <p className="text-center text-[var(--text-secondary)] py-4">
            Chưa có cập nhật nào
          </p>
        )}
      </div>
    </Card>
  );
}
