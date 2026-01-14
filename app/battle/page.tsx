'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Plus, Loader2, Crown } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { BattleCard } from '@/components/battle';
import { useLanguage } from '@/lib/i18n';
import { useSession } from 'next-auth/react';
import type { Battle, Idea } from '@/types';

interface ChampionData {
  idea: Idea;
  wins: number;
}

export default function BattlePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [champion, setChampion] = useState<ChampionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [votingBattleId, setVotingBattleId] = useState<string | null>(null);

  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      const response = await fetch('/api/battles');
      const data = await response.json();

      if (data.success) {
        setBattles(data.data.battles || []);
        setChampion(data.data.champion || null);
      }
    } catch (error) {
      console.error('Error fetching battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBattle = async () => {
    if (!session) {
      alert('Vui lòng đăng nhập để tạo trận đấu');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success) {
        fetchBattles();
      } else {
        alert(data.error || 'Không thể tạo trận đấu');
      }
    } catch (error) {
      console.error('Error creating battle:', error);
      alert('Không thể tạo trận đấu');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (battleId: string, ideaId: string) => {
    if (!session) {
      alert('Vui lòng đăng nhập để vote');
      return;
    }

    setVotingBattleId(battleId);
    try {
      const response = await fetch(`/api/battles/${battleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });
      const data = await response.json();

      if (data.success) {
        // Update local state
        setBattles(prev => prev.map(battle => {
          if (battle.id === battleId) {
            return {
              ...battle,
              idea1Votes: data.data.idea1Votes ?? battle.idea1Votes,
              idea2Votes: data.data.idea2Votes ?? battle.idea2Votes,
              userVote: ideaId,
            };
          }
          return battle;
        }));
      } else {
        alert(data.error || 'Không thể vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Không thể vote');
    } finally {
      setVotingBattleId(null);
    }
  };

  const activeBattles = battles.filter(b => b.status === 'active');
  const completedBattles = battles.filter(b => b.status === 'completed');

  // Access battle translations safely
  const battleTranslations = (t as unknown as Record<string, Record<string, string>>).battle;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 mb-4">
            <Swords className="w-5 h-5" />
            <span className="font-semibold">Battle Arena</span>
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            {battleTranslations?.title || 'Idea Battle Arena'}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {battleTranslations?.subtitle || 'Vote for your favorite idea in head-to-head battles'}
          </p>
        </motion.div>

        {/* Weekly Champion Section */}
        {champion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <Card className="p-6 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-300">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-400 rounded-full">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {battleTranslations?.championTitle || 'Weekly Champion'}
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    {battleTranslations?.championDesc || 'The idea with the most wins this week'}
                  </p>
                  <h3 className="text-lg font-semibold text-yellow-700">
                    {champion.idea.title}
                  </h3>
                  <Badge variant="warning" className="mt-2">
                    {champion.wins} wins
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Create Battle Button */}
        {session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-8"
          >
            <Button
              onClick={handleCreateBattle}
              disabled={creating}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {battleTranslations?.startingBattle || 'Creating battle...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {battleTranslations?.startBattle || 'Start New Battle'}
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Active Battles */}
        {!loading && activeBattles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Swords className="w-6 h-6 text-orange-500" />
              {battleTranslations?.activeBattles || 'Active Battles'}
              <Badge variant="warning">{activeBattles.length}</Badge>
            </h2>
            <div className="space-y-6">
              {activeBattles.map((battle) => (
                <BattleCard
                  key={battle.id}
                  battle={battle}
                  onVote={handleVote}
                  isVoting={votingBattleId === battle.id}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* No Battles */}
        {!loading && activeBattles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Swords className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg text-[var(--text-secondary)]">
              {battleTranslations?.noBattles || 'No active battles right now. Check back later!'}
            </p>
            {session && (
              <Button
                onClick={handleCreateBattle}
                disabled={creating}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {battleTranslations?.startingBattle || 'Creating battle...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {battleTranslations?.startBattle || 'Start New Battle'}
                  </>
                )}
              </Button>
            )}
          </motion.div>
        )}

        {/* Completed Battles */}
        {!loading && completedBattles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-gray-400" />
              {battleTranslations?.completedBattles || 'Completed Battles'}
            </h2>
            <div className="space-y-6 opacity-75">
              {completedBattles.slice(0, 5).map((battle) => (
                <BattleCard
                  key={battle.id}
                  battle={battle}
                  onVote={handleVote}
                  isVoting={false}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
