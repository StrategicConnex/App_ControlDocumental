-- Notification Settings for Organizations
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,

    schedule_days INT[] DEFAULT '{1, 3, 5}', -- 1=Mon, 2=Tue... 0=Sun
    alert_vencimientos_proximos BOOLEAN DEFAULT true,
    alert_vencimientos_criticos BOOLEAN DEFAULT true,
    alert_documentos_vencidos BOOLEAN DEFAULT true,
    last_processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id)
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage their org settings"
ON notification_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.org_id = notification_settings.org_id
        AND profiles.role IN ('ADMIN', 'MANAGER')
    )
);

