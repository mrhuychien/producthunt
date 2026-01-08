'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
import { VoteButton } from '@/components/ideas/VoteButton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Idea, Comment } from '@/types';

// Mock data
const mockIdea: Idea = {
  id: '1',
  title: 'AI-Powered Code Review Tool',
  description: `An intelligent tool that automatically reviews code and suggests improvements using machine learning.

## Problem
Code reviews are time-consuming and often inconsistent. Developers spend hours reviewing code when they could be building features.

## Solution
Build an AI-powered tool that:
- Automatically detects bugs and security vulnerabilities
- Suggests code improvements and best practices
- Integrates with GitHub, GitLab, and Bitbucket
- Learns from team preferences over time

## Target Users
- Software development teams
- Open source maintainers
- Individual developers

## Why Now?
With advances in LLMs and code understanding, we can now build tools that truly understand code context and provide meaningful suggestions.`,
  categoryId: '1',
  category: { id: '1', name: 'Tools', slug: 'tools', icon: '🛠', color: '#3B82F6' },
  userId: '1',
  user: { id: '1', name: 'John Doe', email: 'john@example.com', image: 'https://i.pravatar.cc/150?u=1', role: 'user', createdAt: new Date(), updatedAt: new Date() },
  status: 'approved',
  isFeatured: true,
  voteCount: 234,
  commentCount: 3,
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
  tags: [{ id: '1', name: 'ai', slug: 'ai' }, { id: '2', name: 'developer-tools', slug: 'developer-tools' }],
  isSaved: false,
};

const mockComments: Comment[] = [
  {
    id: '1',
    ideaId: '1',
    userId: '2',
    user: { id: '2', name: 'Jane Smith', email: 'jane@example.com', image: 'https://i.pravatar.cc/150?u=2', role: 'user', createdAt: new Date(), updatedAt: new Date() },
    content: 'This is a great idea! I would definitely use this. Have you considered integrating with VS Code directly?',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '2',
    ideaId: '1',
    userId: '3',
    user: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', image: 'https://i.pravatar.cc/150?u=3', role: 'user', createdAt: new Date(), updatedAt: new Date() },
    content: 'I work on a similar project. Would love to collaborate on this. The key challenge is handling different programming languages consistently.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '3',
    ideaId: '1',
    userId: '1',
    user: mockIdea.user,
    content: '@Bob Wilson That would be awesome! Yes, multi-language support is definitely a challenge. I was thinking of using tree-sitter for parsing.',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

export default function IdeaDetailPage() {
  const params = useParams();
  const [idea, setIdea] = useState<Idea>(mockIdea);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleVote = (value: 1 | -1) => {
    // TODO: Implement voting logic with API
    setIdea((prev) => ({
      ...prev,
      voteCount: prev.voteCount + value,
      userVote: value,
    }));
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: idea.title,
        text: idea.description.slice(0, 100) + '...',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    // TODO: Implement comment submission with API
    const comment: Comment = {
      id: String(comments.length + 1),
      ideaId: idea.id,
      userId: '1',
      user: { id: '1', name: 'You', email: 'you@example.com', image: undefined, role: 'user', createdAt: new Date(), updatedAt: new Date() },
      content: newComment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

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
            Back to Ideas
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
                  userVote={idea.userVote}
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
                  variant={isSaved ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleSave}
                  leftIcon={isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Flag className="w-4 h-4" />}
                >
                  Report
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
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <div className="mb-8">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Post Comment
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
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
                        Reply
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
