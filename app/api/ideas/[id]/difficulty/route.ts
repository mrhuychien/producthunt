import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  successResponse,
  errorResponse,
  transformToCamelCase,
} from '@/lib/api-utils';

// Tech stack detection keywords
const techKeywords: Record<string, string[]> = {
  'React': ['react', 'jsx', 'component', 'hooks', 'state management'],
  'Next.js': ['next', 'server side', 'ssr', 'ssg', 'fullstack'],
  'Node.js': ['node', 'backend', 'server', 'api', 'express'],
  'Python': ['python', 'django', 'flask', 'ml', 'machine learning', 'ai'],
  'Database': ['database', 'sql', 'mongodb', 'postgres', 'mysql', 'data'],
  'Mobile': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
  'AI/ML': ['ai', 'machine learning', 'neural', 'model', 'nlp', 'gpt'],
  'Cloud': ['cloud', 'aws', 'azure', 'gcp', 'deploy', 'hosting'],
  'Payment': ['payment', 'stripe', 'paypal', 'billing', 'subscription'],
  'Auth': ['auth', 'login', 'register', 'oauth', 'security'],
};

// Skill requirements based on complexity
const skillsByLevel: Record<number, string[]> = {
  1: ['HTML/CSS', 'Basic JavaScript', 'Git'],
  2: ['React/Vue basics', 'REST APIs', 'Basic database'],
  3: ['Full-stack development', 'System design', 'Testing'],
  4: ['Architecture', 'DevOps', 'Performance optimization'],
  5: ['Distributed systems', 'ML/AI', 'Security expertise'],
};

// Complexity factors
const complexityKeywords: Record<string, { factor: string; score: number }> = {
  'realtime': { factor: 'Real-time sync required', score: 0.5 },
  'real-time': { factor: 'Real-time sync required', score: 0.5 },
  'scale': { factor: 'Needs scalability planning', score: 0.5 },
  'million': { factor: 'Large scale expected', score: 0.5 },
  'secure': { factor: 'Security critical', score: 0.3 },
  'payment': { factor: 'Payment integration', score: 0.4 },
  'ai': { factor: 'AI/ML integration', score: 0.6 },
  'machine learning': { factor: 'AI/ML integration', score: 0.6 },
  'blockchain': { factor: 'Blockchain integration', score: 0.7 },
  'video': { factor: 'Video processing', score: 0.4 },
  'stream': { factor: 'Streaming infrastructure', score: 0.5 },
  'multi-language': { factor: 'Multi-language support', score: 0.2 },
  'integration': { factor: 'Third-party integrations', score: 0.3 },
  'mobile': { factor: 'Mobile app required', score: 0.4 },
};

function analyzeIdea(title: string, description: string): {
  difficultyScore: number;
  estimatedHours: number;
  techStack: string[];
  requiredSkills: string[];
  complexityFactors: string[];
} {
  const text = `${title} ${description}`.toLowerCase();

  // Detect tech stack
  const techStack: string[] = [];
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      techStack.push(tech);
    }
  }

  // If no tech detected, add basic ones
  if (techStack.length === 0) {
    techStack.push('React', 'Node.js', 'Database');
  }

  // Calculate complexity factors
  const complexityFactors: string[] = [];
  let complexityBonus = 0;

  for (const [keyword, data] of Object.entries(complexityKeywords)) {
    if (text.includes(keyword)) {
      complexityFactors.push(data.factor);
      complexityBonus += data.score;
    }
  }

  // Base difficulty from description length and complexity
  const wordCount = description.split(/\s+/).length;
  let baseDifficulty = 1;

  if (wordCount > 50) baseDifficulty = 2;
  if (wordCount > 100) baseDifficulty = 2.5;
  if (wordCount > 200) baseDifficulty = 3;
  if (wordCount > 300) baseDifficulty = 3.5;

  // Add tech stack complexity
  baseDifficulty += techStack.length * 0.15;

  // Add complexity bonus
  baseDifficulty += complexityBonus;

  // Cap at 5
  const difficultyScore = Math.min(5, Math.max(1, Math.round(baseDifficulty * 2) / 2));

  // Estimate hours based on difficulty
  const hourEstimates: Record<number, [number, number]> = {
    1: [8, 24],      // 1-3 days
    1.5: [24, 48],   // 3-6 days
    2: [40, 80],     // 1-2 weeks
    2.5: [60, 120],  // 1.5-3 weeks
    3: [80, 160],    // 2-4 weeks
    3.5: [120, 240], // 3-6 weeks
    4: [160, 320],   // 4-8 weeks
    4.5: [240, 480], // 6-12 weeks
    5: [320, 640],   // 8-16 weeks
  };

  const [minHours, maxHours] = hourEstimates[difficultyScore] || [160, 320];
  const estimatedHours = Math.round((minHours + maxHours) / 2);

  // Get required skills based on difficulty level
  const skillLevel = Math.ceil(difficultyScore);
  const requiredSkills: string[] = [];
  for (let i = 1; i <= skillLevel; i++) {
    requiredSkills.push(...(skillsByLevel[i] || []));
  }

  return {
    difficultyScore,
    estimatedHours,
    techStack: [...new Set(techStack)],
    requiredSkills: [...new Set(requiredSkills)],
    complexityFactors: [...new Set(complexityFactors)],
  };
}

// GET /api/ideas/[id]/difficulty - Get or generate difficulty rating
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Check if rating already exists
    const { data: existingRating } = await supabase
      .from('idea_difficulty_ratings')
      .select('*')
      .eq('idea_id', ideaId)
      .single();

    if (existingRating) {
      const transformed = transformToCamelCase<Record<string, unknown>>(existingRating);
      return successResponse({ data: transformed });
    }

    // Get idea to analyze
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, title, description')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea không tồn tại', 404);
    }

    // Analyze idea
    const analysis = analyzeIdea(idea.title, idea.description);

    // Save rating
    const { data: rating, error } = await supabase
      .from('idea_difficulty_ratings')
      .insert({
        idea_id: ideaId,
        difficulty_score: analysis.difficultyScore,
        estimated_hours: analysis.estimatedHours,
        tech_stack: analysis.techStack,
        required_skills: analysis.requiredSkills,
        complexity_factors: analysis.complexityFactors,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving rating:', error);
      // Still return the analysis even if saving fails
      return successResponse({
        data: {
          ideaId,
          ...analysis,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const transformed = transformToCamelCase<Record<string, unknown>>(rating);
    return successResponse({ data: transformed });
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]/difficulty:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST /api/ideas/[id]/difficulty - Force regenerate difficulty rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ideaId } = await params;
    const supabase = createServerClient();

    // Get idea to analyze
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, title, description')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return errorResponse('Idea không tồn tại', 404);
    }

    // Analyze idea
    const analysis = analyzeIdea(idea.title, idea.description);

    // Upsert rating
    const { data: rating, error } = await supabase
      .from('idea_difficulty_ratings')
      .upsert({
        idea_id: ideaId,
        difficulty_score: analysis.difficultyScore,
        estimated_hours: analysis.estimatedHours,
        tech_stack: analysis.techStack,
        required_skills: analysis.requiredSkills,
        complexity_factors: analysis.complexityFactors,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'idea_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving rating:', error);
      return errorResponse('Không thể lưu đánh giá', 500);
    }

    const transformed = transformToCamelCase<Record<string, unknown>>(rating);
    return successResponse({ data: transformed });
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/difficulty:', error);
    return errorResponse('Internal server error', 500);
  }
}
