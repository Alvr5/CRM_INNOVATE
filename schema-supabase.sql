-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID,
  position TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'prospecting',
  probability INTEGER DEFAULT 0,
  contact_id UUID,
  company_id UUID,
  expected_close_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'task',
  subject TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  assignee_id UUID,
  contact_id UUID,
  company_id UUID,
  deal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new',
  score INTEGER DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,
  assigned_to UUID,
  notes TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  converted_at TIMESTAMPTZ,
  converted_to_contact_id UUID,
  converted_to_deal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  unit TEXT,
  type TEXT DEFAULT 'product',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT,
  contact_id UUID,
  company_id UUID,
  deal_id UUID,
  status TEXT DEFAULT 'draft',
  issue_date DATE,
  due_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  notes TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT,
  contact_id UUID,
  company_id UUID,
  deal_id UUID,
  status TEXT DEFAULT 'draft',
  issue_date DATE,
  valid_until DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  notes TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  department TEXT,
  position TEXT,
  manager_id UUID,
  hire_date DATE,
  skills TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables (public access for anon key)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Allow all on permissions" ON permissions;
DROP POLICY IF EXISTS "Allow all on roles" ON roles;
DROP POLICY IF EXISTS "Allow all on users" ON users;
DROP POLICY IF EXISTS "Allow all on contacts" ON contacts;
DROP POLICY IF EXISTS "Allow all on companies" ON companies;
DROP POLICY IF EXISTS "Allow all on deals" ON deals;
DROP POLICY IF EXISTS "Allow all on activities" ON activities;
DROP POLICY IF EXISTS "Allow all on leads" ON leads;
DROP POLICY IF EXISTS "Allow all on products" ON products;
DROP POLICY IF EXISTS "Allow all on invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all on quotes" ON quotes;
DROP POLICY IF EXISTS "Allow all on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all on settings" ON settings;

-- Allow all for anon (adjust as needed)
CREATE POLICY "Allow all on permissions" ON permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on roles" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on deals" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true) WITH CHECK (true);