-- Migration: Nudge Automation (Recurrent Reminders)
-- Goal: Automatically remind vendors about missing or expired documents

-- 1. Function to send nudge notifications
CREATE OR REPLACE FUNCTION process_nudge_notifications()
RETURNS void AS $$
DECLARE
    req_record RECORD;
BEGIN
    -- Loop through active requirements that have issues
    FOR req_record IN 
        SELECT r.org_id, r.document_type, o.name as vendor_name
        FROM vendor_document_requests r
        JOIN organizations o ON o.id = r.org_id
        LEFT JOIN documents d ON d.org_id = r.org_id 
            AND d.title LIKE '%' || r.document_type || '%'
            AND d.status = 'aprobado'
            AND d.expiry_date >= CURRENT_DATE
        WHERE r.is_active = TRUE
        AND d.id IS NULL -- Document is missing, expired, or rejected
    LOOP
        -- Check if we already sent a nudge in the last 48 hours
        IF NOT EXISTS (
            SELECT 1 FROM notifications 
            WHERE org_id = req_record.org_id 
            AND title = 'RECORDATORIO: Documentación Pendiente'
            AND created_at > (NOW() - INTERVAL '48 hours')
        ) THEN
            INSERT INTO notifications (org_id, title, message, type, link)
            VALUES (
                req_record.org_id,
                'RECORDATORIO: Documentación Pendiente',
                'Estimado ' || req_record.vendor_name || ', aún tiene pendiente la carga o actualización de: ' || req_record.document_type || '. Por favor, regularice su situación para evitar bloqueos de acceso.',
                'WARNING',
                '/documents/new'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the master automation function to include nudges
CREATE OR REPLACE FUNCTION process_full_compliance_automation()
RETURNS void AS $$
BEGIN
    -- A. Update expirations
    PERFORM process_document_expirations();
    
    -- B. Apply access blocking
    PERFORM apply_preventive_blocking();
    
    -- C. Send recurrent nudges
    PERFORM process_nudge_notifications();
END;
$$ LANGUAGE plpgsql;
