import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// POST /api/ideas/[id]/claim - Claim an idea to build
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: ideaId } = await params;
    const body = await request.json().catch(() => ({}));
    const { githubUrl, liveUrl } = body;

    const supabase = createServerClient();

    // Check if idea exists and is approved
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, status, title')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea không tồn tại', 404);
    }

    if (idea.status !== 'approved') {
      return errorResponse('Chỉ có thể claim idea đã được duyệt', 400);
    }

    // Check if idea already has an active claim
    const { data: existingClaim } = await supabase
      .from('build_claims')
      .select('id, builder_id')
      .eq('idea_id', ideaId)
      .eq('status', 'active')
      .single();

    if (existingClaim) {
      if (existingClaim.builder_id === session!.user.id) {
        return errorResponse('Bạn đã claim idea này rồi', 400);
      }
      return errorResponse('Idea này đã được người khác claim', 400);
    }

    // Create claim
    const { data: claim, error: claimError } = await supabase
      .from('build_claims')
      .insert({
        idea_id: ideaId,
        builder_id: session!.user.id,
        status: 'active',
        started_at: new Date().toISOString(),
        github_url: githubUrl || null,
        live_url: liveUrl || null,
      })
      .select()
      .single();

    if (claimError) {
      console.error('Error creating claim:', claimError);
      return errorResponse('Không thể claim idea', 500);
    }

    // Update idea status to in_progress
    await supabase
      .from('ideas')
      .update({ status: 'in_progress' })
      .eq('id', ideaId);

    // Create initial progress update
    await supabase
      .from('progress_updates')
      .insert({
        claim_id: claim.id,
        user_id: session!.user.id,
        type: 'milestone',
        content: `Bắt đầu phát triển "${idea.title}"`,
        milestone_title: 'Khởi động dự án',
      });

    const transformed = transformToCamelCase<Record<string, unknown>>(claim);
    return successResponse({
      data: transformed,
      message: 'Claim thành công! Bắt đầu hành trình của bạn.',
    }, 201);
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/claim:', error);
    return errorResponse('Internal server error', 500);
  }
}

// GET /api/ideas/[id]/claim - Get claim info for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Get active claim for this idea
    const { data: claim, error } = await supabase
      .from('build_claims')
      .select(`
        *,
        builder:users(id, name, image)
      `)
      .eq('idea_id', ideaId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching claim:', error);
      return errorResponse('Không thể lấy thông tin claim', 500);
    }

    if (!claim) {
      return successResponse({ data: null });
    }

    const transformed = transformToCamelCase<Record<string, unknown>>(claim);
    return successResponse({ data: transformed });
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]/claim:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PATCH /api/ideas/[id]/claim - Update claim (complete, abandon, update URLs)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: ideaId } = await params;
    const body = await request.json();
    const { status, githubUrl, liveUrl } = body;

    const supabase = createServerClient();

    // Get active claim
    const { data: claim, error: claimError } = await supabase
      .from('build_claims')
      .select('id, builder_id')
      .eq('idea_id', ideaId)
      .eq('status', 'active')
      .single();

    if (claimError || !claim) {
      return errorResponse('Không tìm thấy claim', 404);
    }

    if (claim.builder_id !== session!.user.id) {
      return errorResponse('Bạn không phải builder của idea này', 403);
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (githubUrl !== undefined) updateData.github_url = githubUrl;
    if (liveUrl !== undefined) updateData.live_url = liveUrl;

    if (status === 'completed') {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();

      // Update idea status
      await supabase
        .from('ideas')
        .update({ status: 'built' })
        .eq('id', ideaId);

      // Add completion milestone
      await supabase
        .from('progress_updates')
        .insert({
          claim_id: claim.id,
          user_id: session!.user.id,
          type: 'milestone',
          content: 'Dự án đã hoàn thành!',
          milestone_title: 'Hoàn thành',
        });
    } else if (status === 'abandoned') {
      updateData.status = 'abandoned';

      // Revert idea status
      await supabase
        .from('ideas')
        .update({ status: 'approved' })
        .eq('id', ideaId);
    }

    const { data: updatedClaim, error } = await supabase
      .from('build_claims')
      .update(updateData)
      .eq('id', claim.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating claim:', error);
      return errorResponse('Không thể cập nhật claim', 500);
    }

    const transformed = transformToCamelCase<Record<string, unknown>>(updatedClaim);
    return successResponse({ data: transformed });
  } catch (error) {
    console.error('Error in PATCH /api/ideas/[id]/claim:', error);
    return errorResponse('Internal server error', 500);
  }
}
