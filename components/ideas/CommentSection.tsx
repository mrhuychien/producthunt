'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Reply, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Button, Textarea, Card } from '@/components/ui';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatRelativeTime } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentSectionProps {
  ideaId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

export function CommentSection({
  ideaId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim() || !onEditComment) return;
    try {
      await onEditComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!onDeleteComment) return;
    if (!confirm('Delete this comment?')) return;
    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Comments ({comments.length})
      </h2>

      {/* New Comment Form */}
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
            isLoading={isSubmitting && !replyingTo}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Post Comment
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                isEditing={editingId === comment.id}
                editContent={editContent}
                onEditContentChange={setEditContent}
                onStartEdit={() => startEdit(comment)}
                onSaveEdit={() => handleSaveEdit(comment.id)}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditContent('');
                }}
                onDelete={() => handleDelete(comment.id)}
                onStartReply={() => {
                  setReplyingTo(comment.id);
                  setReplyContent('');
                }}
                showActions={!!onEditComment || !!onDeleteComment}
              />

              {/* Reply Form */}
              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-12 mt-4"
                  >
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.user?.name}...`}
                      className="mb-2"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim()}
                        isLoading={isSubmitting && replyingTo === comment.id}
                      >
                        Reply
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4 border-l-2 border-[var(--border)] pl-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                      isEditing={editingId === reply.id}
                      editContent={editContent}
                      onEditContentChange={setEditContent}
                      onStartEdit={() => startEdit(reply)}
                      onSaveEdit={() => handleSaveEdit(reply.id)}
                      onCancelEdit={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      onDelete={() => handleDelete(reply.id)}
                      showActions={!!onEditComment || !!onDeleteComment}
                      isReply
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </Card>
  );
}

// Comment Item Component
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onStartReply?: () => void;
  showActions: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onStartReply,
  showActions,
  isReply = false,
}: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = currentUserId === comment.userId;

  return (
    <div className="flex gap-3">
      <UserAvatar
        src={comment.user?.image}
        name={comment.user?.name || 'Anonymous'}
        size={isReply ? 'sm' : 'md'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-[var(--text-primary)]">
            {comment.user?.name}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div>
            <Textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveEdit}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {!isEditing && (
          <div className="mt-2 flex items-center gap-2">
            {!isReply && onStartReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartReply}
                leftIcon={<Reply className="w-3 h-3" />}
              >
                Reply
              </Button>
            )}

            {showActions && isOwner && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

                {showMenu && (
                  <div className="absolute left-0 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        onStartEdit();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
