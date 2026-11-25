import { Link } from "react-router";
import { useLoaderData } from "react-router";
import { db } from "~/lib/db";
import { useAuth } from "~/context/AuthContext";

export async function clientLoader() {
  const [contacts, companies, deals, activities, leads, products, invoices, quotes, teamMembers] = await Promise.all([
    db.contacts.getAll(),
    db.companies.getAll(),
    db.deals.getAll(),
    db.activities.getAll(),
    db.leads.getAll(),
    db.products.getAll(),
    db.invoices.getAll(),
    db.quotes.getAll(),
    db.teamMembers.getAll(),
  ]);
  const dealRecords = deals.filter(
    (deal): deal is Extract<(typeof deals)[number], { createdAt: string; title: string; value: number | string; stage: string }> =>
      'createdAt' in deal && 'title' in deal && 'value' in deal && 'stage' in deal
  );
  const activityRecords = activities.filter(
    (activity): activity is Extract<(typeof activities)[number], { completed: boolean; createdAt: string; dueDate: string }> =>
      'completed' in activity && 'createdAt' in activity && 'dueDate' in activity
  );

  const totalPipelineValue = dealRecords.reduce((sum, d) => sum + Number(d.value), 0);
  const wonDeals = dealRecords.filter(d => d.stage === 'closed-won').length;
  const openDeals = dealRecords.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length;
  const pendingActivities = activityRecords.filter(a => !a.completed).length;

  return {
    stats: {
      totalContacts: contacts.length,
      totalCompanies: companies.length,
      totalDeals: deals.length,
      totalPipelineValue,
      wonDeals,
      openDeals,
      pendingActivities,
      totalLeads: leads.length,
      totalProducts: products.length,
      totalInvoices: invoices.length,
      totalQuotes: quotes.length,
      totalTeamMembers: teamMembers.length,
    },
    recentDeals: [...dealRecords].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    recentActivities: [...activityRecords].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    upcomingActivities: activityRecords.filter(a => !a.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5),
  };
}

