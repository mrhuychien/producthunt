'use client';

import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-14 h-14 text-lg',
};

export function UserAvatar({
  src,
  name,
  size = 'md',
  className,
}: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeStyles[size],
          className
        )}
      />
    );
  }

  // Fallback to initials
  return (
    <div
      className={cn(
        'rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-medium',
        sizeStyles[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
