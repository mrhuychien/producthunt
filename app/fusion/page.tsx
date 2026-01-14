'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Card, Badge } from '@/components/ui';
import { FusionCard } from '@/components/fusion';
import { useLanguage } from '@/lib/i18n';
import type { FusedIdea } from '@/types';

export default function FusionPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [fusions, setFusions] = useState<FusedIdea[]>([]);
  const [currentFusion, setCurrentFusion] = useState<FusedIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing fusions
  useEffect(() => {
    fetchFusions();
  }, []);

  const fetchFusions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fusion?limit=10');
      if (res.ok) {
        const data = await res.json();
        setFusions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching fusions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFusion = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ random: true, count: 2 }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentFusion(data.data);
        // Add to list
        setFusions(prev => [data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error generating fusion:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVote = async (fusionId: string) => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    // Optimistic update
    setFusions(prev => prev.map(f => {
      if (f.id === fusionId) {
        const hasVoted = f.userVote === 1;
        return {
          ...f,
          voteCount: hasVoted ? f.voteCount - 1 : f.voteCount + 1,
          userVote: hasVoted ? 0 : 1,
        };
      }
      return f;
    }));

    if (currentFusion?.id === fusionId) {
      setCurrentFusion(prev => prev ? {
        ...prev,
        voteCount: prev.userVote === 1 ? prev.voteCount - 1 : prev.voteCount + 1,
        userVote: prev.userVote === 1 ? 0 : 1,
      } : null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
            <Dna className="w-4 h-4" />
            <span className="text-sm font-medium">Tính năng thử nghiệm</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            🧬 AI Idea Fusion
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Kết hợp 2-3 ý tưởng ngẫu nhiên từ cộng đồng để tạo ra concept mới đột phá.
            Kiểu như <span className="text-purple-600 font-medium">"Uber + Tinder cho cây cảnh"</span> = App ghép đôi người bán/mua cây theo sở thích!
          </p>

          {/* Generate Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              onClick={generateFusion}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            >
              {isGenerating ? 'Đang kết hợp ý tưởng...' : '✨ Tạo Fusion mới'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Current Fusion Result */}
        <AnimatePresence mode="wait">
          {currentFusion && (
            <motion.div
              key={currentFusion.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Fusion mới nhất
                </h2>
              </div>
              <FusionCard
                fusion={currentFusion}
                onVote={() => handleVote(currentFusion.id)}
                hasVoted={currentFusion.userVote === 1}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">
              🔬 Cách hoạt động
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl mb-2">🎲</div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Chọn 2-3 ý tưởng ngẫu nhiên từ cộng đồng
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">🧬</div>
                <p className="text-sm text-[var(--text-secondary)]">
                  AI phân tích và kết hợp điểm mạnh
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">💡</div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Tạo ra concept mới độc đáo
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Previous Fusions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            📚 Fusion gần đây
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : fusions.length > 0 ? (
            <div className="space-y-6">
              {fusions.map(fusion => (
                <FusionCard
                  key={fusion.id}
                  fusion={fusion}
                  onVote={() => handleVote(fusion.id)}
                  hasVoted={fusion.userVote === 1}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Dna className="w-12 h-12 mx-auto text-purple-300 mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                Chưa có fusion nào. Hãy tạo cái đầu tiên!
              </p>
              <Button onClick={generateFusion} disabled={isGenerating}>
                {isGenerating ? 'Đang tạo...' : 'Tạo Fusion đầu tiên'}
              </Button>
            </Card>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
