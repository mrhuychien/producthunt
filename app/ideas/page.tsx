'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Badge } from '@/components/ui';
import { IdeaListSkeleton } from '@/components/ui/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';
import { IdeaList } from '@/components/ideas';
import { SearchBar, CategoryFilter } from '@/components/shared';
import { useLanguage } from '@/lib/i18n';
import type { Idea, Category } from '@/types';

type SortOption = 'newest' | 'popular' | 'trending';

export default function IdeasPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [totalCount, setTotalCount] = useState(0);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
        }
      } catch (err) {
        // Categories are optional, don't fail the page
      }
    };
    fetchCategories();
  }, []);

  // Fetch ideas with filters
  const fetchIdeas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('sortBy', sortBy);
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);

      const res = await fetch(`/api/ideas?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const data = await res.json();
      setIdeas(data.data || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError('Failed to load ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, sortBy]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleVote = async (ideaId: string, value: 1 | -1) => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, value }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setIdeas(ideas.map(idea => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              voteCount: data.data.newVoteCount,
              userVote: data.data.value,
            };
          }
          return idea;
        }));
      }
    } catch (err) {
      // Silent fail for votes
    }
  };

  const handleSave = async (ideaId: string) => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setIdeas(ideas.map(idea => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              isSaved: data.data.saved,
            };
          }
          return idea;
        }));
      }
    } catch (err) {
      // Silent fail for saves
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {t.ideas.title}
          </h1>
          <p className="mt-2 text-lg text-[var(--text-secondary)]">
            {t.ideas.subtitle}
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="max-w-xl">
            <SearchBar onSearch={handleSearch} placeholder={t.ideas.searchPlaceholder} />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm text-[var(--text-secondary)]">{t.common.sortBy}:</span>
            <div className="flex gap-2">
              {(['popular', 'newest', 'trending'] as SortOption[]).map((option) => (
                <Button
                  key={option}
                  variant={sortBy === option ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy(option)}
                >
                  {t.ideas[option]}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4">
          <Badge variant="default">
            {totalCount} {totalCount !== 1 ? t.ideas.problemsFound : t.ideas.problemFound}
          </Badge>
        </div>

        {/* Ideas List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <IdeaListSkeleton count={5} />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchIdeas} />
          ) : ideas.length > 0 ? (
            <IdeaList
              ideas={ideas}
              onVote={handleVote}
              onSave={handleSave}
              emptyMessage={t.ideas.noResultsDesc}
            />
          ) : (
            <EmptyState
              title={t.ideas.noResults}
              description={search || selectedCategory
                ? t.ideas.noResultsDesc
                : t.ideas.beFirst
              }
              action={
                !search && !selectedCategory ? (
                  <Link href="/submit">
                    <Button>{t.nav.submitIdea}</Button>
                  </Link>
                ) : undefined
              }
            />
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
