'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-[var(--danger)]" />
        </motion.div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Something went wrong!
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" leftIcon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>
        </div>

        {/* Error Details (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-700 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
