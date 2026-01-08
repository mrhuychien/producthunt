'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-8xl font-bold text-[var(--primary)] mb-4"
        >
          404
        </motion.div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Page Not Found
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button leftIcon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>
          <Link href="/ideas">
            <Button variant="outline" leftIcon={<Search className="w-4 h-4" />}>
              Browse Ideas
            </Button>
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
