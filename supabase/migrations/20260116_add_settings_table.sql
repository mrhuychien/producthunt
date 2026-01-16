-- ============================================================================
-- Settings Table for storing app configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(500),
    is_secret BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO app_settings (key, value, description, is_secret) VALUES
('openai_api_key', '', 'OpenAI API key for AI Fusion feature', true),
('ai_model', 'gpt-3.5-turbo', 'AI model to use (gpt-3.5-turbo, gpt-4, etc.)', false),
('fusion_enabled', 'true', 'Enable/disable AI Fusion feature', false),
('auto_idea_enabled', 'true', 'Enable/disable auto idea generation', false),
('auto_idea_count', '10', 'Number of ideas to generate daily', false)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read/write (service role bypasses RLS)
CREATE POLICY "Admin read access" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON app_settings FOR ALL USING (auth.jwt()->>'role' = 'service_role');
