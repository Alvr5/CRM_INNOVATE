import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";

export async function clientLoader() {
  const [activities, contacts, companies, deals] = await Promise.all([
    db.activities.getAll(),
    db.contacts.getAll(),
    db.companies.getAll(),
    db.deals.getAll(),
  ]);

  const contactMap = new Map(contacts.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
  const companyMap = new Map(companies.map(c => [c.id, c.name]));
  const dealMap = new Map(deals.map(d => [d.id, d.title]));

  const sortedActivities = activities.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return { activities: sortedActivities, contactMap, companyMap, dealMap };
}

export default function ActivitiesIndex() {
  const { activities, contactMap, companyMap, dealMap } = useLoaderData<typeof clientLoader>();

  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const typeLabels: Record<string, string> = {
    call: 'Llamada',
    email: 'Email',
    meeting: 'Reunión',
    task: 'Tarea',
    note: 'Nota',
  };

  const typeColors: Record<string, string> = {
    call: 'bg-green-100 text-green-700',
    email: 'bg-blue-100 text-blue-700',
    meeting: 'bg-purple-100 text-purple-700',
    task: 'bg-orange-100 text-orange-700',
    note: 'bg-gray-100 text-gray-700',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    call: <PhoneIcon />,
    email: <MailIcon />,
    meeting: <CalendarIcon />,
    task: <CheckIcon />,
    note: <DocumentIcon />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
          <p className="text-gray-500 mt-1">Gestiona tus tareas y actividades</p>
        </div>
        <Link to="/activities/new" className="btn-primary">Nueva Actividad</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividades</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primera actividad.</p>
            <div className="mt-6">
              <Link to="/activities/new" className="btn-primary">Agregar Actividad</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oportunidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[activity.type]}`}>
                        {typeIcons[activity.type]}
                        {typeLabels[activity.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/activities/${activity.id}/edit`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {activity.subject}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(activity.dueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.contactId ? contactMap.get(activity.contactId) || '-' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.companyId ? companyMap.get(activity.companyId) || '-' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.dealId ? dealMap.get(activity.dealId) || '-' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${activity.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {activity.completed ? 'Completada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/activities/${activity.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">Editar</Link>
                      <button
                        onClick={async () => {
                          if (confirm('¿Estás seguro de eliminar esta actividad?')) {
                            await db.activities.delete(activity.id);
                            window.location.reload();
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
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