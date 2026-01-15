'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X, Star, StarOff, Eye, Filter, Bot, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Idea, IdeaStatus } from '@/types';

const statusFilters: { value: IdeaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'built', label: 'Built' },
];

export default function ModeratePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('pending');
  const [totalCount, setTotalCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, [statusFilter]);

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    setGenerateResult(null);
    try {
      const res = await fetch('/api/cron/generate-ideas', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setGenerateResult({
          success: true,
          message: `Đã tạo ${data.ideas?.length || 0} ý tưởng mới!`,
        });
        // Refresh the ideas list
        fetchIdeas();
      } else {
        setGenerateResult({
          success: false,
          message: data.error || 'Không thể tạo ý tưởng',
        });
      }
    } catch (error) {
      setGenerateResult({
        success: false,
        message: 'Lỗi kết nối',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      params.set('limit', '50');

      const res = await fetch(`/api/admin/ideas?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.data || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (ideaId: string, status: IdeaStatus) => {
    try {
      const res = await fetch(`/api/admin/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setIdeas(ideas.map((idea) =>
          idea.id === ideaId ? { ...idea, status } : idea
        ));
      }
    } catch (error) {
      console.error('Error updating idea status:', error);
    }
  };

  const handleToggleFeatured = async (ideaId: string, isFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured }),
      });

      if (res.ok) {
        setIdeas(ideas.map((idea) =>
          idea.id === ideaId ? { ...idea, isFeatured } : idea
        ));
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <Shield className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Moderate Ideas
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Review and manage submitted ideas
        </p>
      </motion.div>

      {/* Mr Idea Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                  Mr Idea 🤖
                  <Badge variant="primary" size="sm">Auto Generator</Badge>
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Tự động sinh 10 ý tưởng mới mỗi ngày lúc 6h sáng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {generateResult && (
                <span className={`text-sm ${generateResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {generateResult.message}
                </span>
              )}
              <Button
                onClick={handleGenerateIdeas}
                disabled={isGenerating}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo 10 ý tưởng ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 mb-6 overflow-x-auto pb-2"
      >
        <Filter className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </motion.div>

      {/* Count Badge */}
      <div className="mb-4">
        <Badge variant="default">
          {totalCount} idea{totalCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Ideas List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">Loading...</p>
          </Card>
        ) : ideas.length > 0 ? (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <Card key={idea.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <UserAvatar
                    src={idea.user?.image}
                    name={idea.user?.name || 'Anonymous'}
                    size="md"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="primary" size="sm">
                        {idea.category?.icon} {idea.category?.name}
                      </Badge>
                      <Badge size="sm" className={getStatusColor(idea.status)}>
                        {getStatusLabel(idea.status)}
                      </Badge>
                      {idea.isFeatured && (
                        <Badge variant="warning" size="sm">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <Link href={`/ideas/${idea.id}`}>
                      <h3 className="font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] line-clamp-1">
                        {idea.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-1">
                      {idea.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                      <span>by {idea.user?.name}</span>
                      <span>{formatRelativeTime(idea.createdAt)}</span>
                      <span>{idea.voteCount} votes</span>
                      <span>{idea.commentCount} comments</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link href={`/ideas/${idea.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFeatured(idea.id, !idea.isFeatured)}
                      >
                        {idea.isFeatured ? (
                          <StarOff className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {idea.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(idea.id, 'approved')}
                          className="text-green-600 border-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(idea.id, 'rejected')}
                          className="text-red-600 border-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {idea.status === 'approved' && (
                      <select
                        value={idea.status}
                        onChange={(e) => handleUpdateStatus(idea.id, e.target.value as IdeaStatus)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="approved">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="built">Built</option>
                        <option value="rejected">Reject</option>
                      </select>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No ideas to moderate
            </h3>
            <p className="text-[var(--text-secondary)]">
              {statusFilter === 'pending'
                ? 'All pending ideas have been reviewed.'
                : 'No ideas match the selected filter.'}
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
