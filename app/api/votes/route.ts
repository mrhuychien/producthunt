import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// POST /api/votes - Create or update a vote
export async function POST(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const body = await request.json();
    const { ideaId, value } = body;

    // Validation
    if (!ideaId) {
      return errorResponse('Idea ID is required');
    }
    if (value !== 1 && value !== -1) {
      return errorResponse('Vote value must be 1 (upvote) or -1 (downvote)');
    }

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
    let resultValue = 0;
    let action = '';

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove it (toggle off)
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
        resultValue = 0;
      } else {
        // Different vote - update it
        const { error } = await supabase
          .from('votes')
          .update({ value })
          .eq('id', existingVote.id);

        if (error) {
          console.error('Error updating vote:', error);
          return errorResponse('Failed to update vote', 500);
        }

        // Remove old vote, add new vote
        newVoteCount = newVoteCount - existingVote.value + value;
        action = 'updated';
        resultValue = value;
      }
    } else {
      // New vote
      const { error } = await supabase
        .from('votes')
        .insert({
          idea_id: ideaId,
          user_id: session!.user.id,
          value,
        });

      if (error) {
        console.error('Error creating vote:', error);
        return errorResponse('Failed to create vote', 500);
      }

      newVoteCount += value;
      action = 'created';
      resultValue = value;
    }

    // Update vote_count in ideas table
    await supabase
      .from('ideas')
      .update({ vote_count: newVoteCount })
      .eq('id', ideaId);

    return successResponse({ action, value: resultValue, newVoteCount }, action === 'created' ? 201 : 200);
  } catch (error) {
    console.error('Error in POST /api/votes:', error);
    return errorResponse('Internal server error', 500);
  }
}

// GET /api/votes?ideaId=xxx - Get vote for an idea
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return errorResponse('Idea ID is required');
    }

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

    return successResponse({ value: vote?.value || 0 });
  } catch (error) {
    console.error('Error in GET /api/votes:', error);
    return errorResponse('Internal server error', 500);
  }
}
