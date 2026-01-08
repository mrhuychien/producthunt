'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

// Pre-built skeleton components
export function IdeaCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex gap-4">
        {/* Vote skeleton */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-10 h-20 rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-3" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function IdeaListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <IdeaCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-start gap-6">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}
