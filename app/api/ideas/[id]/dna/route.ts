import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// Define event types for the DNA timeline
type DNAEventType =
  | 'created'
  | 'approved'
  | 'vote'
  | 'comment'
  | 'fusion_source'
  | 'battle'
  | 'claimed'
  | 'progress_update'
  | 'completed';

interface DNAEventUser {
  id: string;
  name: string;
  image: string | null;
}

interface DNAEvent {
  id: string;
  type: DNAEventType;
  timestamp: string;
  user?: DNAEventUser;
  details?: Record<string, unknown>;
}

// Helper to extract user from Supabase result
function extractUser(user: unknown): DNAEventUser | undefined {
  if (!user) return undefined;
  if (Array.isArray(user) && user.length > 0) {
    return user[0] as DNAEventUser;
  }
  if (typeof user === 'object') {
    return user as DNAEventUser;
  }
  return undefined;
}

// GET /api/ideas/[id]/dna - Get the DNA/history of an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Get idea with basic info
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select(`
        id, title, status, created_at,
        user:users(id, name, image),
        category:categories(id, name, icon)
      `)
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea không tồn tại', 404);
    }

    const events: DNAEvent[] = [];

    // 1. Creation event
    events.push({
      id: `created-${idea.id}`,
      type: 'created',
      timestamp: idea.created_at,
      user: extractUser(idea.user),
      details: { status: 'pending' },
    });

    // 2. Get votes (limit to most recent 50)
    const { data: votes } = await supabase
      .from('votes')
      .select(`
        id, value, created_at,
        user:users(id, name, image)
      `)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (votes) {
      votes.forEach(vote => {
        events.push({
          id: `vote-${vote.id}`,
          type: 'vote',
          timestamp: vote.created_at,
          user: extractUser(vote.user),
          details: { value: vote.value },
        });
      });
    }

    // 3. Get comments
    const { data: comments } = await supabase
      .from('comments')
      .select(`
        id, content, created_at,
        user:users(id, name, image)
      `)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (comments) {
      comments.forEach(comment => {
        events.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          timestamp: comment.created_at,
          user: extractUser(comment.user),
          details: {
            content: comment.content.slice(0, 100) + (comment.content.length > 100 ? '...' : '')
          },
        });
      });
    }

    // 4. Check if this idea came from a fusion
    const { data: fusionSource } = await supabase
      .from('fused_ideas')
      .select(`
        id, title, created_at,
        created_by:users(id, name, image)
      `)
      .contains('source_idea_ids', [ideaId])
      .limit(5);

    if (fusionSource) {
      fusionSource.forEach(fusion => {
        events.push({
          id: `fusion-${fusion.id}`,
          type: 'fusion_source',
          timestamp: fusion.created_at,
          user: extractUser(fusion.created_by),
          details: { fusionTitle: fusion.title, fusionId: fusion.id },
        });
      });
    }

    // 5. Get battle history
    const { data: battles } = await supabase
      .from('battles')
      .select(`
        id, status, winner_id, idea1_votes, idea2_votes, idea1_id, idea2_id, created_at
      `)
      .or(`idea1_id.eq.${ideaId},idea2_id.eq.${ideaId}`)
      .order('created_at', { ascending: true });

    if (battles) {
      for (const battle of battles) {
        const isIdea1 = battle.idea1_id === ideaId;
        const won = battle.winner_id === ideaId;
        const opponentId = isIdea1 ? battle.idea2_id : battle.idea1_id;

        // Get opponent info
        const { data: opponent } = await supabase
          .from('ideas')
          .select('id, title')
          .eq('id', opponentId)
          .single();

        events.push({
          id: `battle-${battle.id}`,
          type: 'battle',
          timestamp: battle.created_at,
          details: {
            battleId: battle.id,
            status: battle.status,
            won,
            myVotes: isIdea1 ? battle.idea1_votes : battle.idea2_votes,
            opponentVotes: isIdea1 ? battle.idea2_votes : battle.idea1_votes,
            opponent: opponent ? { id: opponent.id, title: opponent.title } : null,
          },
        });
      }
    }

    // 6. Get build claims and progress
    const { data: claims } = await supabase
      .from('build_claims')
      .select(`
        id, status, started_at, completed_at,
        builder:users(id, name, image)
      `)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (claims) {
      for (const claim of claims) {
        events.push({
          id: `claim-${claim.id}`,
          type: 'claimed',
          timestamp: claim.started_at,
          user: extractUser(claim.builder),
          details: { claimId: claim.id, status: claim.status },
        });

        // Get progress updates for this claim
        const { data: updates } = await supabase
          .from('progress_updates')
          .select(`
            id, type, content, milestone_title, created_at,
            user:users(id, name, image)
          `)
          .eq('claim_id', claim.id)
          .order('created_at', { ascending: true });

        if (updates) {
          updates.forEach(update => {
            events.push({
              id: `progress-${update.id}`,
              type: 'progress_update',
              timestamp: update.created_at,
              user: extractUser(update.user),
              details: {
                updateType: update.type,
                content: update.content.slice(0, 100) + (update.content.length > 100 ? '...' : ''),
                milestoneTitle: update.milestone_title,
              },
            });
          });
        }

        if (claim.status === 'completed' && claim.completed_at) {
          events.push({
            id: `completed-${claim.id}`,
            type: 'completed',
            timestamp: claim.completed_at,
            user: extractUser(claim.builder),
          });
        }
      }
    }

    // Sort events by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Calculate stats
    const stats = {
      totalVotes: votes?.length || 0,
      totalComments: comments?.length || 0,
      totalBattles: battles?.length || 0,
      battlesWon: battles?.filter(b => b.winner_id === ideaId).length || 0,
      fusionCount: fusionSource?.length || 0,
      builderCount: claims?.length || 0,
      isCompleted: claims?.some(c => c.status === 'completed') || false,
    };

    return successResponse({
      data: {
        idea: transformToCamelCase(idea),
        events,
        stats,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]/dna:', error);
    return errorResponse('Internal server error', 500);
  }
}
