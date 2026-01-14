import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// GET /api/ideas/[id]/steal - Get interested users for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session } = await getAuthenticatedSession();
    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Get all interested users
    const { data: interests, error } = await supabase
      .from('idea_interests')
      .select(`
        id, status, note, created_at,
        user:users(id, name, image)
      `)
      .eq('idea_id', ideaId)
      .neq('status', 'abandoned')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interests:', error);
      return errorResponse('Không thể lấy danh sách quan tâm', 500);
    }

    // Check if current user is interested
    let userInterest = null;
    if (session?.user?.id) {
      const { data: myInterest } = await supabase
        .from('idea_interests')
        .select('id, status, note, created_at')
        .eq('idea_id', ideaId)
        .eq('user_id', session.user.id)
        .neq('status', 'abandoned')
        .single();

      if (myInterest) {
        userInterest = transformToCamelCase<Record<string, unknown>>(myInterest);
      }
    }

    const transformedInterests = (interests || []).map(i => {
      const transformed = transformToCamelCase<Record<string, unknown>>(i);
      return transformed;
    });

    return successResponse({
      data: {
        interests: transformedInterests,
        count: transformedInterests.length,
        userInterest,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]/steal:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/ideas/[id]/steal - Declare interest in implementing an idea
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: ideaId } = await params;
    const body = await request.json().catch(() => ({}));
    const { note } = body;

    const supabase = createServerClient();

    // Check if idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, title, status')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea không tồn tại', 404);
    }

    // Check if user already has interest
    const { data: existingInterest } = await supabase
      .from('idea_interests')
      .select('id, status')
      .eq('idea_id', ideaId)
      .eq('user_id', session!.user.id)
      .neq('status', 'abandoned')
      .single();

    if (existingInterest) {
      return errorResponse('Bạn đã quan tâm idea này rồi', 400);
    }

    // Create interest
    const { data: interest, error } = await supabase
      .from('idea_interests')
      .insert({
        idea_id: ideaId,
        user_id: session!.user.id,
        status: 'interested',
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating interest:', error);
      return errorResponse('Không thể đánh dấu quan tâm', 500);
    }

    // Get updated count
    const { count } = await supabase
      .from('idea_interests')
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .neq('status', 'abandoned');

    const transformed = transformToCamelCase<Record<string, unknown>>(interest);
    return successResponse({
      data: {
        interest: transformed,
        count: count || 1,
      },
      message: 'Đã đánh dấu quan tâm! Đừng để người khác vượt mặt bạn!',
    }, 201);
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/steal:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/ideas/[id]/steal - Remove interest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Find user's interest
    const { data: interest, error: findError } = await supabase
      .from('idea_interests')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', session!.user.id)
      .neq('status', 'abandoned')
      .single();

    if (findError || !interest) {
      return errorResponse('Bạn chưa đánh dấu quan tâm idea này', 404);
    }

    // Mark as abandoned (soft delete)
    const { error } = await supabase
      .from('idea_interests')
      .update({ status: 'abandoned' })
      .eq('id', interest.id);

    if (error) {
      console.error('Error removing interest:', error);
      return errorResponse('Không thể bỏ quan tâm', 500);
    }

    // Get updated count
    const { count } = await supabase
      .from('idea_interests')
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .neq('status', 'abandoned');

    return successResponse({
      data: { count: count || 0 },
      message: 'Đã bỏ quan tâm',
    });
  } catch (error) {
    console.error('Error in DELETE /api/ideas/[id]/steal:', error);
    return errorResponse('Internal server error', 500);
  }
}
