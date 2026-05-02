-- System Reports and Automation
-- Date: May 2, 2026

-- 1. Scheduled Reports Table
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
    frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    recipients TEXT[] DEFAULT '{}',
    filters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Webhook Queue (Centralized delivery)
CREATE TABLE IF NOT EXISTS webhook_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    target_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INT DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled reports" ON scheduled_reports
    FOR ALL USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
    );

CREATE POLICY "System can view webhook queue" ON webhook_queue
    FOR SELECT USING (true);
