'use client';

import { useState, useCallback } from 'react';
import type { Comment, PaginatedResponse } from '@/types';

export function useComments(ideaId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/comments?ideaId=${ideaId}`);

      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data: PaginatedResponse<Comment> = await res.json();
      setComments(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [ideaId]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, content, parentId }),
      });

      if (!res.ok) throw new Error('Failed to add comment');

      const newComment: Comment = await res.json();

      if (parentId) {
        // Add as reply
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
              };
            }
            return comment;
          })
        );
      } else {
        // Add as top-level comment
        setComments((prev) => [newComment, ...prev]);
      }

      setTotal((prev) => prev + 1);
    } catch (err) {
      console.error('Add comment error:', err);
      throw err;
    }
  }, [ideaId]);

  const editComment = useCallback(async (commentId: string, content: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error('Failed to edit comment');

      const updatedComment: Comment = await res.json();

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return updatedComment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId ? updatedComment : reply
              ),
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error('Edit comment error:', err);
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete comment');

      setComments((prev) => {
        // Remove top-level comment
        const filtered = prev.filter((comment) => comment.id !== commentId);

        // Remove from replies
        return filtered.map((comment) => {
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== commentId),
            };
          }
          return comment;
        });
      });

      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error('Delete comment error:', err);
      throw err;
    }
  }, []);

  return {
    comments,
    isLoading,
    error,
    total,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
  };
}
