import { Form, useLoaderData, useParams, redirect, Link } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";

export async function clientLoader({ params }: { params: { id: string } }) {
  const activity = await db.activities.getById(params.id!);
  if (!activity) throw new Response("Not Found", { status: 404 });

  const [contacts, companies, deals] = await Promise.all([
    db.contacts.getAll(),
    db.companies.getAll(),
    db.deals.getAll(),
  ]);

  return { activity, contacts, companies, deals };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
  const formData = await request.formData();
  const data = {
    type: (formData.get('type') as any) || 'task',
    subject: formData.get('subject') as string,
    description: formData.get('description') as string,
    dueDate: formData.get('dueDate') as string,
    completed: formData.get('completed') === 'on',
    contactId: formData.get('contactId') as string || undefined,
    companyId: formData.get('companyId') as string || undefined,
    dealId: formData.get('dealId') as string || undefined,
  };

  await db.activities.update(params.id!, data);
  return redirect(`/activities`);
}

export default function EditActivity() {
  const { activity, contacts, companies, deals } = useLoaderData<typeof clientLoader>();
  const params = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await db.activities.delete(params.id!);
    window.location.href = '/activities';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Actividad</h1>
        <p className="text-gray-500 mt-1">Actualiza la información de la actividad</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo *</label>
          <select id="type" name="type" defaultValue={activity.type} className="mt-1 input-field">
            <option value="task">Tarea</option>
            <option value="call">Llamada</option>
            <option value="email">Email</option>
            <option value="meeting">Reunión</option>
            <option value="note">Nota</option>
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto *</label>
          <input type="text" id="subject" name="subject" defaultValue={activity.subject} required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" name="description" rows={4} defaultValue={activity.description} className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Fecha límite *</label>
          <input type="date" id="dueDate" name="dueDate" defaultValue={activity.dueDate} required className="mt-1 input-field" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">Contacto</label>
            <select id="contactId" name="contactId" defaultValue={activity.contactId || ''} className="mt-1 input-field">
              <option value="">Sin contacto</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName} ({contact.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Empresa</label>
            <select id="companyId" name="companyId" defaultValue={activity.companyId || ''} className="mt-1 input-field">
              <option value="">Sin empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dealId" className="block text-sm font-medium text-gray-700">Oportunidad</label>
            <select id="dealId" name="dealId" defaultValue={activity.dealId || ''} className="mt-1 input-field">
              <option value="">Sin oportunidad</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>{deal.title} ({new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(deal.value)})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="completed" name="completed" defaultChecked={activity.completed} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <label htmlFor="completed" className="ml-2 block text-sm text-gray-700">Marcar como completada</label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to="/activities" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            Eliminar
          </button>
        </div>
      </Form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Actividad</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar "{activity.subject}"? Esta acción no se puede deshacer.</p>
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