-- Migration: Risk Evolution Tracking
-- Goal: Store historical risk scores to visualize improvement over time

-- 1. Table for risk snapshots
CREATE TABLE IF NOT EXISTS vendor_risk_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    captured_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(org_id, captured_at) -- One snapshot per day per vendor
);

-- 2. Function to capture daily snapshots
-- This can be called from the master automation function
CREATE OR REPLACE FUNCTION capture_risk_snapshots()
RETURNS void AS $$
BEGIN
    -- This is a bit complex in SQL because the score calculation logic is in TypeScript
    -- However, we can implement a simplified version in SQL for historical tracking
    -- Or, better: we call this from the frontend/service when an admin runs the dashboard
    -- But let's try a SQL-based approximation for consistency:
    
    INSERT INTO vendor_risk_snapshots (org_id, score, risk_level)
    SELECT 
        o.id as org_id,
        -- Simplified score calculation for the snapshot
        GREATEST(0, 100 
            - (SELECT COUNT(*) * 20 FROM vendor_document_requests r 
               LEFT JOIN documents d ON d.org_id = r.org_id AND d.title LIKE '%' || r.document_type || '%' AND d.status = 'aprobado' AND d.expiry_date >= CURRENT_DATE
               WHERE r.org_id = o.id AND d.id IS NULL) -- Missing/Expired
        ) as score,
        'N/A' as risk_level -- We'll calculate level on the fly or simplify here
    FROM organizations o
    WHERE o.parent_org_id IS NOT NULL
    ON CONFLICT (org_id, captured_at) DO UPDATE 
    SET score = EXCLUDED.score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update master automation to include snapshot capture
CREATE OR REPLACE FUNCTION process_full_compliance_automation_v2()
RETURNS void AS $$
BEGIN
    PERFORM process_document_expirations();
    PERFORM apply_preventive_blocking();
    PERFORM process_nudge_notifications();
    PERFORM capture_risk_snapshots();
END;
$$ LANGUAGE plpgsql;
