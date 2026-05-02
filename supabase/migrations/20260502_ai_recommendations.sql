-- Migration: AI Recommendations Infrastructure
-- Goal: Enable organization categorization and AI-based document suggestions

-- 1. Add metadata column to organizations if not exists
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Create a table for AI Insight logs (for auditing recommendations)
CREATE TABLE IF NOT EXISTS ai_insight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- 'DOCUMENT_SUGGESTION', 'RISK_ALERT'
    content JSONB NOT NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Comment for documentation
COMMENT ON COLUMN organizations.metadata IS 'Stores vendor profile info like category, employee count, etc. used for AI insights.';
