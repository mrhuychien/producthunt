'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Idea, IdeaFilters, PaginatedResponse } from '@/types';

interface UseIdeasOptions {
  initialFilters?: IdeaFilters;
  limit?: number;
  autoFetch?: boolean;
}

export function useIdeas(options: UseIdeasOptions = {}) {
  const { initialFilters = {}, limit = 10, autoFetch = true } = options;

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filters, setFilters] = useState<IdeaFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));

      if (filters.category) params.set('category', filters.category);
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.status) params.set('status', filters.status);

      const res = await fetch(`/api/ideas?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch ideas');
      }

      const data: PaginatedResponse<Idea> = await res.json();

      setIdeas(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchIdeas();
    }
  }, [fetchIdeas, autoFetch]);

  const updateFilters = useCallback((newFilters: Partial<IdeaFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const vote = useCallback(async (ideaId: string, value: 1 | -1) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, value }),
      });

      if (!res.ok) throw new Error('Failed to vote');

      const result = await res.json();

      // Optimistic update
      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea.id === ideaId) {
            const prevVote = idea.userVote || 0;
            let newCount = idea.voteCount;

            if (result.action === 'removed') {
              newCount -= prevVote;
            } else {
              newCount = idea.voteCount - prevVote + result.value;
            }

            return {
              ...idea,
              voteCount: newCount,
              userVote: result.value === 0 ? undefined : result.value,
            };
          }
          return idea;
        })
      );
    } catch (err) {
      console.error('Vote error:', err);
    }
  }, []);

  const save = useCallback(async (ideaId: string) => {
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });

      if (!res.ok) throw new Error('Failed to save');

      const result = await res.json();

      // Optimistic update
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId
            ? { ...idea, isSaved: result.isSaved }
            : idea
        )
      );
    } catch (err) {
      console.error('Save error:', err);
    }
  }, []);

  return {
    ideas,
    isLoading,
    error,
    page,
    totalPages,
    total,
    filters,
    setPage,
    updateFilters,
    refetch: fetchIdeas,
    vote,
    save,
  };
}
