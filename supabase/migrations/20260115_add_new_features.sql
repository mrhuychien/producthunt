-- ============================================================================
-- IdeaVault New Features Migration
-- Features: Fusion, Battle, Build Progress, DNA, Steal, Difficulty, Bounty
-- ============================================================================

-- ============================================================================
-- FEATURE 1: AI Idea Fusion
-- ============================================================================

CREATE TABLE IF NOT EXISTS fused_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    concept TEXT NOT NULL,
    source_idea_ids UUID[] NOT NULL,
    vote_count INTEGER DEFAULT 0,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fused_idea_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fused_idea_id UUID NOT NULL REFERENCES fused_ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value IN (1, -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fused_idea_id, user_id)
);

CREATE INDEX idx_fused_ideas_created_by ON fused_ideas(created_by_id);
CREATE INDEX idx_fused_idea_votes_fused_idea ON fused_idea_votes(fused_idea_id);
CREATE INDEX idx_fused_idea_votes_user ON fused_idea_votes(user_id);

-- ============================================================================
-- FEATURE 2: Idea Battle Arena
-- ============================================================================

CREATE TABLE IF NOT EXISTS battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea1_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    idea2_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    idea1_votes INTEGER DEFAULT 0,
    idea2_votes INTEGER DEFAULT 0,
    winner_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    round INTEGER DEFAULT 1,
    week_number INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS battle_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voted_idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, user_id)
);

CREATE INDEX idx_battles_week ON battles(week_number);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_expires ON battles(expires_at);
CREATE INDEX idx_battle_votes_battle ON battle_votes(battle_id);
CREATE INDEX idx_battle_votes_user ON battle_votes(user_id);

-- ============================================================================
-- FEATURE 3: Build Progress Live Stream
-- ============================================================================

CREATE TABLE IF NOT EXISTS build_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    builder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES build_claims(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'image', 'commit', 'milestone')),
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    commit_url VARCHAR(500),
    milestone_title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_build_claims_idea ON build_claims(idea_id);
CREATE INDEX idx_build_claims_builder ON build_claims(builder_id);
CREATE INDEX idx_build_claims_status ON build_claims(status);
CREATE INDEX idx_progress_updates_claim ON progress_updates(claim_id);
CREATE INDEX idx_progress_updates_user ON progress_updates(user_id);

-- ============================================================================
-- FEATURE 5: Steal This Idea Mode
-- ============================================================================

CREATE TABLE IF NOT EXISTS idea_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'building', 'abandoned')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(idea_id, user_id)
);

CREATE INDEX idx_idea_interests_idea ON idea_interests(idea_id);
CREATE INDEX idx_idea_interests_user ON idea_interests(user_id);
CREATE INDEX idx_idea_interests_status ON idea_interests(status);

-- ============================================================================
-- FEATURE 6: AI Difficulty Rating
-- ============================================================================

CREATE TABLE IF NOT EXISTS idea_difficulty_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE UNIQUE,
    difficulty_score DECIMAL(2,1) NOT NULL CHECK (difficulty_score >= 1 AND difficulty_score <= 5),
    estimated_hours INTEGER NOT NULL,
    tech_stack TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    complexity_factors TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_difficulty_ratings_idea ON idea_difficulty_ratings(idea_id);
CREATE INDEX idx_difficulty_ratings_score ON idea_difficulty_ratings(difficulty_score);

-- ============================================================================
-- FEATURE 7: Micro-Bounty System
-- ============================================================================

CREATE TABLE IF NOT EXISTS idea_bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 1 AND amount <= 10000),
    currency VARCHAR(3) DEFAULT 'USD',
    message TEXT,
    status VARCHAR(20) DEFAULT 'pledged' CHECK (status IN ('pledged', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bounties_idea ON idea_bounties(idea_id);
CREATE INDEX idx_bounties_user ON idea_bounties(user_id);
CREATE INDEX idx_bounties_status ON idea_bounties(status);

-- ============================================================================
-- RLS POLICIES (Optional - Enable if using RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE fused_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fused_idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_difficulty_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_bounties ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON fused_ideas FOR SELECT USING (true);
CREATE POLICY "Public read access" ON fused_idea_votes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON battles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON battle_votes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON build_claims FOR SELECT USING (true);
CREATE POLICY "Public read access" ON progress_updates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON idea_interests FOR SELECT USING (true);
CREATE POLICY "Public read access" ON idea_difficulty_ratings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON idea_bounties FOR SELECT USING (true);

-- Allow authenticated users to insert/update their own data
CREATE POLICY "Users can insert own data" ON fused_idea_votes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own data" ON battle_votes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own data" ON build_claims FOR INSERT WITH CHECK (auth.uid()::text = builder_id::text);
CREATE POLICY "Users can insert own data" ON progress_updates FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own data" ON idea_interests FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own data" ON idea_bounties FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role full access" ON fused_ideas FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON fused_idea_votes FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON battles FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON battle_votes FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON build_claims FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON progress_updates FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON idea_interests FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON idea_difficulty_ratings FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON idea_bounties FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Tables created:
-- 1. fused_ideas, fused_idea_votes (Feature 1: AI Fusion)
-- 2. battles, battle_votes (Feature 2: Battle Arena)
-- 3. build_claims, progress_updates (Feature 3: Build Progress)
-- 4. idea_interests (Feature 5: Steal This Idea)
-- 5. idea_difficulty_ratings (Feature 6: AI Difficulty)
-- 6. idea_bounties (Feature 7: Micro-Bounty)
--
-- Note: Feature 4 (DNA Tracking) uses existing tables (ideas, votes, comments, etc.)
-- ============================================================================
