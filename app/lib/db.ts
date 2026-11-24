import { supabase } from '~/lib/supabase';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId?: string;
  position: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  contactId?: string;
  companyId?: string;
  expectedCloseDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  subject: string;
  description: string;
  dueDate: string;
  completed: boolean;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position: string;
  source: 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  score: number;
  estimatedValue: number;
  assignedTo?: string;
  notes: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  convertedToContactId?: string;
  convertedToDealId?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  roleId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'company' | 'billing' | 'email' | 'integrations' | 'appearance';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  taxRate: number;
  unit: string;
  type: 'product' | 'service';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  issueDate: string;
  validUntil: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  department: string;
  position: string;
  managerId?: string;
  hireDate: string;
  skills: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type EntityMap = {
  contacts: Contact;
  companies: Company;
  deals: Deal;
  activities: Activity;
  leads: Lead;
  users: User;
  roles: Role;
  permissions: Permission;
  settings: Setting;
  products: Product;
  invoices: Invoice;
  quotes: Quote;
  teamMembers: TeamMember;
};

const TABLE_NAMES: Record<keyof EntityMap, string> = {
  contacts: 'contacts',
  companies: 'companies',
  deals: 'deals',
  activities: 'activities',
  leads: 'leads',
  users: 'users',
  roles: 'roles',
  permissions: 'permissions',
  settings: 'settings',
  products: 'products',
  invoices: 'invoices',
  quotes: 'quotes',
  teamMembers: 'team_members',
};

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    // Convert empty strings to null (for UUID foreign keys and optional fields)
    result[camelToSnake(key)] = value === '' ? null : value;
  }
  return result;
}

function fromSnakeCase<T extends Record<string, any>>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result as T;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createCrud<T extends { id: string }>(entity: keyof EntityMap) {
  const table = TABLE_NAMES[entity];
  return {
    getAll: async (): Promise<T[]> => {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return (data || []).map(item => fromSnakeCase<T>(item));
    },
    getById: async (id: string): Promise<T | null> => {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error || !data) return null;
      return fromSnakeCase<T>(data);
    },
    create: async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> => {
      const now = new Date().toISOString();
      const newItem = { ...data, createdAt: now, updatedAt: now };
      const { data: result, error } = await supabase.from(table).insert(toSnakeCase(newItem) as any).select().single();
      if (error) throw error;
      return fromSnakeCase<T>(result);
    },
    update: async (id: string, data: Partial<T>): Promise<T | null> => {
      const updateData = { ...data } as any;
      delete updateData.id;
      const { data: result, error } = await supabase.from(table).update({ ...toSnakeCase(updateData), updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error || !result) return null;
      return fromSnakeCase<T>(result);
    },
    delete: async (id: string): Promise<void> => {
      await supabase.from(table).delete().eq('id', id);
    },
  };
}

