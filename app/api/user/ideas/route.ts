import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// GET /api/user/ideas - Get current user's ideas
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('ideas')
      .select(`
        *,
        category:categories(*),
        user:users(id, name, email, image)
      `, { count: 'exact' })
      .eq('user_id', session!.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: ideas, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user ideas:', error);
      return errorResponse('Failed to fetch ideas', 500);
    }

    return successResponse({
      data: ideas || [],
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/user/ideas:', error);
    return errorResponse('Internal server error', 500);
  }
}
