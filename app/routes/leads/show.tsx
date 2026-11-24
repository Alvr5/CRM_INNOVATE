import { Link, useLoaderData, useParams } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";
import { useAuth } from "~/context/AuthContext";

export async function clientLoader({ params }: { params: { id: string } }) {
  const lead = await db.leads.getById(params.id!);
  if (!lead) throw new Response("Not Found", { status: 404 });

  const [assignedUser, contact, deal, activities] = await Promise.all([
    lead.assignedTo ? db.users.getById(lead.assignedTo) : null,
    lead.convertedToContactId ? db.contacts.getById(lead.convertedToContactId) : null,
    lead.convertedToDealId ? db.deals.getById(lead.convertedToDealId) : null,
    db.activities.getAll(),
  ]);

  const leadActivities = activities.filter(a => a.contactId === lead.convertedToContactId || a.dealId === lead.convertedToDealId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { lead, assignedUser, contact, deal, activities: leadActivities };
}

export default function LeadShow() {
  const { lead, assignedUser, contact, deal, activities } = useLoaderData<typeof clientLoader>();
  const params = useParams();
  const { hasPermission } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const sourceLabels: Record<string, string> = {
    website: 'Web',
    referral: 'Referido',
    social: 'Redes Sociales',
    email: 'Email',
    phone: 'Teléfono',
    event: 'Evento',
    other: 'Otro',
  };

  const sourceColors: Record<string, string> = {
    website: 'bg-blue-100 text-blue-700',
    referral: 'bg-green-100 text-green-700',
    social: 'bg-purple-100 text-purple-700',
    email: 'bg-yellow-100 text-yellow-700',
    phone: 'bg-orange-100 text-orange-700',
    event: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Calificado',
    unqualified: 'No Calificado',
    converted: 'Convertido',
    lost: 'Perdido',
  };

  const statusColors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-700',
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-yellow-100 text-yellow-700',
    unqualified: 'bg-orange-100 text-orange-700',
    converted: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  const handleDelete = async () => {
    await db.leads.delete(lead.id);
    window.location.href = '/leads';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/leads" className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block">← Volver a Leads</Link>
          <h1 className="text-2xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h1>
        </div>
        <div className="flex space-x-3">
          {hasPermission('leads', 'update') && <Link to={`/leads/${params.id}/edit`} className="btn-secondary">Editar</Link>}
          {hasPermission('leads', 'delete') && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[lead.status]}`}>
                  {statusLabels[lead.status]}
                </span>
                <p className="mt-2 text-sm text-gray-500">Puntuación: {lead.score}/100</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(lead.estimatedValue)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <dt className="text-sm text-gray-500">Origen</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sourceColors[lead.source]}`}>
                    {sourceLabels[lead.source]}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Asignado a</dt>
                <dd className="mt-1 text-sm text-gray-900">{assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Sin asignar'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Empresa</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.company || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Cargo</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.position || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Creado</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(lead.createdAt)}</dd>
              </div>
              {lead.convertedAt && (
                <div>
                  <dt className="text-sm text-gray-500">Convertido</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(lead.convertedAt!)}</dd>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes || 'Sin notas'}</p>
            </div>
          </div>

          {contact && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contacto Creado</h3>
                <Link to={`/contacts/${contact.id}`} className="text-sm text-blue-600 hover:text-blue-800">Ver</Link>
              </div>
              <p className="text-gray-700">{contact.firstName} {contact.lastName} - {contact.email}</p>
            </div>
          )}

          {deal && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Oportunidad Creada</h3>
                <Link to={`/deals/${deal.id}`} className="text-sm text-blue-600 hover:text-blue-800">Ver</Link>
              </div>
              <p className="text-gray-700">{deal.title} - {formatCurrency(deal.value)}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Actividades ({activities.length})</h2>
              <Link to="/activities/new" className="text-sm text-blue-600 hover:text-blue-800" onClick={(e) => {
                e.preventDefault();
                const url = new URL('/activities/new', window.location.origin);
                if (contact) url.searchParams.set('contactId', contact.id);
                if (deal) url.searchParams.set('dealId', deal.id);
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
            {hasPermission('leads', 'manage') && lead.status !== 'converted' && lead.status !== 'lost' && (
              <button className="btn-secondary w-full justify-center bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                onClick={() => {
                  if (confirm(`¿Convertir a ${lead.firstName} ${lead.lastName}? Se creará un contacto y opcionalmente una oportunidad.`)) {
                    window.location.href = `/leads/${lead.id}/convert`;
                  }
                }}
              >
                Convertir Lead
              </button>
            )}
            <a href={`mailto:${lead.email}`} className="btn-secondary w-full justify-center">
              Enviar Email
            </a>
            <a href={`tel:${lead.phone}`} className="btn-secondary w-full justify-center">
              Llamar
            </a>
            {hasPermission('activities', 'create') && (
              <Link to="/activities/new" className="btn-secondary w-full justify-center" onClick={(e) => {
                e.preventDefault();
                const url = new URL('/activities/new', window.location.origin);
                url.searchParams.set('contactId', lead.id);
                window.location.href = url.toString();
              }}>
                Nueva Actividad
              </Link>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Lead</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar "{lead.firstName} {lead.lastName}"? Esta acción no se puede deshacer.</p>
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