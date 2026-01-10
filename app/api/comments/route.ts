import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// GET /api/comments?ideaId=xxx - Get comments for an idea
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!ideaId) {
      return errorResponse('Idea ID is required');
    }

    const offset = (page - 1) * limit;

    // Get top-level comments (no parent)
    const { data: comments, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, name, email, image),
        replies:comments(
          *,
          user:users(id, name, email, image)
        )
      `, { count: 'exact' })
      .eq('idea_id', ideaId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return errorResponse('Failed to fetch comments', 500);
    }

    return successResponse({
      data: transformToCamelCase(comments || []),
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/comments:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const body = await request.json();
    const { ideaId, content, parentId } = body;

    // Validation
    if (!ideaId) {
      return errorResponse('Idea ID is required');
    }
    if (!content || content.trim().length < 1) {
      return errorResponse('Comment content is required');
    }
    if (content.length > 2000) {
      return errorResponse('Comment must be less than 2000 characters');
    }

    // Check if idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea not found', 404);
    }

    // If replying, check if parent comment exists
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parentId)
        .single();

      if (parentError || !parentComment) {
        return errorResponse('Parent comment not found', 404);
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: session!.user.id,
        parent_id: parentId || null,
        content: content.trim(),
      })
      .select(`
        *,
        user:users(id, name, email, image)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return errorResponse('Failed to create comment', 500);
    }

    return successResponse({ data: transformToCamelCase(comment) }, 201);
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return errorResponse('Internal server error', 500);
  }
}
