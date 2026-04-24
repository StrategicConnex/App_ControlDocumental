# Project Foundation & Multi-tenant Database Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Initialize a Next.js 15 project with Supabase, implementing a robust multi-tenant database schema with RLS and ABAC policies tailored for the Oil & Gas industry.

**Architecture:** Modular Next.js 15 App Router architecture with a centralized Supabase client. Multi-tenant isolation enforced at the database level via PostgreSQL RLS policies and attribute-based access control (ABAC).

**Tech Stack:** Next.js 15, TypeScript, Supabase, TailwindCSS, Lucide React, Shadcn/UI.

---

### Task 1: Next.js Project Initialization

**Files:**
- Create: `./package.json`
- Create: `./next.config.ts`
- Create: `./tsconfig.json`
- Create: `./tailwind.config.ts`

**Step 1: Run create-next-app**
Run: `npx -y create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install`
Expected: Project structure created.

**Step 2: Install dependencies**
Run: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs lucide-react clsx tailwind-merge`
Expected: Core dependencies installed.

**Step 3: Commit**
```bash
git add .
git commit -m "chore: initial next.js setup"
```

### Task 2: Supabase Client & Environment Setup

**Files:**
- Create: `.env.local`
- Create: `src/lib/supabase.ts`

**Step 1: Create .env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 2: Initialize Supabase Client**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 3: Commit**
```bash
git add .env.local src/lib/supabase.ts
git commit -m "feat: setup supabase client"
```

### Task 3: Multi-tenant Database Schema (Phase 1)

**Files:**
- Create: `supabase/migrations/20260424000000_initial_schema.sql`

**Step 1: Define core tables (Organizations, Profiles)**
```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (Users with Role/Org association)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id),
  full_name TEXT,
  role TEXT DEFAULT 'USER', -- ADMIN, MANAGER, USER
  permissions JSONB DEFAULT '{}', -- ABAC attributes
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Step 2: Enable RLS and define Policies**
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policy: Users can only see their own profile or others in the same org (if admin)
CREATE POLICY "Users can view profiles in their organization"
ON profiles FOR SELECT
USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));
```

**Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: initial multi-tenant schema"
```

### Task 4: Design Tokens & Base Layout

**Files:**
- Create: `src/app/globals.css`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/app/layout.tsx`

**Step 1: Define CSS Variables (Design Tokens)**
Update `src/app/globals.css` with the "BordUp" palette (purples, greens, glassmorphism).

**Step 2: Implement Sidebar Component**
Based on `Diseño_UX_1.png`, implement the sidebar with navigation links.

**Step 3: Commit**
```bash
git add .
git commit -m "ui: implement sidebar and design tokens"
```
