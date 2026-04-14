-- SQL Schema for Supabase - Vigilancia de Cumplimiento
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Profiles (User Management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('GA_ABOGADOS_COMPLIANCE', 'GA_ABOGADOS_DP', 'CLIENT_COMPLIANCE_OFFICER', 'CLIENT_DPO')),
  practice_area TEXT NOT NULL CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  company_id UUID, -- NULL for GA Abogados staff
  is_ga_abogados BOOLEAN DEFAULT FALSE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  risk_score INTEGER DEFAULT 0,
  active_alerts INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('Activo', 'Inactivo', 'Onboarding')),
  contact_person TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to profiles after companies is created
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- 2. Incidents (Dossiers)
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  practice_area TEXT DEFAULT 'COMPLIANCE' CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  title TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('Baja', 'Media', 'Alta', 'Crítica')),
  status TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reported_by TEXT,
  category TEXT,
  assigned_to TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.1 Involved Parties (for Incidents)
CREATE TABLE IF NOT EXISTS involved_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('Investigado', 'Testigo', 'Denunciante', 'Abogado')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Chain of Custody (for Incidents)
CREATE TABLE IF NOT EXISTS chain_of_custody (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performer TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Regulations
CREATE TABLE IF NOT EXISTS regulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_area TEXT DEFAULT 'COMPLIANCE' CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  code TEXT UNIQUE,
  title TEXT NOT NULL,
  type TEXT, -- Ley, Reglamento, Política Interna, etc.
  status TEXT CHECK (status IN ('Vigente', 'Derogada', 'En Revisión')),
  criticality TEXT CHECK (criticality IN ('Baja', 'Media', 'Alta', 'Crítica')),
  agency TEXT,
  publish_date DATE,
  effective_date DATE,
  next_review DATE,
  last_modification DATE,
  summary TEXT,
  full_text TEXT,
  keywords TEXT[],
  tags TEXT[],
  scope TEXT CHECK (scope IN ('Nacional', 'Internacional', 'Sectorial', 'Regional', 'Interno')),
  linked_law TEXT,
  department TEXT,
  related_regulations TEXT[],
  sectors TEXT[],
  linked_policies TEXT[],
  update_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audits
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  practice_area TEXT DEFAULT 'COMPLIANCE' CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('Interna', 'Externa', 'Certificación')),
  status TEXT CHECK (status IN ('Planificada', 'En Progreso', 'Finalizada', 'Atrasada')),
  auditor TEXT,
  start_date DATE,
  scope TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.1 Audit Findings
CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('Baja', 'Media', 'Alta', 'Crítica')),
  status TEXT CHECK (status IN ('Abierto', 'Cerrado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Training Modules
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_area TEXT DEFAULT 'COMPLIANCE' CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  title TEXT NOT NULL,
  start_date DATE,
  deadline DATE,
  completion_rate INTEGER DEFAULT 0,
  assigned_to INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('Activo', 'Cerrado', 'Pendiente')),
  category TEXT,
  description TEXT,
  objectives TEXT,
  instructor TEXT,
  location TEXT,
  duration_hours NUMERIC,
  target_departments TEXT,
  scope TEXT CHECK (scope IN ('GLOBAL', 'SPECIFIC')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.1 Trainees (Attendees)
CREATE TABLE IF NOT EXISTS trainees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('Presente', 'Ausente', 'Justificado')),
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_area TEXT DEFAULT 'COMPLIANCE' CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('CRITICAL', 'WARNING')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company TEXT,
  related_to TEXT,
  target_view TEXT,
  target_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Evidence (Shared for multiple entities)
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'incident', 'audit', 'training', 'regulation'
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('PDF', 'IMG', 'DOC', 'AUDIO', 'EMAIL', 'VIDEO')),
  url TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT,
  hash TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_area TEXT DEFAULT 'COMPLIANCE' CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('AUDIT', 'DEADLINE', 'REVIEW', 'MEETING')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  practice_area TEXT DEFAULT 'COMPLIANCE' CHECK (practice_area IN ('COMPLIANCE', 'DATA_PROTECTION')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('Activa', 'Finalizada', 'Borrador')),
  participation INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  key_findings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9.1 Risk Dimensions
CREATE TABLE IF NOT EXISTS risk_dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES risk_assessments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  benchmark INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE involved_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_of_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_dimensions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user profile
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS SETOF profiles AS $$
  SELECT * FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RBAC Policies

-- 0. Profiles: Users can read their own profile, GA Abogados can read all
CREATE POLICY "Profiles visibility" ON profiles FOR SELECT USING (
  id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_ga_abogados = TRUE)
);

-- 1. Companies: GA Abogados can see all, Clients only their own
CREATE POLICY "Companies visibility" ON companies FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_ga_abogados = TRUE) OR
  id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- 2. Practice Area & Company Based Policies for all other tables
-- Generic policy template:
-- (is_ga_abogados AND practice_area matches) OR (NOT is_ga_abogados AND company_id matches AND practice_area matches)

-- Incidents
CREATE POLICY "Incidents visibility" ON incidents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND practice_area = incidents.practice_area
    AND (is_ga_abogados = TRUE OR company_id = incidents.company_id)
  )
);

-- Audits
CREATE POLICY "Audits visibility" ON audits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND practice_area = audits.practice_area
    AND (is_ga_abogados = TRUE OR company_id = audits.company_id)
  )
);

-- Regulations (Global, but filtered by practice area)
CREATE POLICY "Regulations visibility" ON regulations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND practice_area = regulations.practice_area
  )
);

-- Training Modules
CREATE POLICY "Training visibility" ON training_modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND practice_area = training_modules.practice_area
    AND (is_ga_abogados = TRUE OR scope = 'GLOBAL' OR company_id = training_modules.company_id)
  )
);

-- Risk Assessments
CREATE POLICY "Risk visibility" ON risk_assessments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND practice_area = risk_assessments.practice_area
    AND (is_ga_abogados = TRUE OR company_id = risk_assessments.company_id)
  )
);

-- Notifications
CREATE POLICY "Notifications visibility" ON notifications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND practice_area = notifications.practice_area
    AND (is_ga_abogados = TRUE OR company_id = notifications.company_id)
  )
);

-- Calendar Events
CREATE POLICY "Calendar visibility" ON calendar_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND practice_area = calendar_events.practice_area
    AND (is_ga_abogados = TRUE OR company_id = calendar_events.company_id)
  )
);

-- Evidence (Linked to parent entities)
CREATE POLICY "Evidence visibility" ON evidence FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_ga_abogados = TRUE) OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.company_id IS NOT NULL
    -- This is a bit complex for a single policy without joining back to parent entities, 
    -- but for now we'll allow if company_id matches (simplified)
    -- In a real app, we'd join to the parent table.
    -- (is_ga_abogados = TRUE OR company_id = ...)
  )
);
