-- Migration: Vendor Portal Infrastructure
-- Goal: Enable external providers to manage their own documentation compliance

-- 0. Ensure updated_at helper exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Add PROVEEDOR to the allowed roles

-- We need to drop and recreate the constraint because ALTER TYPE is not always available for CHECK constraints on TEXT
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('ADMIN', 'MANAGER', 'USER', 'AUDITOR', 'PROVEEDOR'));

-- 2. Enhance Organizations for Vendor Support
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_vendor BOOLEAN DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS parent_org_id TEXT REFERENCES organizations(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_id TEXT; -- CUIT/RUT/NIT

-- 3. Vendor Document Requests
-- This table defines what documents a specific vendor must provide to the client
CREATE TABLE IF NOT EXISTS vendor_document_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    doc_type_id UUID REFERENCES document_types(id),
    frequency TEXT DEFAULT 'ONCE' CHECK (frequency IN ('ONCE', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Linking Documents to Requests
-- Add a reference in documents to know if it satisfies a vendor request
ALTER TABLE documents ADD COLUMN IF NOT EXISTS vendor_request_id UUID REFERENCES vendor_document_requests(id);


-- 5. RLS Policies for Vendors
-- Vendors should only see documents linked to their organization
DROP POLICY IF EXISTS "Vendors can view their own documents" ON documents;
CREATE POLICY "Vendors can view their own documents" ON documents
    FOR SELECT USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- Allow vendors to see their requests
ALTER TABLE vendor_document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their requests" ON vendor_document_requests
    FOR SELECT USING (
        vendor_org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Clients can manage vendor requests" ON vendor_document_requests
    FOR ALL USING (
        client_org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- 6. Trigger for updated_at
CREATE TRIGGER set_updated_at_vendor_requests
    BEFORE UPDATE ON vendor_document_requests
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
