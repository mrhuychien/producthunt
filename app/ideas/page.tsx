'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Badge } from '@/components/ui';
import { IdeaList } from '@/components/ideas';
import { SearchBar, CategoryFilter } from '@/components/shared';
import type { Idea, Category } from '@/types';

// Mock categories
const categories: Category[] = [
  { id: '1', name: 'Tools', slug: 'tools', icon: '🛠', color: '#3B82F6' },
  { id: '2', name: 'Apps', slug: 'apps', icon: '📱', color: '#10B981' },
  { id: '3', name: 'Games', slug: 'games', icon: '🎮', color: '#8B5CF6' },
  { id: '4', name: 'Business', slug: 'business', icon: '📊', color: '#F59E0B' },
  { id: '5', name: 'Design', slug: 'design', icon: '🎨', color: '#EC4899' },
  { id: '6', name: 'Education', slug: 'education', icon: '📚', color: '#EAB308' },
];

// Mock ideas
const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'AI-Powered Code Review Tool',
    description: 'An intelligent tool that automatically reviews code and suggests improvements using machine learning. It can detect bugs, security vulnerabilities, and code smells before they become problems.',
    categoryId: '1',
    category: categories[0],
    userId: '1',
    user: { id: '1', name: 'John Doe', email: 'john@example.com', image: 'https://i.pravatar.cc/150?u=1', role: 'user', createdAt: new Date(), updatedAt: new Date() },
    status: 'approved',
    isFeatured: true,
    voteCount: 234,
    commentCount: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: [{ id: '1', name: 'ai', slug: 'ai' }, { id: '2', name: 'developer-tools', slug: 'developer-tools' }],
  },
  {
    id: '2',
    title: 'Collaborative Whiteboard for Remote Teams',
    description: 'Real-time whiteboard with video chat integration for brainstorming sessions. Includes templates, sticky notes, and export to various formats.',
    categoryId: '2',
    category: categories[1],
    userId: '2',
    user: { id: '2', name: 'Jane Smith', email: 'jane@example.com', image: 'https://i.pravatar.cc/150?u=2', role: 'user', createdAt: new Date(), updatedAt: new Date() },
    status: 'approved',
    isFeatured: false,
    voteCount: 189,
    commentCount: 32,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: [{ id: '3', name: 'collaboration', slug: 'collaboration' }, { id: '4', name: 'remote-work', slug: 'remote-work' }],
  },
  {
    id: '3',
    title: 'Gamified Learning Platform for Kids',
    description: 'Educational games that make learning math and science fun for children aged 6-12. Progress tracking for parents and adaptive difficulty.',
    categoryId: '6',
    category: categories[5],
    userId: '3',
    user: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', image: 'https://i.pravatar.cc/150?u=3', role: 'user', createdAt: new Date(), updatedAt: new Date() },
    status: 'approved',
    isFeatured: false,
    voteCount: 156,
    commentCount: 28,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: [{ id: '5', name: 'education', slug: 'education' }, { id: '6', name: 'games', slug: 'games' }],
  },
  {
    id: '4',
    title: 'Smart Budget Tracker with AI Insights',
    description: 'Personal finance app that automatically categorizes expenses and provides AI-powered insights on spending patterns and savings opportunities.',
    categoryId: '4',
    category: categories[3],
    userId: '4',
    user: { id: '4', name: 'Alice Brown', email: 'alice@example.com', image: 'https://i.pravatar.cc/150?u=4', role: 'user', createdAt: new Date(), updatedAt: new Date() },
    status: 'approved',
    isFeatured: false,
    voteCount: 142,
    commentCount: 19,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: [{ id: '7', name: 'finance', slug: 'finance' }, { id: '8', name: 'ai', slug: 'ai' }],
  },
  {
    id: '5',
    title: 'Design System Generator',
    description: 'Tool that generates a complete design system from a brand kit. Includes color palettes, typography, components, and documentation.',
    categoryId: '5',
    category: categories[4],
    userId: '5',
    user: { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', image: 'https://i.pravatar.cc/150?u=5', role: 'user', createdAt: new Date(), updatedAt: new Date() },
    status: 'in_progress',
    isFeatured: false,
    voteCount: 128,
    commentCount: 24,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    tags: [{ id: '9', name: 'design', slug: 'design' }, { id: '10', name: 'automation', slug: 'automation' }],
  },
];

type SortOption = 'newest' | 'popular' | 'trending';

export default function IdeasPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const filteredIdeas = useMemo(() => {
    let filtered = [...mockIdeas];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchLower) ||
          idea.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((idea) => idea.categoryId === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case 'trending':
        // Simple trending: recent + votes weighted
        filtered.sort((a, b) => {
          const ageA = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
          const ageB = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
          const scoreA = a.voteCount / Math.max(ageA, 1);
          const scoreB = b.voteCount / Math.max(ageB, 1);
          return scoreB - scoreA;
        });
        break;
    }

    return filtered;
  }, [search, selectedCategory, sortBy]);

  const handleVote = (ideaId: string, value: 1 | -1) => {
    // TODO: Implement voting logic with API
    console.log('Vote:', ideaId, value);
  };

  const handleSave = (ideaId: string) => {
    // TODO: Implement save logic with API
    console.log('Save:', ideaId);
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
            Browse Ideas
          </h1>
          <p className="mt-2 text-lg text-[var(--text-secondary)]">
            Discover and vote on the best ideas from the community
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
            <SearchBar onSearch={setSearch} placeholder="Search ideas..." />
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Sort by:</span>
            <div className="flex gap-2">
              {(['popular', 'newest', 'trending'] as SortOption[]).map((option) => (
                <Button
                  key={option}
                  variant={sortBy === option ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4">
          <Badge variant="default">
            {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? 's' : ''} found
          </Badge>
        </div>

        {/* Ideas List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <IdeaList
            ideas={filteredIdeas}
            onVote={handleVote}
            onSave={handleSave}
            emptyMessage="No ideas match your filters. Try adjusting your search or category."
          />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
