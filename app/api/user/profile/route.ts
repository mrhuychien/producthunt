import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
} from '@/lib/api-utils';

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || name.trim().length < 2) {
      return errorResponse('Name must be at least 2 characters');
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('id', session!.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return errorResponse('Failed to update profile', 500);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error in PATCH /api/user/profile:', error);
    return errorResponse('Internal server error', 500);
  }
}

// GET /api/user/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session!.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return errorResponse('Failed to fetch profile', 500);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error);
    return errorResponse('Internal server error', 500);
  }
}