const DEFAULT_PERMISSIONS: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Leads - Ver', resource: 'leads', action: 'read', description: 'Ver leads' },
  { name: 'Leads - Crear', resource: 'leads', action: 'create', description: 'Crear leads' },
  { name: 'Leads - Editar', resource: 'leads', action: 'update', description: 'Editar leads' },
  { name: 'Leads - Eliminar', resource: 'leads', action: 'delete', description: 'Eliminar leads' },
  { name: 'Leads - Gestionar', resource: 'leads', action: 'manage', description: 'Gestionar leads (convertir, asignar)' },
  { name: 'Contactos - Ver', resource: 'contacts', action: 'read', description: 'Ver contactos' },
  { name: 'Contactos - Crear', resource: 'contacts', action: 'create', description: 'Crear contactos' },
  { name: 'Contactos - Editar', resource: 'contacts', action: 'update', description: 'Editar contactos' },
  { name: 'Contactos - Eliminar', resource: 'contacts', action: 'delete', description: 'Eliminar contactos' },
  { name: 'Empresas - Ver', resource: 'companies', action: 'read', description: 'Ver empresas' },
  { name: 'Empresas - Crear', resource: 'companies', action: 'create', description: 'Crear empresas' },
  { name: 'Empresas - Editar', resource: 'companies', action: 'update', description: 'Editar empresas' },
  { name: 'Empresas - Eliminar', resource: 'companies', action: 'delete', description: 'Eliminar empresas' },
  { name: 'Oportunidades - Ver', resource: 'deals', action: 'read', description: 'Ver oportunidades' },
  { name: 'Oportunidades - Crear', resource: 'deals', action: 'create', description: 'Crear oportunidades' },
  { name: 'Oportunidades - Editar', resource: 'deals', action: 'update', description: 'Editar oportunidades' },
  { name: 'Oportunidades - Eliminar', resource: 'deals', action: 'delete', description: 'Eliminar oportunidades' },
  { name: 'Actividades - Ver', resource: 'activities', action: 'read', description: 'Ver actividades' },
  { name: 'Actividades - Crear', resource: 'activities', action: 'create', description: 'Crear actividades' },
  { name: 'Actividades - Editar', resource: 'activities', action: 'update', description: 'Editar actividades' },
  { name: 'Actividades - Eliminar', resource: 'activities', action: 'delete', description: 'Eliminar actividades' },
  { name: 'Usuarios - Ver', resource: 'users', action: 'read', description: 'Ver usuarios' },
  { name: 'Usuarios - Crear', resource: 'users', action: 'create', description: 'Crear usuarios' },
  { name: 'Usuarios - Editar', resource: 'users', action: 'update', description: 'Editar usuarios' },
  { name: 'Usuarios - Eliminar', resource: 'users', action: 'delete', description: 'Eliminar usuarios' },
  { name: 'Roles - Ver', resource: 'roles', action: 'read', description: 'Ver roles' },
  { name: 'Roles - Crear', resource: 'roles', action: 'create', description: 'Crear roles' },
  { name: 'Roles - Editar', resource: 'roles', action: 'update', description: 'Editar roles' },
  { name: 'Roles - Eliminar', resource: 'roles', action: 'delete', description: 'Eliminar roles' },
  { name: 'Configuración - Ver', resource: 'settings', action: 'read', description: 'Ver configuración' },
  { name: 'Configuración - Crear', resource: 'settings', action: 'create', description: 'Crear configuración' },
  { name: 'Configuración - Editar', resource: 'settings', action: 'update', description: 'Editar configuración' },
  { name: 'Configuración - Eliminar', resource: 'settings', action: 'delete', description: 'Eliminar configuración' },
  { name: 'Configuración - Gestionar', resource: 'settings', action: 'manage', description: 'Gestionar configuración' },
  { name: 'Productos - Ver', resource: 'products', action: 'read', description: 'Ver productos' },
  { name: 'Productos - Crear', resource: 'products', action: 'create', description: 'Crear productos' },
  { name: 'Productos - Editar', resource: 'products', action: 'update', description: 'Editar productos' },
  { name: 'Productos - Eliminar', resource: 'products', action: 'delete', description: 'Eliminar productos' },
  { name: 'Facturas - Ver', resource: 'invoices', action: 'read', description: 'Ver facturas' },
  { name: 'Facturas - Crear', resource: 'invoices', action: 'create', description: 'Crear facturas' },
  { name: 'Facturas - Editar', resource: 'invoices', action: 'update', description: 'Editar facturas' },
  { name: 'Facturas - Eliminar', resource: 'invoices', action: 'delete', description: 'Eliminar facturas' },
  { name: 'Presupuestos - Ver', resource: 'quotes', action: 'read', description: 'Ver presupuestos' },
  { name: 'Presupuestos - Crear', resource: 'quotes', action: 'create', description: 'Crear presupuestos' },
  { name: 'Presupuestos - Editar', resource: 'quotes', action: 'update', description: 'Editar presupuestos' },
  { name: 'Presupuestos - Eliminar', resource: 'quotes', action: 'delete', description: 'Eliminar presupuestos' },
  { name: 'Equipo - Ver', resource: 'teamMembers', action: 'read', description: 'Ver equipo' },
  { name: 'Equipo - Crear', resource: 'teamMembers', action: 'create', description: 'Crear miembros de equipo' },
  { name: 'Equipo - Editar', resource: 'teamMembers', action: 'update', description: 'Editar miembros de equipo' },
  { name: 'Equipo - Eliminar', resource: 'teamMembers', action: 'delete', description: 'Eliminar miembros de equipo' },
];

