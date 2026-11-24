import { Form, useLoaderData, useParams, redirect, Link } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";
import { useAuth } from "~/context/AuthContext";

export async function clientLoader({ params }: { params: { id: string } }) {
  const lead = await db.leads.getById(params.id!);
  if (!lead) throw new Response("Not Found", { status: 404 });

  const [users, companies] = await Promise.all([
    db.users.getAll(),
    db.companies.getAll(),
  ]);

  return { lead, users, companies };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
  const formData = await request.formData();
  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: formData.get('company') as string,
    position: formData.get('position') as string,
    source: (formData.get('source') as any) || 'other',
    status: (formData.get('status') as any) || 'new',
    score: parseInt(formData.get('score') as string) || 0,
    estimatedValue: parseFloat(formData.get('estimatedValue') as string) || 0,
    assignedTo: formData.get('assignedTo') as string || undefined,
    notes: formData.get('notes') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    country: formData.get('country') as string,
  };

  db.leads.update(params.id!, data);
  return redirect(`/leads/${params.id}`);
}

export default function EditLead() {
  const { lead, users, companies } = useLoaderData<typeof clientLoader>();
  const params = useParams();
  const { hasPermission } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    db.leads.delete(params.id!);
    window.location.href = '/leads';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Lead</h1>
        <p className="text-gray-500 mt-1">Actualiza la información del lead</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input type="text" id="firstName" name="firstName" defaultValue={lead.firstName} required className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos *</label>
            <input type="text" id="lastName" name="lastName" defaultValue={lead.lastName} required className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" id="email" name="email" defaultValue={lead.email} required className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono *</label>
            <input type="tel" id="phone" name="phone" defaultValue={lead.phone} required className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
            <input type="text" id="company" name="company" defaultValue={lead.company} list="companies" className="mt-1 input-field" />
            <datalist id="companies">
              {companies.map((company) => <option key={company.id} value={company.name} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Cargo</label>
            <input type="text" id="position" name="position" defaultValue={lead.position} className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Origen *</label>
            <select id="source" name="source" defaultValue={lead.source} className="mt-1 input-field">
              <option value="website">Web</option>
              <option value="referral">Referido</option>
              <option value="social">Redes Sociales</option>
              <option value="email">Email</option>
              <option value="phone">Teléfono</option>
              <option value="event">Evento</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado *</label>
            <select id="status" name="status" defaultValue={lead.status} className="mt-1 input-field">
              <option value="new">Nuevo</option>
              <option value="contacted">Contactado</option>
              <option value="qualified">Calificado</option>
              <option value="unqualified">No Calificado</option>
              <option value="converted">Convertido</option>
              <option value="lost">Perdido</option>
            </select>
          </div>
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700">Puntuación (0-100)</label>
            <input type="number" id="score" name="score" min="0" max="100" defaultValue={lead.score} className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700">Valor Estimado (€)</label>
            <input type="number" id="estimatedValue" name="estimatedValue" step="0.01" min="0" defaultValue={lead.estimatedValue} className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Asignado a</label>
            <select id="assignedTo" name="assignedTo" defaultValue={lead.assignedTo || ''} className="mt-1 input-field">
              <option value="">Sin asignar</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" id="address" name="address" defaultValue={lead.address} className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
            <input type="text" id="city" name="city" defaultValue={lead.city} className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
            <input type="text" id="country" name="country" defaultValue={lead.country} className="mt-1 input-field" />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
          <textarea id="notes" name="notes" rows={4} defaultValue={lead.notes} className="mt-1 input-field" />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to={`/leads/${params.id}`} className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
          {hasPermission('leads', 'delete') && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              Eliminar
            </button>
          )}
        </div>
      </Form>

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