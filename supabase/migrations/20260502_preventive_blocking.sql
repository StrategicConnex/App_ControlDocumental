-- Migration: Preventive Access Blocking
-- Goal: Automatically block personnel/vehicles access if vendor compliance fails

-- 1. Function to evaluate and apply blocking rules
CREATE OR REPLACE FUNCTION apply_preventive_blocking()
RETURNS void AS $$
DECLARE
    org_record RECORD;
    has_compliance_issues BOOLEAN;
BEGIN
    -- Loop through all vendor organizations
    FOR org_record IN SELECT id, name FROM organizations WHERE parent_org_id IS NOT NULL LOOP
        
        -- Check if there are any active document requests that ARE NOT APPROVED or ARE EXPIRED
        -- We consider a document "missing" if there's no record or the status isn't 'aprobado'
        SELECT EXISTS (
            SELECT 1 
            FROM vendor_document_requests r
            LEFT JOIN documents d ON d.org_id = r.org_id 
                AND d.title LIKE '%' || r.document_type || '%'
                AND d.status = 'aprobado'
                AND d.expiry_date >= CURRENT_DATE
            WHERE r.org_id = org_record.id
            AND r.is_active = TRUE
            AND d.id IS NULL -- This means no valid approved doc found for a required type
        ) INTO has_compliance_issues;

        IF has_compliance_issues THEN
            -- A. Block all personnel for this vendor
            UPDATE personnel
            SET status = 'bloqueado'
            WHERE org_id = org_record.id
            AND status != 'bloqueado'; -- Only update if not already blocked

            -- B. Block all vehicles for this vendor
            UPDATE vehicles
            SET status = 'bloqueado'
            WHERE org_id = org_record.id
            AND status != 'bloqueado';

            -- C. Notify the vendor owner about the block
            -- (Only notify once to avoid spam, using a check in notifications table)
            IF NOT EXISTS (
                SELECT 1 FROM notifications 
                WHERE org_id = org_record.id 
                AND title = 'ACCESO BLOQUEADO'
                AND created_at > (NOW() - INTERVAL '24 hours')
            ) THEN
                INSERT INTO notifications (org_id, title, message, type)
                VALUES (
                    org_record.id,
                    'ACCESO BLOQUEADO',
                    'El acceso de todo su personal y flota ha sido bloqueado preventivamente por falta de documentación obligatoria.',
                    'DANGER'
                );
            END IF;
        ELSE
            -- D. UNBLOCK if everything is now in order
            -- Note: We only unblock those who were blocked (assuming 'activo' is the default)
            -- This logic might need refinement if you have manual blocks
            UPDATE personnel
            SET status = 'activo'
            WHERE org_id = org_record.id
            AND status = 'bloqueado';

            UPDATE vehicles
            SET status = 'activo'
            WHERE org_id = org_record.id
            AND status = 'bloqueado';
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the expiration automation function to also call this blocking check
-- This ensures that whenever expirations are processed, access is also updated.
CREATE OR REPLACE FUNCTION process_document_expirations_with_blocking()
RETURNS void AS $$
BEGIN
    -- Run the original expiration logic
    PERFORM process_document_expirations();
    
    -- Run the preventive blocking logic
    PERFORM apply_preventive_blocking();
END;
$$ LANGUAGE plpgsql;