const DEFAULT_ROLES: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: DEFAULT_PERMISSIONS.map(p => `${p.resource}:${p.action}`),
    isSystem: true,
  },
  {
    name: 'Gerente de Ventas',
    description: 'Gestión completa de ventas y equipo',
    permissions: [
      'leads:read', 'leads:create', 'leads:update', 'leads:manage',
      'contacts:read', 'contacts:create', 'contacts:update', 'contacts:delete',
      'companies:read', 'companies:create', 'companies:update', 'companies:delete',
      'deals:read', 'deals:create', 'deals:update', 'deals:delete',
      'activities:read', 'activities:create', 'activities:update', 'activities:delete',
      'products:read', 'products:create', 'products:update',
      'invoices:read', 'invoices:create', 'invoices:update',
      'quotes:read', 'quotes:create', 'quotes:update',
      'teamMembers:read', 'teamMembers:create', 'teamMembers:update',
      'settings:read', 'settings:update',
      'users:read',
    ],
    isSystem: true,
  },
  {
    name: 'Vendedor',
    description: 'Gestión de sus leads, contactos y oportunidades',
    permissions: [
      'leads:read', 'leads:create', 'leads:update',
      'contacts:read', 'contacts:create', 'contacts:update',
      'companies:read', 'companies:create', 'companies:update',
      'deals:read', 'deals:create', 'deals:update',
      'activities:read', 'activities:create', 'activities:update',
      'products:read',
      'quotes:read', 'quotes:create',
      'teamMembers:read',
    ],
    isSystem: true,
  },
  {
    name: 'Solo Lectura',
    description: 'Solo visualización de datos',
    permissions: [
      'leads:read', 'contacts:read', 'companies:read', 'deals:read', 'activities:read', 'users:read',
      'products:read', 'invoices:read', 'quotes:read', 'teamMembers:read', 'settings:read',
    ],
    isSystem: true,
  },
];

const DEFAULT_USERS: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@crm.com',
    passwordHash: 'hashed_admin123',
    roleId: '',
    isActive: true,
  },
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@crm.com',
    passwordHash: 'hashed_vendedor123',
    roleId: '',
    isActive: true,
  },
  {
    firstName: 'María',
    lastName: 'García',
    email: 'maria@crm.com',
    passwordHash: 'hashed_gerente123',
    roleId: '',
    isActive: true,
  },
];

const DEFAULT_LEADS: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@empresa.com',
    phone: '+34-600-111-222',
    company: 'TechStart SL',
    position: 'CTO',
    source: 'website',
    status: 'new',
    score: 85,
    estimatedValue: 25000,
    assignedTo: '',
    notes: 'Interesado en solución empresarial',
    address: 'Calle Mayor 123',
    city: 'Madrid',
    country: 'España',
  },
  {
    firstName: 'Ana',
    lastName: 'Martín',
    email: 'ana.martin@startup.io',
    phone: '+34-600-333-444',
    company: 'StartupIO',
    position: 'CEO',
    source: 'referral',
    status: 'contacted',
    score: 70,
    estimatedValue: 15000,
    assignedTo: '',
    notes: 'Referido por cliente actual',
    address: 'Av. Diagonal 456',
    city: 'Barcelona',
    country: 'España',
  },
  {
    firstName: 'Pedro',
    lastName: 'González',
    email: 'pedro.gonzalez@corp.es',
    phone: '+34-600-555-666',
    company: 'Corporación Global',
    position: 'Director TI',
    source: 'event',
    status: 'qualified',
    score: 90,
    estimatedValue: 50000,
    assignedTo: '',
    notes: 'Contactado en evento TechSummit',
    address: 'Paseo Castellana 789',
    city: 'Madrid',
    country: 'España',
  },
];

