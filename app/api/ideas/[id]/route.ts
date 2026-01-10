import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ideas/[id] - Get single idea
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data: idea, error } = await supabase
      .from('ideas')
      .select(`
        *,
        category:categories(*),
        user:users(id, name, email, image),
        tags:idea_tags(tag:tags(*))
      `)
      .eq('id', id)
      .single();

    if (error || !idea) {
      return notFoundResponse('Idea not found');
    }

    // Get user's vote if authenticated
    const { session } = await getAuthenticatedSession();
    let userVote = null;
    let isSaved = false;

    if (session?.user) {
      const { data: vote } = await supabase
        .from('votes')
        .select('value')
        .eq('idea_id', id)
        .eq('user_id', session.user.id)
        .single();

      userVote = vote?.value || null;

      const { data: saved } = await supabase
        .from('saved_ideas')
        .select('id')
        .eq('idea_id', id)
        .eq('user_id', session.user.id)
        .single();

      isSaved = !!saved;
    }

    const transformedIdea = transformToCamelCase({
      ...idea,
      userVote,
      isSaved,
      tags: idea.tags?.map((t: { tag: unknown }) => t.tag) || [],
    });

    return successResponse({ data: transformedIdea });
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PATCH /api/ideas/[id] - Update idea
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const { title, description, categoryId, status } = body;

    // Check if idea exists and user owns it
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingIdea) {
      return notFoundResponse('Idea not found');
    }

    // Only owner or admin can update
    if (existingIdea.user_id !== session!.user.id && session!.user.role !== 'admin') {
      return forbiddenResponse('You can only edit your own ideas');
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (categoryId) updates.category_id = categoryId;
    if (status && session!.user.role === 'admin') {
      updates.status = status;
    }

    const { data: idea, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        user:users(id, name, email, image)
      `)
      .single();

    if (error) {
      console.error('Error updating idea:', error);
      return errorResponse('Failed to update idea', 500);
    }

    return successResponse({ data: transformToCamelCase(idea) });
  } catch (error) {
    console.error('Error in PATCH /api/ideas/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/ideas/[id] - Delete idea
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id } = await params;

    // Check if idea exists and user owns it
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingIdea) {
      return notFoundResponse('Idea not found');
    }

    // Only owner or admin can delete
    if (existingIdea.user_id !== session!.user.id && session!.user.role !== 'admin') {
      return forbiddenResponse('You can only delete your own ideas');
    }

    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting idea:', error);
      return errorResponse('Failed to delete idea', 500);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/ideas/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}
