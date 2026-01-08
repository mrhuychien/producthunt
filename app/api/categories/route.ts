import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return errorResponse('Failed to fetch categories', 500);
    }

    return successResponse(categories || []);
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return errorResponse('Internal server error', 500);
  }
}
