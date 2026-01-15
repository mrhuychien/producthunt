'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Loader2,
  Plus,
  X,
  Gift,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface BountyUser {
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
  amount: number;
  message?: string;
}

interface BountyCardProps {
  ideaId: string;
  compact?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + '₫';
}

export function BountyCard({ ideaId, compact = false }: BountyCardProps) {
  const { data: session } = useSession();
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [bounties, setBounties] = useState<BountyUser[]>([]);
  const [userBounty, setUserBounty] = useState<{ amount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeMessage, setPledgeMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showBackers, setShowBackers] = useState(false);

  useEffect(() => {
    fetchBounties();
  }, [ideaId]);

  const fetchBounties = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/bounty`);
      const data = await response.json();

      if (data.success) {
        setTotal(data.data.total || 0);
        setCount(data.data.count || 0);
        setBounties(data.data.bounties || []);
        setUserBounty(data.data.userBounty || null);
      }
    } catch (error) {
      console.error('Error fetching bounties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePledge = async () => {
    if (!session) {
      alert('Vui lòng đăng nhập để pledge bounty');
      return;
    }

    const amount = parseInt(pledgeAmount);
    if (!amount || amount < 10000) {
      alert('Vui lòng nhập số tiền từ 10.000₫ trở lên');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/bounty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          message: pledgeMessage || undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setTotal(data.data.total);
        setUserBounty({ amount });
        setShowPledgeForm(false);
        setPledgeAmount('');
        setPledgeMessage('');
        fetchBounties();
      } else {
        alert(data.error || 'Không thể pledge bounty');
      }
    } catch (error) {
      console.error('Error pledging:', error);
      alert('Không thể pledge bounty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPledge = async () => {
    if (!confirm('Bạn có chắc muốn hủy pledge?')) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/bounty`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setTotal(data.data.total);
        setUserBounty(null);
        fetchBounties();
      }
    } catch (error) {
      console.error('Error cancelling:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', compact ? 'h-10' : 'h-32')}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 rounded-lg">
          <Banknote className="w-4 h-4 text-green-600" />
          <span className="font-bold text-green-600">{formatCurrency(total)}</span>
        </div>
        {count > 0 && (
          <span className="text-xs text-gray-500">{count} người hỗ trợ</span>
        )}
      </div>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Bounty Pool</h3>
            <p className="text-xs text-[var(--text-secondary)]">Hỗ trợ idea được xây dựng</p>
          </div>
        </div>
        {total > 0 && (
          <Badge variant="success" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Hot
          </Badge>
        )}
      </div>

      {/* Total Amount */}
      <div className="text-center py-4 mb-4 bg-white rounded-xl">
        <motion.div
          key={total}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-green-600"
        >
          {formatCurrency(total)}
        </motion.div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          từ {count} {count === 1 ? 'người' : 'người'} hỗ trợ
        </p>
      </div>

      {/* Pledge Button or Form */}
      {!showPledgeForm ? (
        <div className="space-y-2">
          {userBounty ? (
            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
              <span className="text-sm text-green-700">
                Bạn đã pledge <strong>{formatCurrency(userBounty.amount)}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelPledge}
                disabled={submitting}
                className="text-red-500 hover:text-red-600"
              >
                Hủy
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowPledgeForm(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Pledge Bounty
            </Button>
          )}

          {count > 0 && (
            <button
              onClick={() => setShowBackers(!showBackers)}
              className="w-full py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              {showBackers ? 'Ẩn danh sách' : `Xem ${count} người đã pledge`}
            </button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Số tiền (VND)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₫</span>
              <Input
                type="number"
                min="10000"
                max="100000000"
                step="10000"
                placeholder="50000"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Tối thiểu 10.000₫</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Lời nhắn (tùy chọn)
            </label>
            <Input
              placeholder="Tôi rất muốn thấy app này!"
              value={pledgeMessage}
              onChange={(e) => setPledgeMessage(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePledge}
              disabled={submitting || !pledgeAmount}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Pledge {pledgeAmount ? formatCurrency(parseInt(pledgeAmount)) : ''}</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPledgeForm(false)}
              disabled={submitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Backers List */}
      <AnimatePresence>
        {showBackers && bounties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-green-200"
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bounties.map((bounty, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg"
                >
                  <img
                    src={bounty.user?.image || '/default-avatar.png'}
                    alt={bounty.user?.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                      {bounty.user?.name || 'Anonymous'}
                    </p>
                    {bounty.message && (
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        &quot;{bounty.message}&quot;
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(bounty.amount)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer note */}
      <p className="text-xs text-center text-gray-500 mt-4">
        * Bounty là cam kết. Thanh toán khi idea được hoàn thành.
      </p>
    </Card>
  );
}
