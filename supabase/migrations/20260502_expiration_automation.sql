-- Migration: Expiration Automation
-- Goal: Automatically detect expiring documents and generate system notifications

-- 1. Function to process expirations and generate alerts
CREATE OR REPLACE FUNCTION process_document_expirations()
RETURNS void AS $$
DECLARE
    doc_record RECORD;
BEGIN
    -- A. Mark expired documents correctly
    UPDATE documents
    SET status = 'EXPIRED'
    WHERE expiry_date < CURRENT_DATE
    AND status != 'EXPIRED';

    -- B. Generate warnings for documents expiring in the next 10 days
    FOR doc_record IN 
        SELECT d.id, d.title, d.expiry_date, d.org_id, d.created_by, p.org_id as profile_org_id
        FROM documents d
        JOIN profiles p ON d.created_by = p.id
        WHERE d.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '10 days')
        AND d.status NOT IN ('EXPIRED', 'REJECTED')
    LOOP
        -- Check if a notification already exists for this document to avoid spam
        -- We check if there's a notification for the same document (via link) in the last 7 days
        IF NOT EXISTS (
            SELECT 1 FROM notifications 
            WHERE user_id = doc_record.created_by 
            AND link LIKE '%' || doc_record.id || '%'
            AND created_at > (NOW() - INTERVAL '7 days')
            AND type = 'WARNING'
        ) THEN
            INSERT INTO notifications (user_id, org_id, title, message, type, link)
            VALUES (
                doc_record.created_by,
                doc_record.org_id,
                'Vencimiento Próximo',
                'El documento "' || doc_record.title || '" vence el ' || doc_record.expiry_date || '. Por favor, prepara la renovación.',
                'WARNING',
                '/documents' -- Could be more specific if we had a detail page
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Optional: Trigger to check on every new document or update
-- (Though a daily cron is better, this ensures immediate detection on changes)
-- Note: In Supabase, you'd typically schedule this via pg_cron or an Edge Function.
