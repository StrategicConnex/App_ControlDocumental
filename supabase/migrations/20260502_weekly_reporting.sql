-- Migration: Weekly Management Reporting
-- Goal: Automate a weekly summary for management with compliance trends

-- 1. Log table for automated reports
CREATE TABLE IF NOT EXISTS automated_reports_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type TEXT NOT NULL,
    summary JSONB NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Function to generate and "send" the weekly report
CREATE OR REPLACE FUNCTION process_weekly_management_report()
RETURNS void AS $$
DECLARE
    last_report_date TIMESTAMP WITH TIME ZONE;
    total_vendors INTEGER;
    avg_score INTEGER;
    critical_count INTEGER;
    report_summary JSONB;
BEGIN
    -- Check if we sent a report in the last 7 days
    SELECT MAX(sent_at) INTO last_report_date FROM automated_reports_log WHERE report_type = 'WEEKLY_MANAGEMENT';
    
    IF last_report_date IS NULL OR last_report_date < (NOW() - INTERVAL '7 days') THEN
        -- Gather data for the report
        SELECT COUNT(*) INTO total_vendors FROM organizations WHERE parent_org_id IS NOT NULL;
        
        -- Calculate avg score from latest snapshots
        SELECT AVG(score) INTO avg_score FROM vendor_risk_snapshots 
        WHERE captured_at = CURRENT_DATE;
        
        -- Count critical vendors
        SELECT COUNT(*) INTO critical_count FROM vendor_risk_snapshots 
        WHERE captured_at = CURRENT_DATE AND score < 40;

        -- Create summary JSON
        report_summary := jsonb_build_object(
            'total_vendors', total_vendors,
            'average_health_score', avg_score,
            'critical_vendors_count', critical_count,
            'message', 'Resumen Semanal de Cumplimiento generado exitosamente.'
        );

        -- "Send" the report (Insert into notifications for admins)
        INSERT INTO notifications (org_id, title, message, type, link)
        SELECT 
            id, 
            'REPORTE SEMANAL: Resumen de Cumplimiento', 
            'El sistema ha generado el resumen ejecutivo semanal. Salud promedio: ' || avg_score || '%. Proveedores críticos: ' || critical_count || '.',
            'INFO',
            '/reports/risk-ranking'
        FROM organizations 
        WHERE parent_org_id IS NULL; -- Send to all main org (admin) accounts

        -- Log the action
        INSERT INTO automated_reports_log (report_type, summary)
        VALUES ('WEEKLY_MANAGEMENT', report_summary);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update master automation to v3
CREATE OR REPLACE FUNCTION process_full_compliance_automation_v3()
RETURNS void AS $$
BEGIN
    PERFORM process_document_expirations();
    PERFORM apply_preventive_blocking();
    PERFORM process_nudge_notifications();
    PERFORM capture_risk_snapshots();
    PERFORM process_weekly_management_report();
END;
$$ LANGUAGE plpgsql;
