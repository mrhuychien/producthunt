'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Clock,
  Code,
  Zap,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface DifficultyData {
  difficultyScore: number;
  estimatedHours: number;
  techStack: string[];
  requiredSkills: string[];
  complexityFactors: string[];
}

interface DifficultyRatingProps {
  ideaId: string;
  compact?: boolean;
}

function formatHours(hours: number): string {
  if (hours < 24) return `${hours} giờ`;
  if (hours < 168) return `${Math.round(hours / 24)} ngày`;
  return `${Math.round(hours / 40)} tuần`;
}

function getDifficultyLabel(score: number): string {
  if (score <= 1.5) return 'Dễ';
  if (score <= 2.5) return 'Trung bình';
  if (score <= 3.5) return 'Khó';
  if (score <= 4.5) return 'Rất khó';
  return 'Cực khó';
}

function getDifficultyColor(score: number): string {
  if (score <= 1.5) return 'text-green-500';
  if (score <= 2.5) return 'text-blue-500';
  if (score <= 3.5) return 'text-yellow-500';
  if (score <= 4.5) return 'text-orange-500';
  return 'text-red-500';
}

function StarRating({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const fullStars = Math.floor(score);
  const hasHalf = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(starSize, 'fill-yellow-400 text-yellow-400')}
        />
      ))}
      {hasHalf && (
        <div className="relative">
          <Star className={cn(starSize, 'text-gray-300')} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(starSize, 'fill-yellow-400 text-yellow-400')} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={cn(starSize, 'text-gray-300')} />
      ))}
    </div>
  );
}

export function DifficultyRating({ ideaId, compact = false }: DifficultyRatingProps) {
  const [data, setData] = useState<DifficultyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRating();
  }, [ideaId]);

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/difficulty`);
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching difficulty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/difficulty`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error refreshing difficulty:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', compact ? 'h-8' : 'h-32')}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StarRating score={data.difficultyScore} size="sm" />
        <span className={cn('text-sm font-medium', getDifficultyColor(data.difficultyScore))}>
          {getDifficultyLabel(data.difficultyScore)}
        </span>
        <span className="text-xs text-gray-500">
          ~{formatHours(data.estimatedHours)}
        </span>
      </div>
    );
  }

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">AI Difficulty Rating</h3>
            <p className="text-xs text-[var(--text-secondary)]">Đánh giá độ khó tự động</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Main Rating */}
      <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold"
          >
            <span className={getDifficultyColor(data.difficultyScore)}>
              {data.difficultyScore}
            </span>
            <span className="text-gray-300">/5</span>
          </motion.div>
          <p className={cn('text-sm font-medium', getDifficultyColor(data.difficultyScore))}>
            {getDifficultyLabel(data.difficultyScore)}
          </p>
        </div>
        <div className="flex-1">
          <StarRating score={data.difficultyScore} />
          <div className="flex items-center gap-1.5 mt-2 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4" />
            <span>Ước tính: <strong>{formatHours(data.estimatedHours)}</strong></span>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      {data.techStack.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-[var(--text-primary)]">
            <Code className="w-4 h-4 text-blue-500" />
            Tech Stack gợi ý
          </div>
          <div className="flex flex-wrap gap-2">
            {data.techStack.map((tech) => (
              <Badge key={tech} variant="outline" size="sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Required Skills */}
      {data.requiredSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-[var(--text-primary)]">
            <Star className="w-4 h-4 text-yellow-500" />
            Kỹ năng cần có
          </div>
          <div className="flex flex-wrap gap-2">
            {data.requiredSkills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary" size="sm">
                {skill}
              </Badge>
            ))}
            {data.requiredSkills.length > 6 && (
              <Badge variant="outline" size="sm">
                +{data.requiredSkills.length - 6}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Complexity Factors */}
      {data.complexityFactors.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-[var(--text-primary)]">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Yếu tố phức tạp
          </div>
          <div className="space-y-1">
            {data.complexityFactors.map((factor) => (
              <div
                key={factor}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
              >
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                {factor}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