export const db = {
  contacts: createCrud<Contact>('contacts'),
  companies: createCrud<Company>('companies'),
  deals: createCrud<Deal>('deals'),
  activities: createCrud<Activity>('activities'),
  leads: createCrud<Lead>('leads'),
  users: createCrud<User>('users'),
  roles: createCrud<Role>('roles'),
  permissions: createCrud<Permission>('permissions'),
  settings: createCrud<Setting>('settings'),
  products: createCrud<Product>('products'),
  invoices: createCrud<Invoice>('invoices'),
  quotes: createCrud<Quote>('quotes'),
  teamMembers: createCrud<TeamMember>('teamMembers'),

  seed: async () => {
    if (typeof window === 'undefined') return;

    try {
      // Clear old localStorage seed flag so we always check Supabase
      localStorage.removeItem('crm_seeded');

      const { data: existing, error: checkError } = await supabase.from('permissions').select('id').limit(1);
      if (checkError) {
        console.error('Error checking seed status:', checkError);
        return;
      }
      if (existing && existing.length > 0) return;

      const createdPermissions: Permission[] = [];
      for (const p of DEFAULT_PERMISSIONS) {
        const { data, error } = await supabase.from('permissions').insert(toSnakeCase(p) as any).select().single();
        if (error) {
          console.error('Error creating permission:', p.name, error);
          continue;
        }
        if (data) createdPermissions.push(fromSnakeCase(data));
      }

      const createdRoles: Role[] = [];
      for (const r of DEFAULT_ROLES) {
        const rolePermissions = r.permissions.map(permName => {
          const perm = createdPermissions.find(p => `${p.resource}:${p.action}` === permName);
          return perm ? perm.id : permName;
        });
        const { data, error } = await supabase.from('roles').insert(toSnakeCase({ ...r, permissions: rolePermissions }) as any).select().single();
        if (error) {
          console.error('Error creating role:', r.name, error);
          continue;
        }
        if (data) createdRoles.push(fromSnakeCase(data));
      }

      const adminRole = createdRoles.find(r => r.name === 'Administrador');
      const managerRole = createdRoles.find(r => r.name === 'Gerente de Ventas');
      const sellerRole = createdRoles.find(r => r.name === 'Vendedor');

      const createdUsers: User[] = [];
      DEFAULT_USERS.forEach((u, i) => {
        let roleId = sellerRole?.id ?? '';
        if (i === 0) roleId = adminRole?.id ?? '';
        if (i === 2) roleId = managerRole?.id ?? '';
        createdUsers.push({ ...u, roleId } as User);
      });

      for (const u of createdUsers) {
        const { error } = await supabase.from('users').insert(toSnakeCase(u) as any).select().single();
        if (error) {
          console.error('Error creating user:', u.email, error);
        }
      }

      for (const [i, lead] of DEFAULT_LEADS.entries()) {
        const { error } = await supabase.from('leads').insert(toSnakeCase({ ...lead, assignedTo: createdUsers[i % createdUsers.length]?.id ?? '' }) as any).select().single();
        if (error) {
          console.error('Error creating lead:', lead.firstName, lead.lastName, error);
        }
      }

      const companies = [
        { name: 'TechCorp Solutions', industry: 'Technology', size: '100-500', website: 'https://techcorp.com', phone: '+1-555-0100', address: '100 Tech Blvd', city: 'San Francisco', country: 'USA', notes: 'Leading tech solutions provider' },
        { name: 'Global Manufacturing Inc', industry: 'Manufacturing', size: '1000+', website: 'https://globalmfg.com', phone: '+1-555-0200', address: '200 Industrial Way', city: 'Chicago', country: 'USA', notes: 'Global manufacturing leader' },
        { name: 'Creative Agency Co', industry: 'Marketing', size: '10-50', website: 'https://creativeagency.com', phone: '+1-555-0300', address: '300 Design St', city: 'New York', country: 'USA', notes: 'Award-winning creative agency' },
      ];

      const contacts = [
        { firstName: 'John', lastName: 'Smith', email: 'john.smith@techcorp.com', phone: '+1-555-1001', companyId: '', position: 'CTO', address: '100 Tech Blvd', city: 'San Francisco', country: 'USA', notes: 'Key decision maker' },
        { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@globalmfg.com', phone: '+1-555-1002', companyId: '', position: 'VP Operations', address: '200 Industrial Way', city: 'Chicago', country: 'USA', notes: 'Operations lead' },
        { firstName: 'Mike', lastName: 'Davis', email: 'mike.davis@creativeagency.com', phone: '+1-555-1003', companyId: '', position: 'Creative Director', address: '300 Design St', city: 'New York', country: 'USA', notes: 'Creative lead' },
      ];

      const deals = [
        { title: 'Enterprise License Renewal', value: 50000, stage: 'proposal' as const, probability: 70, contactId: '', companyId: '', expectedCloseDate: '2026-12-15', description: 'Annual enterprise license renewal for TechCorp' },
        { title: 'New CRM Implementation', value: 75000, stage: 'qualification' as const, probability: 40, contactId: '', companyId: '', expectedCloseDate: '2026-11-30', description: 'Full CRM implementation for Global Manufacturing' },
        { title: 'Website Redesign Project', value: 25000, stage: 'negotiation' as const, probability: 80, contactId: '', companyId: '', expectedCloseDate: '2026-12-01', description: 'Complete website redesign for Creative Agency' },
      ];

      const activities = [
        { type: 'meeting' as const, subject: 'Discovery call with TechCorp', description: 'Initial discovery meeting', dueDate: '2026-11-25', completed: false, contactId: '', companyId: '', dealId: '' },
        { type: 'call' as const, subject: 'Follow up with Global Manufacturing', description: 'Discuss implementation timeline', dueDate: '2026-11-22', completed: true, contactId: '', companyId: '', dealId: '' },
        { type: 'email' as const, subject: 'Proposal sent to Creative Agency', description: 'Sent website redesign proposal', dueDate: '2026-11-20', completed: true, contactId: '', companyId: '', dealId: '' },
      ];

      const createdCompanies: Company[] = [];
      for (const c of companies) {
        const { data, error } = await supabase.from('companies').insert(toSnakeCase(c) as any).select().single();
        if (error) {
          console.error('Error creating company:', c.name, error);
        } else if (data) {
          createdCompanies.push(fromSnakeCase(data));
        }
      }

      const createdContacts: Contact[] = [];
      for (const [i, c] of contacts.entries()) {
        const { data, error } = await supabase.from('contacts').insert(toSnakeCase({ ...c, companyId: createdCompanies[i]?.id ?? '' }) as any).select().single();
        if (error) {
          console.error('Error creating contact:', c.firstName, c.lastName, error);
        } else if (data) {
          createdContacts.push(fromSnakeCase(data));
        }
      }

      const createdDeals: Deal[] = [];
      for (const [i, d] of deals.entries()) {
        const { data, error } = await supabase.from('deals').insert(toSnakeCase({ ...d, contactId: createdContacts[i]?.id ?? '', companyId: createdCompanies[i]?.id ?? '' }) as any).select().single();
        if (error) {
          console.error('Error creating deal:', d.title, error);
        } else if (data) {
          createdDeals.push(fromSnakeCase(data));
        }
      }

      for (const [i, a] of activities.entries()) {
        const { error } = await supabase.from('activities').insert(toSnakeCase({ ...a, contactId: createdContacts[i]?.id ?? '', companyId: createdCompanies[i]?.id ?? '', dealId: createdDeals[i]?.id ?? '' }) as any).select().single();
        if (error) {
          console.error('Error creating activity:', a.subject, error);
        }
      }

      const settings = [
        { key: 'company_name', value: 'CRM Innovate', category: 'general' as const, description: 'Nombre de la empresa' },
        { key: 'company_email', value: 'info@crminnovate.com', category: 'general' as const, description: 'Email de la empresa' },
        { key: 'company_phone', value: '+34-900-123-456', category: 'general' as const, description: 'Teléfono de la empresa' },
        { key: 'company_address', value: 'Calle Gran Vía 1, 28013 Madrid', category: 'general' as const, description: 'Dirección de la empresa' },
        { key: 'default_currency', value: 'EUR', category: 'billing' as const, description: 'Moneda por defecto' },
        { key: 'tax_rate', value: '21', category: 'billing' as const, description: 'Tipo de IVA por defecto (%)' },
        { key: 'invoice_prefix', value: 'FAC-', category: 'billing' as const, description: 'Prefijo para facturas' },
        { key: 'quote_prefix', value: 'PRES-', category: 'billing' as const, description: 'Prefijo para presupuestos' },
        { key: 'email_notifications', value: 'true', category: 'email' as const, description: 'Activar notificaciones por email' },
        { key: 'theme', value: 'light', category: 'appearance' as const, description: 'Tema de la interfaz' },
      ];
      for (const s of settings) {
        const { error } = await supabase.from('settings').insert(toSnakeCase(s) as any).select().single();
        if (error) {
          console.error('Error creating setting:', s.key, error);
        }
      }

      const products = [
        { name: 'CRM Básico', description: 'Licencia básica de CRM por usuario/mes', sku: 'CRM-BASIC', price: 29, taxRate: 21, unit: 'mes', type: 'service' as const, isActive: true },
        { name: 'CRM Profesional', description: 'Licencia profesional con automatizaciones', sku: 'CRM-PRO', price: 79, taxRate: 21, unit: 'mes', type: 'service' as const, isActive: true },
        { name: 'CRM Enterprise', description: 'Licencia enterprise con soporte dedicado', sku: 'CRM-ENT', price: 199, taxRate: 21, unit: 'mes', type: 'service' as const, isActive: true },
        { name: 'Implementación CRM', description: 'Servicio de implementación y configuración', sku: 'SRV-IMPL', price: 2500, taxRate: 21, unit: 'proyecto', type: 'service' as const, isActive: true },
        { name: 'Capacitación Equipo', description: 'Formación para equipo de ventas (8 horas)', sku: 'SRV-TRAIN', price: 1200, taxRate: 21, unit: 'sesión', type: 'service' as const, isActive: true },
        { name: 'Soporte Prioritario', description: 'Soporte 24/7 con SLA 4 horas', sku: 'SRV-SUP', price: 500, taxRate: 21, unit: 'mes', type: 'service' as const, isActive: true },
      ];
      for (const p of products) {
        const { error } = await supabase.from('products').insert(toSnakeCase(p) as any).select().single();
        if (error) {
          console.error('Error creating product:', p.name, error);
        }
      }

      const teamMembers = [
        { userId: '', department: 'Ventas', position: 'Director de Ventas', hireDate: '2023-01-15', skills: ['Gestión de equipos', 'Negociación', 'Estrategia comercial'], isActive: true },
        { userId: '', department: 'Ventas', position: 'Account Executive', hireDate: '2023-06-01', skills: ['Prospección', 'Cierre de ventas', 'CRM'], isActive: true },
        { userId: '', department: 'Soporte', position: 'Customer Success', hireDate: '2024-01-10', skills: ['Atención al cliente', 'Onboarding', 'Retención'], isActive: true },
      ];
      const createdUsers2 = await db.users.getAll();
      for (const [i, tm] of teamMembers.entries()) {
        if (createdUsers2[i]) {
          const { error } = await supabase.from('team_members').insert(toSnakeCase({ ...tm, userId: createdUsers2[i].id }) as any).select().single();
          if (error) {
            console.error('Error creating team member:', createdUsers2[i].firstName, error);
          }
        }
      }

      localStorage.setItem('crm_seeded', 'true');
      console.log('Seed completed successfully');
    } catch (error) {
      console.error('Seed failed:', error);
    }
  },

  auth: {
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error || !data) return null;
      const user = fromSnakeCase(data);
      if (user.passwordHash !== `hashed_${password}` || !user.isActive) return null;
      const role = await db.roles.getById(user.roleId);
      const currentUser = { ...user, passwordHash: undefined, role };
      db.auth.setCurrentUser(currentUser);
      return { user: { ...user, passwordHash: undefined }, role };
    },
    getCurrentUser: () => {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem('crm_current_user');
      if (!data) return null;
      try {
        const user = JSON.parse(data);
        // Clear session if roleId is not a valid UUID (old localStorage format)
        if (user.roleId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.roleId)) {
          localStorage.removeItem('crm_current_user');
          localStorage.removeItem('crm_seeded');
          return null;
        }
        return user;
      } catch {
        return null;
      }
    },
    setCurrentUser: (user: any) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('crm_current_user', JSON.stringify(user));
    },
    logout: () => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem('crm_current_user');
    },
    hasPermission: async (resource: string, action: string) => {
      const user = db.auth.getCurrentUser();
      if (!user) return false;
      const role = await db.roles.getById(user.roleId);
      if (!role) return false;
      if (role.name === 'Administrador') return true;
      const userPermissions: string[] = [];
      const permissions = role.permissions || [];
      for (const permId of permissions) {
        const perm = await db.permissions.getById(permId);
        userPermissions.push(perm ? `${perm.resource}:${perm.action}` : permId);
      }
      return userPermissions.includes(`${resource}:${action}`) || userPermissions.includes(`${resource}:manage`);
    },
    isAdmin: async () => {
      const user = db.auth.getCurrentUser();
      if (!user) return false;
      const role = await db.roles.getById(user.roleId);
      return role?.name === 'Administrador';
    },
  },
};
