import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// POST /api/battles/[id]/vote - Vote in a battle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: battleId } = await params;
    const { ideaId } = await request.json();

    if (!ideaId) {
      return errorResponse('Idea ID is required', 400);
    }

    const supabase = createServerClient();

    // Get battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (battleError || !battle) {
      return errorResponse('Battle không tồn tại', 404);
    }

    if (battle.status !== 'active') {
      return errorResponse('Battle đã kết thúc', 400);
    }

    if (new Date(battle.expires_at) < new Date()) {
      return errorResponse('Battle đã hết hạn', 400);
    }

    // Validate ideaId is in this battle
    if (ideaId !== battle.idea1_id && ideaId !== battle.idea2_id) {
      return errorResponse('Idea không thuộc battle này', 400);
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('battle_votes')
      .select('id, voted_idea_id')
      .eq('battle_id', battleId)
      .eq('user_id', session!.user.id)
      .single();

    if (existingVote) {
      // If voting for same idea, do nothing
      if (existingVote.voted_idea_id === ideaId) {
        return successResponse({
          success: true,
          data: { message: 'Bạn đã vote cho ý tưởng này rồi', alreadyVoted: true },
        });
      }

      // Change vote
      const oldIdeaField = existingVote.voted_idea_id === battle.idea1_id ? 'idea1_votes' : 'idea2_votes';
      const newIdeaField = ideaId === battle.idea1_id ? 'idea1_votes' : 'idea2_votes';

      await supabase
        .from('battle_votes')
        .update({ voted_idea_id: ideaId })
        .eq('id', existingVote.id);

      // Update vote counts
      await supabase
        .from('battles')
        .update({
          [oldIdeaField]: battle[oldIdeaField] - 1,
          [newIdeaField]: battle[newIdeaField] + 1,
        })
        .eq('id', battleId);

      return successResponse({
        success: true,
        data: {
          message: 'Đã đổi vote',
          votedFor: ideaId,
          idea1Votes: oldIdeaField === 'idea1_votes' ? battle.idea1_votes - 1 : (newIdeaField === 'idea1_votes' ? battle.idea1_votes + 1 : battle.idea1_votes),
          idea2Votes: oldIdeaField === 'idea2_votes' ? battle.idea2_votes - 1 : (newIdeaField === 'idea2_votes' ? battle.idea2_votes + 1 : battle.idea2_votes),
        },
      });
    }

    // Create new vote
    await supabase
      .from('battle_votes')
      .insert({
        battle_id: battleId,
        user_id: session!.user.id,
        voted_idea_id: ideaId,
      });

    // Update vote count
    const voteField = ideaId === battle.idea1_id ? 'idea1_votes' : 'idea2_votes';
    const newVoteCount = battle[voteField] + 1;

    await supabase
      .from('battles')
      .update({ [voteField]: newVoteCount })
      .eq('id', battleId);

    return successResponse({
      success: true,
      data: {
        message: 'Vote thành công!',
        votedFor: ideaId,
        idea1Votes: voteField === 'idea1_votes' ? newVoteCount : battle.idea1_votes,
        idea2Votes: voteField === 'idea2_votes' ? newVoteCount : battle.idea2_votes,
      },
    }, 201);
  } catch (error) {
    console.error('Error in POST /api/battles/[id]/vote:', error);
    return errorResponse('Internal server error', 500);
  }
}
