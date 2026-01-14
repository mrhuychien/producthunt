import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// POST /api/votes - Toggle upvote on an idea
export async function POST(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    if (!session?.user?.id) {
      return errorResponse('User ID not found. Please log out and log back in.', 401);
    }

    const body = await request.json();
    const { ideaId } = body;

    if (!ideaId) {
      return errorResponse('Idea ID is required');
    }

    // Use service role client to bypass RLS
    const supabase = createServerClient();

    // Check if idea exists and get current vote count
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, vote_count')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea not found', 404);
    }

    // Check for existing vote
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, value')
      .eq('idea_id', ideaId)
      .eq('user_id', session!.user.id)
      .single();

    let newVoteCount = idea.vote_count || 0;
    let hasVoted = false;
    let action = '';

    if (existingVote) {
      // Has existing vote - remove it (toggle off)
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id);

      if (error) {
        console.error('Error removing vote:', error);
        return errorResponse('Failed to remove vote', 500);
      }

      newVoteCount -= existingVote.value;
      action = 'removed';
      hasVoted = false;
    } else {
      // No existing vote - create upvote
      const { error } = await supabase
        .from('votes')
        .insert({
          idea_id: ideaId,
          user_id: session!.user.id,
          value: 1,
        });

      if (error) {
        console.error('Error creating vote:', error);
        return errorResponse('Failed to create vote', 500);
      }

      newVoteCount += 1;
      action = 'created';
      hasVoted = true;
    }

    // Update vote_count in ideas table
    await supabase
      .from('ideas')
      .update({ vote_count: newVoteCount })
      .eq('id', ideaId);

    return successResponse({ data: { action, hasVoted, newVoteCount } }, action === 'created' ? 201 : 200);
  } catch (error) {
    console.error('Error in POST /api/votes:', error);
    return errorResponse('Internal server error', 500);
  }
}

// GET /api/votes?ideaId=xxx - Get vote status for an idea
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return errorResponse('Idea ID is required');
    }

    const supabase = createServerClient();
    const { data: vote, error } = await supabase
      .from('votes')
      .select('value')
      .eq('idea_id', ideaId)
      .eq('user_id', session!.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vote:', error);
      return errorResponse('Failed to fetch vote', 500);
    }

    return successResponse({ data: { hasVoted: !!vote, value: vote?.value || 0 } });
  } catch (error) {
    console.error('Error in GET /api/votes:', error);
    return errorResponse('Internal server error', 500);
  }
}
