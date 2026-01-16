import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getAuthenticatedSession,
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// Get setting from database
async function getSetting(key: string): Promise<string | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  return data?.value || null;
}

// Generate fusion using OpenAI
async function generateFusionWithAI(
  ideas: { title: string; description: string }[],
  apiKey: string,
  model: string
): Promise<{ title: string; description: string; concept: string } | null> {
  try {
    const prompt = `Bạn là một chuyên gia sáng tạo ý tưởng startup. Hãy kết hợp các ý tưởng sau thành một concept mới độc đáo và khả thi.

Các ý tưởng nguồn:
${ideas.map((idea, i) => `${i + 1}. "${idea.title}": ${idea.description}`).join('\n\n')}

Hãy tạo ra một ý tưởng fusion mới bằng cách kết hợp điểm mạnh của các ý tưởng trên. Trả về JSON với format:
{
  "title": "Tên ý tưởng fusion (ngắn gọn, có emoji)",
  "concept": "Mô tả ngắn concept (1-2 câu)",
  "description": "Mô tả chi tiết bao gồm: vấn đề giải quyết, giải pháp, đối tượng khách hàng, tiềm năng thị trường, và các bước triển khai"
}

Chỉ trả về JSON, không có text khác.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Bạn là AI chuyên sáng tạo ý tưởng startup. Luôn trả về JSON hợp lệ bằng tiếng Việt.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: parsed.title || '🧬 AI Fusion',
      description: parsed.description || '',
      concept: parsed.concept || '',
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

// Simple AI-like fusion algorithm (can be replaced with actual AI API)
function generateFusion(ideas: { title: string; description: string }[]): {
  title: string;
  description: string;
  concept: string;
} {
  const titles = ideas.map(i => i.title);
  const keywords = titles.map(t => {
    // Extract key words from titles
    const words = t.split(' ').filter(w => w.length > 3);
    return words[Math.floor(Math.random() * words.length)] || t.split(' ')[0];
  });

  // Generate fusion concept
  const concepts = [
    `${titles[0]} + ${titles[1]} = Giải pháp kết hợp sức mạnh của cả hai`,
    `Khi ${keywords[0]} gặp ${keywords[1]}: Một cách tiếp cận mới`,
    `${keywords[0]} x ${keywords[1]}: Fusion đột phá`,
  ];

  const fusionTemplates = [
    {
      title: `🧬 ${keywords[0]} × ${keywords[1]}`,
      concept: `Kết hợp "${titles[0]}" với "${titles[1]}"`,
    },
    {
      title: `💡 Fusion: ${keywords[0]} + ${keywords[1]}`,
      concept: `Ý tưởng lai giữa: ${titles.join(' & ')}`,
    },
    {
      title: `🚀 ${keywords[0]}${keywords[1]}`,
      concept: `Sáng tạo từ: ${titles.join(' + ')}`,
    },
  ];

  const template = fusionTemplates[Math.floor(Math.random() * fusionTemplates.length)];

  // Combine descriptions
  const combinedDesc = ideas.map((idea, i) =>
    `**Từ ý tưởng ${i + 1}:** ${idea.description.slice(0, 200)}...`
  ).join('\n\n');

  const fusionDesc = `## 🧬 Ý tưởng Fusion

${template.concept}

### Nguồn gốc:
${combinedDesc}

### Tiềm năng:
Kết hợp những điểm mạnh của các ý tưởng gốc để tạo ra giải pháp toàn diện hơn.

### Đề xuất triển khai:
1. Phân tích điểm mạnh của từng ý tưởng gốc
2. Xác định điểm giao thoa có thể kết hợp
3. Thiết kế giải pháp tích hợp
4. Prototype và thu thập feedback`;

  return {
    title: template.title,
    description: fusionDesc,
    concept: template.concept,
  };
}

// POST /api/fusion - Create a new fused idea
export async function POST(request: NextRequest) {
  try {
    const { session, error: authError } = await getAuthenticatedSession();
    if (authError) return authError;

    const body = await request.json();
    const { ideaIds, random = false, count = 2 } = body;

    const supabase = createServerClient();
    let selectedIdeas;

    if (random || !ideaIds || ideaIds.length === 0) {
      // Get random ideas - try approved first, fallback to any
      let { data: allIdeas, error } = await supabase
        .from('ideas')
        .select('id, title, description')
        .eq('status', 'approved')
        .limit(50);

      // Fallback to any ideas if not enough approved
      if (!allIdeas || allIdeas.length < 2) {
        const result = await supabase
          .from('ideas')
          .select('id, title, description')
          .limit(50);
        allIdeas = result.data;
        error = result.error;
      }

      if (error || !allIdeas || allIdeas.length < 2) {
        return errorResponse('Không đủ ý tưởng để fusion. Cần ít nhất 2 ý tưởng.', 400);
      }

      // Shuffle and pick
      const shuffled = allIdeas.sort(() => Math.random() - 0.5);
      selectedIdeas = shuffled.slice(0, Math.min(count, 3));
    } else {
      // Get specific ideas
      if (ideaIds.length < 2) {
        return errorResponse('Cần ít nhất 2 ý tưởng để fusion', 400);
      }

      const { data: ideas, error } = await supabase
        .from('ideas')
        .select('id, title, description')
        .in('id', ideaIds.slice(0, 3));

      if (error || !ideas || ideas.length < 2) {
        return errorResponse('Không tìm thấy ý tưởng', 404);
      }

      selectedIdeas = ideas;
    }

    // Try to generate fusion with AI first
    let fusion: { title: string; description: string; concept: string };

    const apiKey = await getSetting('openai_api_key');
    const aiModel = await getSetting('ai_model') || 'gpt-3.5-turbo';
    const fusionEnabled = await getSetting('fusion_enabled');

    if (apiKey && apiKey.startsWith('sk-') && fusionEnabled !== 'false') {
      const aiFusion = await generateFusionWithAI(selectedIdeas, apiKey, aiModel);
      if (aiFusion) {
        fusion = aiFusion;
      } else {
        // Fallback to simple algorithm
        fusion = generateFusion(selectedIdeas);
      }
    } else {
      // Use simple algorithm if no API key
      fusion = generateFusion(selectedIdeas);
    }

    // Save to database
    const { data: fusedIdea, error: insertError } = await supabase
      .from('fused_ideas')
      .insert({
        title: fusion.title,
        description: fusion.description,
        concept: fusion.concept,
        source_idea_ids: selectedIdeas.map((i: { id: string }) => i.id),
        created_by_id: session?.user?.id || null,
        vote_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating fusion:', insertError);
      return errorResponse('Không thể tạo fusion', 500);
    }

    // Get full source ideas for response
    const { data: sourceIdeas } = await supabase
      .from('ideas')
      .select(`
        id, title, description, vote_count,
        user:users(id, name, image),
        category:categories(id, name, icon)
      `)
      .in('id', selectedIdeas.map((i: { id: string }) => i.id));

    const transformedFusion = transformToCamelCase<Record<string, unknown>>(fusedIdea);

    return successResponse({
      success: true,
      data: {
        ...transformedFusion,
        sourceIdeas: transformToCamelCase(sourceIdeas),
      },
    }, 201);
  } catch (error) {
    console.error('Error in POST /api/fusion:', error);
    return errorResponse('Internal server error', 500);
  }
}

// GET /api/fusion - Get all fused ideas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerClient();

    const { data: fusedIdeas, error, count } = await supabase
      .from('fused_ideas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching fusions:', error);
      return errorResponse('Không thể lấy danh sách fusion', 500);
    }

    // Get source ideas for each fusion
    const fusionsWithSources = await Promise.all(
      (fusedIdeas || []).map(async (fusion) => {
        const { data: sourceIdeas } = await supabase
          .from('ideas')
          .select(`
            id, title, vote_count,
            user:users(id, name, image),
            category:categories(id, name, icon)
          `)
          .in('id', fusion.source_idea_ids);

        const transformed = transformToCamelCase<Record<string, unknown>>(fusion);
        return {
          ...transformed,
          sourceIdeas: transformToCamelCase(sourceIdeas || []),
        };
      })
    );

    return successResponse({
      success: true,
      data: fusionsWithSources,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/fusion:', error);
    return errorResponse('Internal server error', 500);
  }
}
