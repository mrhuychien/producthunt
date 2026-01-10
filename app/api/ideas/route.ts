import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedSession, successResponse, errorResponse, transformToCamelCase } from '@/lib/api-utils';

// GET /api/ideas - List all ideas with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'popular';
    const status = searchParams.get('status') || 'approved';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('ideas')
      .select(`
        *,
        category:categories(*),
        user:users(id, name, email, image)
      `, { count: 'exact' })
      .eq('status', status);

    // Filter by category
    if (category) {
      query = query.eq('category_id', category);
    }

    // Search by title or description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('vote_count', { ascending: false });
        break;
      case 'trending':
        // Trending: combination of recency and votes
        query = query.order('vote_count', { ascending: false })
                     .order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: ideas, error, count } = await query;

    if (error) {
      console.error('Error fetching ideas:', error);
      return errorResponse('Failed to fetch ideas', 500);
    }

    return successResponse({
      data: transformToCamelCase(ideas || []),
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/ideas:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const body = await request.json();
    const { title, description, categoryId, tags } = body;

    // Validation
    if (!title || title.length < 10) {
      return errorResponse('Title must be at least 10 characters');
    }
    if (!description || description.length < 50) {
      return errorResponse('Description must be at least 50 characters');
    }
    if (!categoryId) {
      return errorResponse('Category is required');
    }

    // Create idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        title,
        description,
        category_id: categoryId,
        user_id: session!.user.id,
        status: 'approved', // Auto-approve for MVP
      })
      .select(`
        *,
        category:categories(*),
        user:users(id, name, email, image)
      `)
      .single();

    if (ideaError) {
      console.error('Error creating idea:', ideaError);
      return errorResponse('Failed to create idea', 500);
    }

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Get or create tag
        let { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', tagName.toLowerCase())
          .single();

        if (!tag) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            })
            .select('id')
            .single();
          tag = newTag;
        }

        // Link tag to idea
        if (tag) {
          await supabase.from('idea_tags').insert({
            idea_id: idea.id,
            tag_id: tag.id,
          });
        }
      }
    }

    return successResponse({ data: transformToCamelCase(idea) }, 201);
  } catch (error) {
    console.error('Error in POST /api/ideas:', error);
    return errorResponse('Internal server error', 500);
  }
}
