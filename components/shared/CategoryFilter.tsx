'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onSelect: (categoryId: string | undefined) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* All Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(undefined)}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          !selectedCategory
            ? 'bg-[var(--primary)] text-white'
            : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
        )}
      >
        All
      </motion.button>

      {/* Category Buttons */}
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(category.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
            selectedCategory === category.id
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
          )}
        >
          <span>{category.icon}</span>
          {category.name}
        </motion.button>
      ))}
    </div>
  );
}
