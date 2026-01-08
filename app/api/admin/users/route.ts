import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  forbiddenResponse,
} from '@/lib/api-utils';

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    if (session!.user.role !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const offset = (page - 1) * limit;

    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching users:', error);
      return errorResponse('Failed to fetch users', 500);
    }

    return successResponse({
      data: users || [],
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return errorResponse('Internal server error', 500);
  }
}
