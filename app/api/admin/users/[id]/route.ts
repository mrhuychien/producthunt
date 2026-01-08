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

// PATCH /api/admin/users/[id] - Update user role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    if (session!.user.role !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (role && !['user', 'admin'].includes(role)) {
      return errorResponse('Invalid role');
    }

    // Prevent self-demotion
    if (id === session!.user.id && role === 'user') {
      return errorResponse('Cannot remove your own admin privileges');
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return errorResponse('Failed to update user', 500);
    }

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error);
    return errorResponse('Internal server error', 500);
  }
}
