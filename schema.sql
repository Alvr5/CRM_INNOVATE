-- CRM Innovate schema (SQLite)
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id TEXT,
  position TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  value REAL,
  stage TEXT,
  probability INTEGER,
  contact_id TEXT,
  company_id TEXT,
  expected_close_date TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  type TEXT,
  subject TEXT,
  description TEXT,
  due_date TEXT,
  completed INTEGER,
  contact_id TEXT,
  company_id TEXT,
  deal_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  source TEXT,
  status TEXT,
  score INTEGER,
  estimated_value REAL,
  assigned_to TEXT,
  notes TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  converted_at TEXT,
  converted_to_contact_id TEXT,
  converted_to_deal_id TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT,
  resource TEXT,
  action TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions TEXT,
  is_system INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  avatar TEXT,
  role_id TEXT,
  is_active INTEGER,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  key TEXT,
  value TEXT,
  category TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  sku TEXT,
  price REAL,
  tax_rate REAL,
  unit TEXT,
  type TEXT,
  is_active INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  number TEXT,
  contact_id TEXT,
  company_id TEXT,
  deal_id TEXT,
  status TEXT,
  issue_date TEXT,
  due_date TEXT,
  subtotal REAL,
  tax_amount REAL,
  total REAL,
  currency TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT,
  product_id TEXT,
  description TEXT,
  quantity REAL,
  unit_price REAL,
  tax_rate REAL,
  total REAL
);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  number TEXT,
  contact_id TEXT,
  company_id TEXT,
  deal_id TEXT,
  status TEXT,
  issue_date TEXT,
  valid_until TEXT,
  subtotal REAL,
  tax_amount REAL,
  total REAL,
  currency TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT,
  product_id TEXT,
  description TEXT,
  quantity REAL,
  unit_price REAL,
  tax_rate REAL,
  total REAL
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  department TEXT,
  position TEXT,
  manager_id TEXT,
  hire_date TEXT,
  skills TEXT,
  is_active INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
