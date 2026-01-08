'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message = 'An error occurred while loading the content. Please try again.',
  onRetry,
}: ErrorMessageProps) {
  return (
    <Card className="p-8 text-center">
      <AlertCircle className="w-12 h-12 mx-auto text-[var(--danger)] mb-4" />
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] mb-4">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </Card>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      {icon && (
        <div className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--text-secondary)] mb-4">
          {description}
        </p>
      )}
      {action}
    </Card>
  );
}
