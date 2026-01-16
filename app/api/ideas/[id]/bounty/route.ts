import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// GET /api/ideas/[id]/bounty - Get bounties for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session } = await getAuthenticatedSession();
    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Get all pledged bounties
    const { data: bounties, error } = await supabase
      .from('idea_bounties')
      .select(`
        id, amount, currency, message, status, created_at,
        user:users(id, name, image)
      `)
      .eq('idea_id', ideaId)
      .eq('status', 'pledged')
      .order('amount', { ascending: false });

    if (error) {
      console.error('Error fetching bounties:', error);
      return errorResponse('Không thể lấy danh sách bounty', 500);
    }

    // Calculate total
    const total = (bounties || []).reduce((sum, b) => sum + b.amount, 0);

    // Check if current user has pledged
    let userBounty = null;
    if (session?.user?.id) {
      const { data: myBounty } = await supabase
        .from('idea_bounties')
        .select('id, amount, currency, message, status, created_at')
        .eq('idea_id', ideaId)
        .eq('user_id', session.user.id)
        .eq('status', 'pledged')
        .single();

      if (myBounty) {
        userBounty = transformToCamelCase<Record<string, unknown>>(myBounty);
      }
    }

    const transformedBounties = (bounties || []).map(b => {
      const transformed = transformToCamelCase<Record<string, unknown>>(b);
      return transformed;
    });

    return successResponse({
      success: true,
      data: {
        bounties: transformedBounties,
        total,
        count: transformedBounties.length,
        currency: 'VND',
        userBounty,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]/bounty:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/ideas/[id]/bounty - Pledge a bounty
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: ideaId } = await params;
    const body = await request.json();
    const { amount, message, currency = 'VND' } = body;

    if (!amount || amount < 10000) {
      return errorResponse('Số tiền phải từ 10.000₫ trở lên', 400);
    }

    if (amount > 100000000) {
      return errorResponse('Số tiền tối đa là 100.000.000₫', 400);
    }

    const supabase = createServerClient();

    // Check if idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, title')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea không tồn tại', 404);
    }

    // Check if user already pledged
    const { data: existingBounty } = await supabase
      .from('idea_bounties')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', session!.user.id)
      .eq('status', 'pledged')
      .single();

    if (existingBounty) {
      // Update existing pledge
      const { data: updated, error } = await supabase
        .from('idea_bounties')
        .update({
          amount,
          message: message || null,
          currency,
        })
        .eq('id', existingBounty.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bounty:', error);
        return errorResponse('Không thể cập nhật bounty', 500);
      }

      // Get new total
      const { data: allBounties } = await supabase
        .from('idea_bounties')
        .select('amount')
        .eq('idea_id', ideaId)
        .eq('status', 'pledged');

      const total = (allBounties || []).reduce((sum, b) => sum + b.amount, 0);

      const transformed = transformToCamelCase<Record<string, unknown>>(updated);
      return successResponse({
        success: true,
        data: {
          bounty: transformed,
          total,
        },
        message: 'Đã cập nhật bounty!',
      });
    }

    // Create new pledge
    const { data: bounty, error } = await supabase
      .from('idea_bounties')
      .insert({
        idea_id: ideaId,
        user_id: session!.user.id,
        amount,
        currency,
        message: message || null,
        status: 'pledged',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bounty:', error);
      return errorResponse(`Không thể tạo bounty: ${error.message}`, 500);
    }

    // Get new total
    const { data: allBounties } = await supabase
      .from('idea_bounties')
      .select('amount')
      .eq('idea_id', ideaId)
      .eq('status', 'pledged');

    const total = (allBounties || []).reduce((sum, b) => sum + b.amount, 0);

    const transformed = transformToCamelCase<Record<string, unknown>>(bounty);
    return successResponse({
      success: true,
      data: {
        bounty: transformed,
        total,
      },
      message: `Đã pledge ${amount.toLocaleString('vi-VN')}₫! Cảm ơn bạn đã hỗ trợ idea này.`,
    }, 201);
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/bounty:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/ideas/[id]/bounty - Cancel a bounty pledge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Find user's bounty
    const { data: bounty, error: findError } = await supabase
      .from('idea_bounties')
      .select('id, amount')
      .eq('idea_id', ideaId)
      .eq('user_id', session!.user.id)
      .eq('status', 'pledged')
      .single();

    if (findError || !bounty) {
      return errorResponse('Bạn chưa pledge bounty cho idea này', 404);
    }

    // Cancel bounty
    const { error } = await supabase
      .from('idea_bounties')
      .update({ status: 'cancelled' })
      .eq('id', bounty.id);

    if (error) {
      console.error('Error cancelling bounty:', error);
      return errorResponse('Không thể hủy bounty', 500);
    }

    // Get new total
    const { data: allBounties } = await supabase
      .from('idea_bounties')
      .select('amount')
      .eq('idea_id', ideaId)
      .eq('status', 'pledged');

    const total = (allBounties || []).reduce((sum, b) => sum + b.amount, 0);

    return successResponse({
      success: true,
      data: { total },
      message: 'Đã hủy pledge bounty',
    });
  } catch (error) {
    console.error('Error in DELETE /api/ideas/[id]/bounty:', error);
    return errorResponse('Internal server error', 500);
  }
}
