import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  forbiddenResponse,
} from '@/lib/api-utils';

// GET /api/admin/ideas - List all ideas for admin
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    // Check admin role
    if (session!.user.role !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('ideas')
      .select(`
        *,
        category:categories(*),
        user:users(id, name, email, image)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: ideas, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching ideas:', error);
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
    console.error('Error in GET /api/admin/ideas:', error);
    return errorResponse('Internal server error', 500);
  }
}
