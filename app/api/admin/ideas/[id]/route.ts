import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/ideas/[id] - Update idea status/featured (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    // Check admin role
    if (session!.user.role !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { id } = await params;
    const body = await request.json();
    const { status, isFeatured } = body;

    // Check if idea exists
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingIdea) {
      return notFoundResponse('Idea not found');
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (isFeatured !== undefined) updates.is_featured = isFeatured;

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

    return successResponse(idea);
  } catch (error) {
    console.error('Error in PATCH /api/admin/ideas/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/admin/ideas/[id] - Delete idea (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    // Check admin role
    if (session!.user.role !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { id } = await params;

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
    console.error('Error in DELETE /api/admin/ideas/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}
