import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/saved - Get user's saved ideas
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const { data: savedIdeas, error, count } = await supabase
      .from('saved_ideas')
      .select(`
        id,
        created_at,
        idea:ideas(
          *,
          category:categories(*),
          user:users(id, name, email, image)
        )
      `, { count: 'exact' })
      .eq('user_id', session!.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching saved ideas:', error);
      return errorResponse('Failed to fetch saved ideas', 500);
    }

    // Extract ideas from saved_ideas relation
    const ideas = savedIdeas?.map((s) => ({
      ...s.idea,
      isSaved: true,
      savedAt: s.created_at,
    })) || [];

    return successResponse({
      data: ideas,
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/saved:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/saved - Save or unsave an idea
export async function POST(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const body = await request.json();
    const { ideaId } = body;

    if (!ideaId) {
      return errorResponse('Idea ID is required');
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_ideas')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', session!.user.id)
      .single();

    if (existing) {
      // Unsave
      const { error } = await supabase
        .from('saved_ideas')
        .delete()
        .eq('id', existing.id);

      if (error) {
        console.error('Error unsaving idea:', error);
        return errorResponse('Failed to unsave idea', 500);
      }

      return successResponse({ action: 'unsaved', isSaved: false });
    } else {
      // Save
      const { error } = await supabase
        .from('saved_ideas')
        .insert({
          idea_id: ideaId,
          user_id: session!.user.id,
        });

      if (error) {
        console.error('Error saving idea:', error);
        return errorResponse('Failed to save idea', 500);
      }

      return successResponse({ action: 'saved', isSaved: true }, 201);
    }
  } catch (error) {
    console.error('Error in POST /api/saved:', error);
    return errorResponse('Internal server error', 500);
  }
}
