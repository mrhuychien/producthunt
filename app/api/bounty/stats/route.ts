import { createServerClient } from '@/lib/supabase';
import { successResponse, errorResponse, transformToCamelCase } from '@/lib/api-utils';

// GET /api/bounty/stats - Get bounty statistics and top ideas
export async function GET() {
  try {
    const supabase = createServerClient();

    // Get all pledged bounties with idea info
    const { data: bounties, error: bountiesError } = await supabase
      .from('idea_bounties')
      .select(`
        id, amount, idea_id, user_id,
        idea:ideas(
          id, title, description, vote_count,
          category:categories(id, name, slug, icon, color),
          user:users(id, name, image)
        )
      `)
      .eq('status', 'pledged');

    if (bountiesError) {
      console.error('Error fetching bounties:', bountiesError);
      return errorResponse('Không thể lấy dữ liệu bounty', 500);
    }

    // Calculate stats
    const totalBounty = (bounties || []).reduce((sum, b) => sum + b.amount, 0);
    const uniqueBackers = new Set((bounties || []).map(b => b.user_id)).size;

    // Group bounties by idea
    const ideaBountyMap = new Map<string, {
      total: number;
      backers: Set<string>;
      idea: Record<string, unknown> | null;
    }>();

    for (const bounty of bounties || []) {
      if (!bounty.idea) continue;

      // Supabase returns single relation as array, get first element
      const ideaData = Array.isArray(bounty.idea) ? bounty.idea[0] : bounty.idea;
      if (!ideaData) continue;

      const existing = ideaBountyMap.get(bounty.idea_id);
      if (existing) {
        existing.total += bounty.amount;
        existing.backers.add(bounty.user_id);
      } else {
        ideaBountyMap.set(bounty.idea_id, {
          total: bounty.amount,
          backers: new Set([bounty.user_id]),
          idea: ideaData as unknown as Record<string, unknown>,
        });
      }
    }

    // Convert to array and sort by total bounty
    const ideasWithBounty = Array.from(ideaBountyMap.entries())
      .map(([ideaId, data]) => {
        const transformed = transformToCamelCase<Record<string, unknown>>(data.idea);
        return {
          id: ideaId,
          ...transformed,
          totalBounty: data.total,
          backerCount: data.backers.size,
        };
      })
      .sort((a, b) => b.totalBounty - a.totalBounty);

    // Get top 6 ideas
    const topIdeas = ideasWithBounty.slice(0, 6);

    // Calculate average bounty per idea
    const averageBounty = ideasWithBounty.length > 0
      ? Math.round(totalBounty / ideasWithBounty.length)
      : 0;

    return successResponse({
      success: true,
      data: {
        stats: {
          totalBounty,
          totalIdeas: ideasWithBounty.length,
          totalBackers: uniqueBackers,
          averageBounty,
        },
        topIdeas,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/bounty/stats:', error);
    return errorResponse('Internal server error', 500);
  }
}
