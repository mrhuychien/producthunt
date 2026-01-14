import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// GET /api/ideas/[id]/progress - Get progress updates for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Get claim for this idea
    const { data: claim, error: claimError } = await supabase
      .from('build_claims')
      .select(`
        id, status, started_at, completed_at, github_url, live_url,
        builder:users(id, name, image)
      `)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (claimError && claimError.code !== 'PGRST116') {
      console.error('Error fetching claim:', claimError);
      return errorResponse('Không thể lấy thông tin claim', 500);
    }

    if (!claim) {
      return successResponse({
        data: {
          claim: null,
          updates: [],
        },
      });
    }

    // Get progress updates
    const { data: updates, error: updatesError } = await supabase
      .from('progress_updates')
      .select(`
        *,
        user:users(id, name, image)
      `)
      .eq('claim_id', claim.id)
      .order('created_at', { ascending: false });

    if (updatesError) {
      console.error('Error fetching updates:', updatesError);
      return errorResponse('Không thể lấy progress updates', 500);
    }

    const transformedClaim = transformToCamelCase<Record<string, unknown>>(claim);
    const transformedUpdates = (updates || []).map(u => {
      const transformed = transformToCamelCase<Record<string, unknown>>(u);
      return transformed;
    });

    return successResponse({
      data: {
        claim: transformedClaim,
        updates: transformedUpdates,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]/progress:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/ideas/[id]/progress - Add a progress update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: ideaId } = await params;
    const body = await request.json();
    const { type, content, imageUrl, commitUrl, milestoneTitle } = body;

    if (!type || !content) {
      return errorResponse('Type và content là bắt buộc', 400);
    }

    const validTypes = ['text', 'image', 'commit', 'milestone'];
    if (!validTypes.includes(type)) {
      return errorResponse('Type không hợp lệ', 400);
    }

    const supabase = createServerClient();

    // Get active claim for this idea
    const { data: claim, error: claimError } = await supabase
      .from('build_claims')
      .select('id, builder_id')
      .eq('idea_id', ideaId)
      .eq('status', 'active')
      .single();

    if (claimError || !claim) {
      return errorResponse('Không tìm thấy claim đang hoạt động', 404);
    }

    if (claim.builder_id !== session!.user.id) {
      return errorResponse('Bạn không phải builder của idea này', 403);
    }

    // Create progress update
    const { data: update, error } = await supabase
      .from('progress_updates')
      .insert({
        claim_id: claim.id,
        user_id: session!.user.id,
        type,
        content,
        image_url: imageUrl || null,
        commit_url: commitUrl || null,
        milestone_title: milestoneTitle || null,
      })
      .select(`
        *,
        user:users(id, name, image)
      `)
      .single();

    if (error) {
      console.error('Error creating update:', error);
      return errorResponse('Không thể tạo progress update', 500);
    }

    const transformed = transformToCamelCase<Record<string, unknown>>(update);
    return successResponse({ data: transformed }, 201);
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/progress:', error);
    return errorResponse('Internal server error', 500);
  }
}
