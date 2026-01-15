import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// Get current week number
function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}

// GET /api/battles - Get all battles for current week
export async function GET(request: NextRequest) {
  try {
    const { session } = await getAuthenticatedSession();
    const { searchParams } = new URL(request.url);
    const weekNumber = parseInt(searchParams.get('week') || String(getWeekNumber()));

    const supabase = createServerClient();

    // Get all battles for this week (both active and completed)
    const { data: battles, error } = await supabase
      .from('battles')
      .select('*')
      .eq('week_number', weekNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching battles:', error);
      return errorResponse('Không thể lấy danh sách battle', 500);
    }

    // Get user votes if logged in
    let userVotes: Record<string, string> = {};
    if (session?.user?.id) {
      const { data: votes } = await supabase
        .from('battle_votes')
        .select('battle_id, voted_idea_id')
        .eq('user_id', session.user.id);

      if (votes) {
        votes.forEach(v => {
          userVotes[v.battle_id] = v.voted_idea_id;
        });
      }
    }

    // Get ideas for each battle
    const battlesWithIdeas = await Promise.all(
      (battles || []).map(async (battle) => {
        const { data: ideas } = await supabase
          .from('ideas')
          .select(`
            id, title, description, vote_count,
            user:users(id, name, image),
            category:categories(id, name, icon)
          `)
          .in('id', [battle.idea1_id, battle.idea2_id]);

        const idea1 = ideas?.find(i => i.id === battle.idea1_id);
        const idea2 = ideas?.find(i => i.id === battle.idea2_id);

        const transformed = transformToCamelCase<Record<string, unknown>>(battle);
        return {
          ...transformed,
          idea1: transformToCamelCase(idea1),
          idea2: transformToCamelCase(idea2),
          userVote: userVotes[battle.id] || null,
        };
      })
    );

    // Calculate champion - idea with most wins this week
    const { data: completedBattles } = await supabase
      .from('battles')
      .select('winner_id')
      .eq('week_number', weekNumber)
      .eq('status', 'completed')
      .not('winner_id', 'is', null);

    let champion = null;
    if (completedBattles && completedBattles.length > 0) {
      // Count wins per idea
      const winCounts: Record<string, number> = {};
      completedBattles.forEach(b => {
        if (b.winner_id) {
          winCounts[b.winner_id] = (winCounts[b.winner_id] || 0) + 1;
        }
      });

      // Find idea with most wins
      const champId = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0];
      if (champId) {
        const { data: championIdea } = await supabase
          .from('ideas')
          .select(`
            id, title, description, vote_count,
            user:users(id, name, image),
            category:categories(id, name, icon)
          `)
          .eq('id', champId[0])
          .single();

        if (championIdea) {
          champion = {
            idea: transformToCamelCase(championIdea),
            wins: champId[1],
          };
        }
      }
    }

    return successResponse({
      data: {
        battles: battlesWithIdeas,
        champion,
      },
      weekNumber,
    });
  } catch (error) {
    console.error('Error in GET /api/battles:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/battles - Create a new battle (admin or auto)
export async function POST(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const supabase = createServerClient();
    const weekNumber = getWeekNumber();

    // Get random approved ideas that haven't battled this week
    const { data: existingBattles } = await supabase
      .from('battles')
      .select('idea1_id, idea2_id')
      .eq('week_number', weekNumber);

    const battleedIds = new Set<string>();
    existingBattles?.forEach(b => {
      battleedIds.add(b.idea1_id);
      battleedIds.add(b.idea2_id);
    });

    // Get ideas for battle - prefer approved but allow all if not enough
    let { data: availableIdeas, error: ideasError } = await supabase
      .from('ideas')
      .select('id')
      .eq('status', 'approved')
      .order('vote_count', { ascending: false })
      .limit(20);

    // If not enough approved ideas, get any ideas
    if (!availableIdeas || availableIdeas.length < 2) {
      const result = await supabase
        .from('ideas')
        .select('id')
        .order('vote_count', { ascending: false })
        .limit(20);
      availableIdeas = result.data;
      ideasError = result.error;
    }

    if (ideasError || !availableIdeas || availableIdeas.length < 2) {
      return errorResponse('Không đủ ý tưởng để tạo battle', 400);
    }

    // Filter out already battled ideas
    const freshIdeas = availableIdeas.filter(i => !battleedIds.has(i.id));

    if (freshIdeas.length < 2) {
      return errorResponse('Tất cả ý tưởng đã battle tuần này', 400);
    }

    // Pick 2 random ideas
    const shuffled = freshIdeas.sort(() => Math.random() - 0.5);
    const [idea1, idea2] = shuffled.slice(0, 2);

    // Create battle with 24h expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        idea1_id: idea1.id,
        idea2_id: idea2.id,
        idea1_votes: 0,
        idea2_votes: 0,
        status: 'active',
        round: 1,
        week_number: weekNumber,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (battleError) {
      console.error('Error creating battle:', battleError);
      return errorResponse('Không thể tạo battle', 500);
    }

    // Get full idea data
    const { data: ideas } = await supabase
      .from('ideas')
      .select(`
        id, title, description, vote_count,
        user:users(id, name, image),
        category:categories(id, name, icon)
      `)
      .in('id', [idea1.id, idea2.id]);

    const transformed = transformToCamelCase<Record<string, unknown>>(battle);

    return successResponse({
      data: {
        ...transformed,
        idea1: transformToCamelCase(ideas?.find(i => i.id === idea1.id)),
        idea2: transformToCamelCase(ideas?.find(i => i.id === idea2.id)),
      },
    }, 201);
  } catch (error) {
    console.error('Error in POST /api/battles:', error);
    return errorResponse('Internal server error', 500);
  }
}
