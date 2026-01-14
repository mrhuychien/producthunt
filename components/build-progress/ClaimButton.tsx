'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Loader2, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ClaimButtonProps {
  ideaId: string;
  isClaimed: boolean;
  isBuilder: boolean;
  onClaim: (githubUrl?: string) => Promise<void>;
  disabled?: boolean;
}

export function ClaimButton({
  ideaId,
  isClaimed,
  isBuilder,
  onClaim,
  disabled = false,
}: ClaimButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      await onClaim(githubUrl || undefined);
      setShowForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isClaimed && !isBuilder) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Đang được phát triển</span>
      </div>
    );
  }

  if (isClaimed && isBuilder) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <Rocket className="w-5 h-5" />
        <span className="font-medium">Bạn đang phát triển idea này</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <Input
          type="url"
          placeholder="Link GitHub repo (tùy chọn)"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleClaim}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Xác nhận Claim
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <Button
      onClick={() => setShowForm(true)}
      disabled={disabled}
      className={cn(
        'bg-gradient-to-r from-green-500 to-emerald-600',
        'hover:from-green-600 hover:to-emerald-700',
        'text-white font-semibold'
      )}
    >
      <Rocket className="w-4 h-4 mr-2" />
      Claim & Bắt đầu Build
    </Button>
  );
}
