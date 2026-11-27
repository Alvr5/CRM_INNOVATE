import { Link, useLoaderData, useParams } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";

export async function clientLoader({ params }: { params: { id: string } }) {
  const deal = await db.deals.getById(params.id!);
  if (!deal) throw new Response("Not Found", { status: 404 });

  const [contact, company, activities] = await Promise.all([
    deal.contactId ? db.contacts.getById(deal.contactId) : null,
    deal.companyId ? db.companies.getById(deal.companyId) : null,
    db.activities.getAll(),
  ]);

  const dealActivities = activities.filter(a => a.dealId === deal.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { deal, contact, company, activities: dealActivities };
}

export default function DealShow() {
  const { deal, contact, company, activities } = useLoaderData<typeof clientLoader>();
  const params = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = async () => {
    await db.deals.delete(deal.id);
    window.location.href = '/deals';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/deals" className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block">← Volver a Oportunidades</Link>
          <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
        </div>
        <div className="flex space-x-3">
          <Link to={`/deals/${params.id}/edit`} className="btn-secondary">Editar</Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${stageColors[deal.stage]}`}>
                  {stageLabels[deal.stage]}
                </span>
                <p className="mt-2 text-sm text-gray-500">Probabilidad: {deal.probability}%</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(deal.value)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <dt className="text-sm text-gray-500">Fecha estimada de cierre</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(deal.expectedCloseDate)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Contacto</dt>
                <dd className="mt-1 text-sm text-gray-900">{contact ? `${contact.firstName} ${contact.lastName}` : 'Sin contacto'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Empresa</dt>
                <dd className="mt-1 text-sm text-gray-900">{company?.name || 'Sin empresa'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Creado</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(deal.createdAt)}</dd>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{deal.description || 'Sin descripción'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Actividades ({activities.length})</h2>
              <Link to="/activities/new" className="text-sm text-blue-600 hover:text-blue-800" onClick={(e) => {
                e.preventDefault();
                const url = new URL('/activities/new', window.location.origin);
                url.searchParams.set('dealId', deal.id);
                window.location.href = url.toString();
              }}>Nueva</Link>
            </div>
            <div className="divide-y divide-gray-200">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay actividades registradas</div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <ActivityIcon type={activity.type} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                      <p className="text-sm text-gray-500">{activity.description || 'Sin descripción'} • {formatDate(activity.dueDate)}</p>
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link to={`/activities/new`} className="btn-secondary w-full justify-center" onClick={(e) => {
              e.preventDefault();
              const url = new URL('/activities/new', window.location.origin);
              url.searchParams.set('dealId', deal.id);
              window.location.href = url.toString();
            }}>
              Nueva Actividad
            </Link>
            {contact && (
              <a href={`mailto:${contact.email}`} className="btn-secondary w-full justify-center">
                Enviar Email
              </a>
            )}
            {contact && (
              <a href={`tel:${contact.phone}`} className="btn-secondary w-full justify-center">
                Llamar
              </a>
            )}
            <form method="post" action="/deals" className="w-full" onSubmit={(e) => {
              const stage = prompt('Nueva etapa (prospecting, qualification, proposal, negotiation, closed-won, closed-lost):');
              if (stage && ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].includes(stage)) {
                const form = e.target as HTMLFormElement;
                (form.querySelector('input[name="stage"]') as HTMLInputElement).value = stage;
              } else {
                e.preventDefault();
              }
            }}>
              <input type="hidden" name="dealId" value={deal.id} />
              <input type="hidden" name="stage" value="" />
              <button type="submit" className="btn-secondary w-full justify-center">Cambiar Etapa</button>
            </form>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Oportunidad</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar "{deal.title}"? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleDelete} className="btn-secondary bg-red-600 text-white hover:bg-red-700 border-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getActivityColor(type: string): string {
  switch (type) {
    case 'call': return 'text-green-600 bg-green-100';
    case 'email': return 'text-blue-600 bg-blue-100';
    case 'meeting': return 'text-purple-600 bg-purple-100';
    case 'task': return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

function ActivityIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'call': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    case 'email': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    case 'meeting': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'task': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    default: return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  }
}