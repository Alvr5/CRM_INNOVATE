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
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  assigneeId?: string;
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

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
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

export interface QuoteItem {
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
