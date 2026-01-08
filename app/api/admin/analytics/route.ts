import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  forbiddenResponse,
} from '@/lib/api-utils';

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    if (session!.user.role !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    // Get total counts
    const [
      { count: totalUsers },
      { count: totalIdeas },
      { count: totalComments },
      { count: totalVotes },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('ideas').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
    ]);

    // Get ideas by status
    const { data: statusData } = await supabase
      .from('ideas')
      .select('status');

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      in_progress: 0,
      built: 0,
    };

    statusData?.forEach((idea) => {
      if (idea.status in statusCounts) {
        statusCounts[idea.status as keyof typeof statusCounts]++;
      }
    });

    // Get ideas by category
    const { data: categoryData } = await supabase
      .from('ideas')
      .select(`
        category:categories(name, icon)
      `);

    const categoryCounts: Record<string, { count: number; icon: string }> = {};
    categoryData?.forEach((idea) => {
      // Supabase returns the relation as an array or object depending on the query
      const categoryRaw = idea.category;
      const cat = Array.isArray(categoryRaw)
        ? categoryRaw[0] as { name: string; icon: string } | undefined
        : categoryRaw as { name: string; icon: string } | null;
      if (cat) {
        if (!categoryCounts[cat.name]) {
          categoryCounts[cat.name] = { count: 0, icon: cat.icon };
        }
        categoryCounts[cat.name].count++;
      }
    });

    // Get top ideas
    const { data: topIdeas } = await supabase
      .from('ideas')
      .select(`
        id,
        title,
        vote_count,
        comment_count,
        user:users(name)
      `)
      .order('vote_count', { ascending: false })
      .limit(5);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: newUsersWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: newIdeasWeek } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    return successResponse({
      totals: {
        users: totalUsers || 0,
        ideas: totalIdeas || 0,
        comments: totalComments || 0,
        votes: totalVotes || 0,
      },
      statusCounts,
      categoryCounts,
      topIdeas: topIdeas || [],
      weeklyGrowth: {
        users: newUsersWeek || 0,
        ideas: newIdeasWeek || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/analytics:', error);
    return errorResponse('Internal server error', 500);
  }
}
