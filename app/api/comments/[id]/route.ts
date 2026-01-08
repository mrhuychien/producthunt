import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/comments/[id] - Update comment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length < 1) {
      return errorResponse('Comment content is required');
    }

    // Check if comment exists and user owns it
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingComment) {
      return notFoundResponse('Comment not found');
    }

    // Only owner can update
    if (existingComment.user_id !== session!.user.id) {
      return forbiddenResponse('You can only edit your own comments');
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', id)
      .select(`
        *,
        user:users(id, name, email, image)
      `)
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return errorResponse('Failed to update comment', 500);
    }

    return successResponse(comment);
  } catch (error) {
    console.error('Error in PATCH /api/comments/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id } = await params;

    // Check if comment exists and user owns it
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingComment) {
      return notFoundResponse('Comment not found');
    }

    // Only owner or admin can delete
    if (existingComment.user_id !== session!.user.id && session!.user.role !== 'admin') {
      return forbiddenResponse('You can only delete your own comments');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return errorResponse('Failed to delete comment', 500);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/comments/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}
