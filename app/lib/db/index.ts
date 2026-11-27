import { createAuth } from "./auth";
import { createCrud } from "./crud";
import { seedDatabase } from "./seed";
import type {
  Activity,
  Company,
  Contact,
  Deal,
  Invoice,
  Lead,
  Permission,
  Product,
  Quote,
  Role,
  Setting,
  TeamMember,
  User,
} from "./types";

const contacts = createCrud<Contact>("contacts");
const companies = createCrud<Company>("companies");
const deals = createCrud<Deal>("deals");
const activities = createCrud<Activity>("activities");
const leads = createCrud<Lead>("leads");
const users = createCrud<User>("users");
const roles = createCrud<Role>("roles");
const permissions = createCrud<Permission>("permissions");
const settings = createCrud<Setting>("settings");
const products = createCrud<Product>("products");
const invoices = createCrud<Invoice>("invoices");
const quotes = createCrud<Quote>("quotes");
const teamMembers = createCrud<TeamMember>("teamMembers");

export const db = {
  contacts,
  companies,
  deals,
  activities,
  leads,
  users,
  roles,
  permissions,
  settings,
  products,
  invoices,
  quotes,
  teamMembers,
  seed: seedDatabase,
  auth: createAuth({ roles, permissions }),
};

export type {
  Activity,
  Company,
  Contact,
  Deal,
  Invoice,
  InvoiceItem,
  Lead,
  Permission,
  Product,
  Quote,
  QuoteItem,
  Role,
  Setting,
  TeamMember,
  User,
} from "./types";
