import { Link, useLocation, Outlet, Navigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "~/context/AuthContext";

interface NavItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: { resource: string; action: string } | null;
  adminOnly?: boolean;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: DashboardIcon, permission: null },
  {
    name: 'Leads',
    icon: LeadsIcon,
    permission: { resource: 'leads', action: 'read' },
    children: [
      { name: 'Lista de Leads', href: '/leads', permission: { resource: 'leads', action: 'read' } },
      { name: 'Nuevo Lead', href: '/leads/new', permission: { resource: 'leads', action: 'create' } },
    ]
  },
  {
    name: 'Contactos',
    icon: ContactsIcon,
    permission: { resource: 'contacts', action: 'read' },
    children: [
      { name: 'Lista de Contactos', href: '/contacts', permission: { resource: 'contacts', action: 'read' } },
      { name: 'Nuevo Contacto', href: '/contacts/new', permission: { resource: 'contacts', action: 'create' } },
    ]
  },
  {
    name: 'Empresas',
    icon: CompaniesIcon,
    permission: { resource: 'companies', action: 'read' },
    children: [
      { name: 'Lista de Empresas', href: '/companies', permission: { resource: 'companies', action: 'read' } },
      { name: 'Nueva Empresa', href: '/companies/new', permission: { resource: 'companies', action: 'create' } },
    ]
  },
  {
    name: 'Oportunidades',
    icon: DealsIcon,
    permission: { resource: 'deals', action: 'read' },
    children: [
      { name: 'Pipeline', href: '/deals', permission: { resource: 'deals', action: 'read' } },
      { name: 'Nueva Oportunidad', href: '/deals/new', permission: { resource: 'deals', action: 'create' } },
    ]
  },
  {
    name: 'Tareas',
    icon: TasksIcon,
    permission: { resource: 'activities', action: 'read' },
    children: [
      { name: 'Tablero Kanban', href: '/tasks', permission: { resource: 'activities', action: 'read' } },
    ]
  },
  {
    name: 'Productos',
    icon: ProductsIcon,
    permission: { resource: 'products', action: 'read' },
    children: [
      { name: 'Catálogo', href: '/products', permission: { resource: 'products', action: 'read' } },
      { name: 'Nuevo Producto', href: '/products/new', permission: { resource: 'products', action: 'create' } },
    ]
  },
  {
    name: 'Facturas',
    icon: InvoicesIcon,
    permission: { resource: 'invoices', action: 'read' },
    children: [
      { name: 'Lista de Facturas', href: '/invoices', permission: { resource: 'invoices', action: 'read' } },
      { name: 'Nueva Factura', href: '/invoices/new', permission: { resource: 'invoices', action: 'create' } },
    ]
  },
  {
    name: 'Presupuestos',
    icon: QuotesIcon,
    permission: { resource: 'quotes', action: 'read' },
    children: [
      { name: 'Lista de Presupuestos', href: '/quotes', permission: { resource: 'quotes', action: 'read' } },
      { name: 'Nuevo Presupuesto', href: '/quotes/new', permission: { resource: 'quotes', action: 'create' } },
    ]
  },
  {
    name: 'Equipo',
    icon: TeamIcon,
    permission: { resource: 'teamMembers', action: 'read' },
    children: [
      { name: 'Miembros del Equipo', href: '/team', permission: { resource: 'teamMembers', action: 'read' } },
      { name: 'Nuevo Miembro', href: '/team/new', permission: { resource: 'teamMembers', action: 'create' } },
    ]
  },
  { name: 'Configuración', href: '/settings', icon: SettingsIcon, permission: { resource: 'settings', action: 'read' }, adminOnly: true },
  { name: 'Usuarios', href: '/users', icon: UsersIcon, permission: { resource: 'users', action: 'read' }, adminOnly: true },
  { name: 'Roles', href: '/roles', icon: RolesIcon, permission: { resource: 'roles', action: 'read' }, adminOnly: true },
];

function DashboardIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
}

function LeadsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}

function ContactsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}

function CompaniesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
}

function DealsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function TasksIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}

function UsersIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}

function RolesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}

function ProductsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m16 0l-8 4m8-4v10M4 7v10l8 4" /></svg>;
}

function InvoicesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}

function QuotesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 16h4M8 8h4M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>;
}

function TeamIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}

function SettingsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { user, logout, hasPermission, isAdmin, loading } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly && !isAdmin()) return false;
    if (item.permission && !hasPermission(item.permission.resource, item.permission.action)) return false;
    return true;
  });

  const filterChildren = (children: NavItem[]) =>
    children.filter(
      (child) =>
        !child.permission || hasPermission(child.permission.resource, child.permission.action),
    );

  const handleToggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionName)) {
        next.delete(sectionName);
      } else {
        next.add(sectionName);
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">InnovateFlow</h1>
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = item.href && (location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href)));
              const hasChildren = item.children && item.children.length > 0;
              const filteredChildren = filterChildren(item.children ?? []);
              const isExpanded = expandedSections.has(item.name);

              // Si el usuario puede ver la sección pero ningún hijo, no se pinta
              // (evita un Link con `to` indefinido).
              if (hasChildren && filteredChildren.length === 0) return null;

              if (hasChildren) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => handleToggleSection(item.name)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />}
                      {item.name}
                      <svg
                        className={`ml-auto w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1 border-l border-gray-200 pl-3">
                        {filteredChildren.map((child) => {
                          const childActive = child.href && (location.pathname === child.href || (child.href !== '/' && location.pathname.startsWith(child.href)));
                          return (
                            <Link
                              key={child.name}
                              to={child.href!}
                              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                childActive
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />}
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-semibold text-gray-900">{filteredNavigation.find(n => n.href && (location.pathname === n.href || (n.href !== '/' && location.pathname.startsWith(n.href))))?.name || 'Dashboard'}</h2>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}