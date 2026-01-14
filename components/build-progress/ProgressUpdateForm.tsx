'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Image,
  GitCommit,
  Flag,
  Loader2,
  Send,
  X
} from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ProgressUpdateType } from '@/types';

interface ProgressUpdateFormProps {
  onSubmit: (data: {
    type: ProgressUpdateType;
    content: string;
    imageUrl?: string;
    commitUrl?: string;
    milestoneTitle?: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

const updateTypes = [
  { type: 'text' as const, label: 'Text', icon: MessageSquare, color: 'bg-blue-100 text-blue-600' },
  { type: 'image' as const, label: 'Screenshot', icon: Image, color: 'bg-purple-100 text-purple-600' },
  { type: 'commit' as const, label: 'Commit', icon: GitCommit, color: 'bg-gray-100 text-gray-600' },
  { type: 'milestone' as const, label: 'Milestone', icon: Flag, color: 'bg-green-100 text-green-600' },
];

export function ProgressUpdateForm({ onSubmit, onCancel }: ProgressUpdateFormProps) {
  const [type, setType] = useState<ProgressUpdateType>('text');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        type,
        content: content.trim(),
        imageUrl: imageUrl || undefined,
        commitUrl: commitUrl || undefined,
        milestoneTitle: milestoneTitle || undefined,
      });
      // Reset form
      setContent('');
      setImageUrl('');
      setCommitUrl('');
      setMilestoneTitle('');
      setType('text');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-[var(--border)] p-4 space-y-4"
    >
      {/* Type selector */}
      <div className="flex gap-2">
        {updateTypes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.type}
              type="button"
              onClick={() => setType(t.type)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                type === t.type
                  ? t.color + ' ring-2 ring-offset-2 ring-current'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Milestone title */}
      {type === 'milestone' && (
        <Input
          placeholder="Tên milestone (VD: MVP hoàn thành)"
          value={milestoneTitle}
          onChange={(e) => setMilestoneTitle(e.target.value)}
        />
      )}

      {/* Content */}
      <Textarea
        placeholder={
          type === 'text'
            ? 'Chia sẻ tiến độ của bạn...'
            : type === 'image'
            ? 'Mô tả screenshot này...'
            : type === 'commit'
            ? 'Mô tả thay đổi trong commit...'
            : 'Mô tả milestone này...'
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
      />

      {/* Type-specific fields */}
      {type === 'image' && (
        <Input
          type="url"
          placeholder="URL hình ảnh"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      )}

      {type === 'commit' && (
        <Input
          type="url"
          placeholder="URL commit (GitHub, GitLab...)"
          value={commitUrl}
          onChange={(e) => setCommitUrl(e.target.value)}
        />
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang đăng...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Đăng cập nhật
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.form>
  );
}
