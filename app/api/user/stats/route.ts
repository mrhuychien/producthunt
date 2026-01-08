import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/user/stats - Get user's dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const userId = session!.user.id;

    // Get idea count
    const { count: ideaCount } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get total votes received on user's ideas
    const { data: userIdeas } = await supabase
      .from('ideas')
      .select('vote_count')
      .eq('user_id', userId);

    const totalVotesReceived = userIdeas?.reduce((sum, idea) => sum + idea.vote_count, 0) || 0;

    // Get comment count
    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get saved count
    const { count: savedCount } = await supabase
      .from('saved_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return successResponse({
      ideas: ideaCount || 0,
      votesReceived: totalVotesReceived,
      comments: commentCount || 0,
      saved: savedCount || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/user/stats:', error);
    return errorResponse('Internal server error', 500);
  }
}
