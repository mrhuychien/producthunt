'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Loader2, X } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface InterestedUser {
  id: string;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface StealButtonProps {
  ideaId: string;
  className?: string;
}

export function StealButton({ ideaId, className }: StealButtonProps) {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);
  const [isInterested, setIsInterested] = useState(false);
  const [interests, setInterests] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, [ideaId]);

  const fetchInterests = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/steal`);
      const data = await response.json();

      if (data.success) {
        setCount(data.data.count || 0);
        setInterests(data.data.interests || []);
        setIsInterested(!!data.data.userInterest);
      }
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSteal = async () => {
    if (!session) {
      alert('Vui lòng đăng nhập để đánh dấu quan tâm');
      return;
    }

    setActionLoading(true);
    try {
      if (isInterested) {
        // Remove interest
        const response = await fetch(`/api/ideas/${ideaId}/steal`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          setCount(data.data.count || 0);
          setIsInterested(false);
          fetchInterests();
        }
      } else {
        // Add interest
        const response = await fetch(`/api/ideas/${ideaId}/steal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await response.json();

        if (data.success) {
          setCount(data.data.count || 1);
          setIsInterested(true);
          fetchInterests();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('h-10 w-32 bg-gray-100 animate-pulse rounded-lg', className)} />
    );
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isInterested ? [1, 1.1, 1] : 1 }}
        className={cn('flex items-center gap-2', className)}
      >
        <Button
          onClick={handleSteal}
          disabled={actionLoading}
          variant={isInterested ? 'primary' : 'outline'}
          className={cn(
            'relative overflow-hidden',
            isInterested
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white'
              : 'hover:border-purple-400 hover:text-purple-500'
          )}
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Zap className={cn('w-4 h-4 mr-2', isInterested && 'fill-current')} />
          )}
          {isInterested ? 'Đang quan tâm' : 'Steal Idea'}
        </Button>

        {count > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg cursor-pointer hover:from-orange-200 hover:to-red-200 transition-colors"
          >
            <Users className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-orange-600">{count}</span>
            <span className="text-sm text-orange-500 hidden sm:inline">
              {count === 1 ? 'người' : 'người'} muốn build!
            </span>
          </motion.button>
        )}
      </motion.div>

      {/* Urgency Animation */}
      {count >= 3 && !isInterested && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-8 left-0 right-0 text-center"
        >
          <Badge variant="danger" className="animate-pulse">
            🔥 Nhanh lên! {count} người đang chuẩn bị build!
          </Badge>
        </motion.div>
      )}

      {/* User List Popup */}
      <AnimatePresence>
        {showUsers && interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[var(--border)] p-3 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-[var(--text-primary)]">
                Đang quan tâm
              </span>
              <button
                onClick={() => setShowUsers(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50"
                >
                  <img
                    src={interest.user?.image || '/default-avatar.png'}
                    alt={interest.user?.name || 'User'}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-[var(--text-primary)] truncate">
                    {interest.user?.name || 'Anonymous'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
