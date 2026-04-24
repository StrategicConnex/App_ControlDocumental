-- Initial Multi-tenant Schema for App_ControlDocumental

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Auth Link + Org Association)
-- This table links Supabase Auth users to an organization and a role
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'MANAGER', 'USER', 'AUDITOR')),
  permissions JSONB DEFAULT '{}', -- ABAC attributes like { "can_approve": true, "max_budget": 5000 }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Document Types
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  required_metadata JSONB DEFAULT '[]', -- List of fields required for this document type
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Documents (RF-01 to RF-06)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  doc_type_id UUID REFERENCES document_types(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  expiry_date DATE,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- SECURITY: Row Level Security (RLS) ---

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Organizations: Only users in the organization can view it
CREATE POLICY "Users can view their organization"
ON organizations FOR SELECT
USING (id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Profiles: Users can view all profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
ON profiles FOR SELECT
USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Documents: Isolation by organization
CREATE POLICY "Users can view documents in their organization"
ON documents FOR SELECT
USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert documents in their organization"
ON documents FOR INSERT
WITH CHECK (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- --- HELPERS ---

-- Function to handle new user registration (triggers on auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'USER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
