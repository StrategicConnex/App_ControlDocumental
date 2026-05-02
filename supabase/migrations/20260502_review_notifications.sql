-- Migration: Document Review & Enhanced Notifications
-- Goal: Add support for rejection reasons and link documents to providers properly

-- 1. Add rejection_reason to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Ensure notifications table has all necessary fields if not exists
-- (Assuming we already have a notifications table from previous turn, but reinforcing structure)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id TEXT, -- For organization-wide alerts
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'SUCCESS', 'DANGER')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());