export default function Home() {
  const { stats, recentDeals, recentActivities, upcomingActivities } = useLoaderData<typeof clientLoader>();
  const { hasPermission, isAdmin } = useAuth();

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const stageLabels: Record<string, string> = {
    prospecting: 'Prospección',
    qualification: 'Calificación',
    proposal: 'Propuesta',
    negotiation: 'Negociación',
    'closed-won': 'Ganado',
    'closed-lost': 'Perdido',
  };

  const stageColors: Record<string, string> = {
    prospecting: 'bg-gray-100 text-gray-700',
    qualification: 'bg-blue-100 text-blue-700',
    proposal: 'bg-yellow-100 text-yellow-700',
    negotiation: 'bg-orange-100 text-orange-700',
    'closed-won': 'bg-green-100 text-green-700',
    'closed-lost': 'bg-red-100 text-red-700',
  };

  const activityIcons: Record<string, string> = {
    call: 'text-green-600',
    email: 'text-blue-600',
    meeting: 'text-purple-600',
    task: 'text-orange-600',
    note: 'text-gray-600',
  };

  const modules = [
    { name: 'Leads', description: 'Gestiona y convierte leads', href: '/leads', icon: LeadsIcon, color: 'blue', permission: { resource: 'leads', action: 'read' } },
    { name: 'Contactos', description: 'Base de datos de contactos', href: '/contacts', icon: ContactsIcon, color: 'green', permission: { resource: 'contacts', action: 'read' } },
    { name: 'Empresas', description: 'Empresas y organizaciones', href: '/companies', icon: CompaniesIcon, color: 'purple', permission: { resource: 'companies', action: 'read' } },
    { name: 'Oportunidades', description: 'Pipeline de ventas', href: '/deals', icon: DealsIcon, color: 'orange', permission: { resource: 'deals', action: 'read' } },
    { name: 'Tareas', description: 'Tablero Kanban de tareas', href: '/tasks', icon: TasksIcon, color: 'red', permission: { resource: 'activities', action: 'read' } },
    { name: 'Productos', description: 'Catálogo de productos y servicios', href: '/products', icon: ProductsIcon, color: 'indigo', permission: { resource: 'products', action: 'read' } },
    { name: 'Facturas', description: 'Facturación y cobros', href: '/invoices', icon: InvoicesIcon, color: 'teal', permission: { resource: 'invoices', action: 'read' } },
    { name: 'Presupuestos', description: 'Presupuestos y ofertas', href: '/quotes', icon: QuotesIcon, color: 'cyan', permission: { resource: 'quotes', action: 'read' } },
    { name: 'Equipo', description: 'Miembros del equipo', href: '/team', icon: TeamIcon, color: 'pink', permission: { resource: 'teamMembers', action: 'read' } },
    { name: 'Configuración', description: 'Ajustes del sistema', href: '/settings', icon: SettingsIcon, color: 'gray', permission: { resource: 'settings', action: 'read' }, adminOnly: true },
    { name: 'Usuarios', description: 'Gestión de usuarios', href: '/users', icon: UsersIcon, color: 'gray', permission: { resource: 'users', action: 'read' }, adminOnly: true },
    { name: 'Roles', description: 'Roles y permisos', href: '/roles', icon: RolesIcon, color: 'gray', permission: { resource: 'roles', action: 'read' }, adminOnly: true },
  ];

  const filteredModules = modules.filter(m => {
    if (m.adminOnly && !isAdmin()) return false;
    if (m.permission && !hasPermission(m.permission.resource, m.permission.action)) return false;
    return true;
  });

  const moduleStats: Record<string, number> = {
    Leads: stats.totalLeads,
    Contactos: stats.totalContacts,
    Empresas: stats.totalCompanies,
    Oportunidades: stats.totalDeals,
    Actividades: stats.pendingActivities,
    Productos: stats.totalProducts,
    Facturas: stats.totalInvoices,
    Presupuestos: stats.totalQuotes,
    Equipo: stats.totalTeamMembers,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen de tu actividad comercial</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/contacts/new" className="btn-primary">Nuevo Contacto</Link>
          <Link to="/deals/new" className="btn-secondary">Nueva Oportunidad</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Contactos" value={stats.totalContacts} icon={<ContactsIcon />} color="blue" />
        <StatCard title="Empresas" value={stats.totalCompanies} icon={<CompaniesIcon />} color="green" />
        <StatCard title="Oportunidades" value={stats.totalDeals} icon={<DealsIcon />} color="purple" />
        <StatCard title="Pipeline" value={formatCurrency(stats.totalPipelineValue)} icon={<PipelineIcon />} color="orange" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Módulos del CRM</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredModules.map((module) => (
              <Link key={module.name} to={module.href} className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${getColorBg(module.color)} group-hover:scale-105 transition-transform`}>
                  <module.icon className={`w-6 h-6 ${getColorText(module.color)}`} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{module.name}</h3>
                <p className="text-sm text-gray-500 mb-3 flex-1">{module.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">{moduleStats[module.name] || 0} elementos</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Oportunidades Recientes</h2>
            <Link to="/deals" className="text-sm text-blue-600 hover:text-blue-800">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentDeals.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No hay oportunidades aún</div>
            ) : (
              recentDeals.map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.id}`} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(deal.value)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${stageColors[deal.stage]}`}>
                    {stageLabels[deal.stage]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Próximas Actividades</h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-800">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingActivities.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No hay actividades pendientes</div>
            ) : (
              upcomingActivities.map((activity) => (
                <Link key={activity.id} to={`/activities/${activity.id}/edit`} className="px-6 py-4 hover:bg-gray-50 flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activityIcons[activity.type]}`}>
                    {activity.type === 'call' && <PhoneIcon className="w-4 h-4" />}
                    {activity.type === 'email' && <MailIcon className="w-4 h-4" />}
                    {activity.type === 'meeting' && <CalendarIcon className="w-4 h-4" />}
                    {activity.type === 'task' && <CheckIcon className="w-4 h-4" />}
                    {activity.type === 'note' && <DocumentIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.subject}</p>
                    <p className="text-sm text-gray-500">{formatDate(activity.dueDate)}</p>
                  </div>
                  {!activity.completed && (
                    <button className="text-gray-400 hover:text-gray-600" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-800">Ver todas</Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No hay actividad reciente</div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activityIcons[activity.type]}`}>
                  {activity.type === 'call' && <PhoneIcon className="w-4 h-4" />}
                  {activity.type === 'email' && <MailIcon className="w-4 h-4" />}
                  {activity.type === 'meeting' && <CalendarIcon className="w-4 h-4" />}
                  {activity.type === 'task' && <CheckIcon className="w-4 h-4" />}
                  {activity.type === 'note' && <DocumentIcon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                  <p className="text-sm text-gray-500">{activity.description || 'Sin descripción'}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${activity.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {activity.completed ? 'Completada' : 'Pendiente'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          {Icon}
        </div>
      </div>
    </div>
  );
}

function ContactsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.94 3.197M15.653 13.67a3 3 0 00-4.298-.007" /></svg>;
}

function CompaniesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-16.5 0a2.25 2.25 0 012.25-2.25H21a2.25 2.25 0 012.25 2.25V21a2.25 2.25 0 01-2.25 2.25H8.25a2.25 2.25 0 01-2.25-2.25V6.708M15 12a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V12zm-4.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>;
}

function DealsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-16.5 0a2.25 2.25 0 012.25-2.25H21a2.25 2.25 0 012.25 2.25V21a2.25 2.25 0 01-2.25 2.25H8.25a2.25 2.25 0 01-2.25-2.25V6.708M15 12a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V12zm-4.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>;
}

function PipelineIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function PhoneIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
}

function MailIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}

function CalendarIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}

function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function DocumentIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}

function CheckCircleIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function LeadsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>;
}

function ActivitiesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}

function TasksIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}

function ProductsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m16 0l-8 4m8-4v10M4 7v10l8 4" /></svg>;
}

function InvoicesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}

function QuotesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h4M8 16h4M8 8h4M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>;
}

function TeamIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.94 3.197M15.653 13.67a3 3 0 00-4.298-.007" /></svg>;
}

function SettingsIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}

function UsersIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}

function RolesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}

function getColorBg(color: string): string {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
    indigo: 'bg-indigo-100',
    teal: 'bg-teal-100',
    cyan: 'bg-cyan-100',
    pink: 'bg-pink-100',
    gray: 'bg-gray-100',
  };
  return colors[color] || 'bg-gray-100';
}

function getColorText(color: string): string {
  const colors: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600',
    teal: 'text-teal-600',
    cyan: 'text-cyan-600',
    pink: 'text-pink-600',
    gray: 'text-gray-600',
  };
  return colors[color] || 'text-gray-600';
}