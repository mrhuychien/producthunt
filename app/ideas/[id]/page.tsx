'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  Flag,
  Send,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Card, Badge, Textarea } from '@/components/ui';
import { IdeaCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { VoteButton } from '@/components/ideas/VoteButton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import type { Idea, Comment } from '@/types';

export default function IdeaDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const ideaId = params?.id as string;

  // Fetch idea data
  useEffect(() => {
    const fetchIdea = async () => {
      if (!ideaId) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/ideas/${ideaId}`);
        if (res.status === 404) {
          setError('not_found');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch idea');
        }
        const data = await res.json();
        setIdea(data.data);
      } catch (err) {
        setError('Failed to load idea. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!ideaId) return;

      try {
        const res = await fetch(`/api/comments?ideaId=${ideaId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.data || []);
        }
      } catch (err) {
        // Comments fail silently
      }
    };

    if (idea) {
      fetchComments();
    }
  }, [ideaId, idea]);

  const handleVote = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }
    if (!idea) return;

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id }),
      });

      const data = await res.json();
      console.log('Vote response:', res.status, data);

      if (res.ok && data.data) {
        setIdea(prev => prev ? {
          ...prev,
          voteCount: data.data.newVoteCount,
          userVote: data.data.hasVoted ? 1 : 0,
        } : null);
      } else {
        console.error('Vote failed:', data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleSave = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }
    if (!idea) return;

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIdea(prev => prev ? {
          ...prev,
          isSaved: data.data.saved,
        } : null);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleShare = async () => {
    if (!idea) return;

    if (navigator.share) {
      await navigator.share({
        title: idea.title,
        text: idea.description.slice(0, 100) + '...',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session || !idea) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          content: newComment.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.data]);
        setNewComment('');
        // Update comment count
        setIdea(prev => prev ? {
          ...prev,
          commentCount: (prev.commentCount || 0) + 1,
        } : null);
      }
    } catch (err) {
      // Silent fail
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <IdeaCardSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage
            message={t.errors.notFoundDesc}
            title="404"
          />
          <div className="mt-4 text-center">
            <Link href="/ideas">
              <Button variant="primary">{t.landing.ctaBrowse}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage
            message={error || t.common.error}
            onRetry={() => window.location.reload()}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/ideas"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.ideaDetail.backToIdeas}
          </Link>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="primary" icon={<span>{idea.category?.icon}</span>}>
                {idea.category?.name}
              </Badge>
              <Badge variant="success" className={getStatusColor(idea.status)}>
                {getStatusLabel(idea.status)}
              </Badge>
              {idea.isFeatured && (
                <Badge variant="warning">Featured</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6">
              {idea.title}
            </h1>

            {/* Vote + Description */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <VoteButton
                  voteCount={idea.voteCount}
                  hasVoted={idea.userVote === 1}
                  onVote={handleVote}
                  size="lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Description with Markdown-like formatting */}
                <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
                  {idea.description.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return (
                        <h3 key={i} className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-2">
                          {line.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={i} className="ml-4">
                          {line.replace('- ', '')}
                        </li>
                      );
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="mb-2">{line}</p>;
                  })}
                </div>

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {idea.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Author & Actions */}
            <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={idea.user?.image}
                  name={idea.user?.name || 'Anonymous'}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    {idea.user?.name}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Posted {formatRelativeTime(idea.createdAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant={idea.isSaved ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleSave}
                  leftIcon={idea.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                >
                  {idea.isSaved ? t.nav.saved : t.common.save}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  {t.ideaDetail.share}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Flag className="w-4 h-4" />}
                >
                  {t.ideaDetail.report}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t.ideaDetail.commentsTitle} ({comments.length})
            </h2>

            {/* Comment Form */}
            {session ? (
              <div className="mb-8">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t.ideaDetail.addComment}
                  className="mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    isLoading={isSubmittingComment}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    {t.ideaDetail.postComment}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-[var(--surface)] rounded-lg text-center">
                <p className="text-[var(--text-secondary)] mb-2">
                  {t.ideaDetail.signInToComment}
                </p>
                <Link href="/login">
                  <Button size="sm">{t.nav.login}</Button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] py-4">
                  {t.ideaDetail.noComments}
                </p>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <UserAvatar
                      src={comment.user?.image}
                      name={comment.user?.name || 'Anonymous'}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[var(--text-primary)]">
                          {comment.user?.name}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)]">
                        {comment.content}
                      </p>
                      <div className="mt-2">
                        <Button variant="ghost" size="sm">
                          {t.ideaDetail.reply}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
