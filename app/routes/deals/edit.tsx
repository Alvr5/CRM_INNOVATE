import { Form, useLoaderData, useParams, redirect, Link } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";

export async function clientLoader({ params }: { params: { id: string } }) {
  const deal = await db.deals.getById(params.id!);
  if (!deal) throw new Response("Not Found", { status: 404 });

  const [contacts, companies] = await Promise.all([
    db.contacts.getAll(),
    db.companies.getAll(),
  ]);

  return { deal, contacts, companies };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
  const formData = await request.formData();
  const data = {
    title: formData.get('title') as string,
    value: parseFloat(formData.get('value') as string) || 0,
    stage: (formData.get('stage') as any) || 'prospecting',
    probability: parseInt(formData.get('probability') as string) || 10,
    contactId: formData.get('contactId') as string || undefined,
    companyId: formData.get('companyId') as string || undefined,
    expectedCloseDate: formData.get('expectedCloseDate') as string,
    description: formData.get('description') as string,
  };

  await db.deals.update(params.id!, data);
  return redirect(`/deals/${params.id}`);
}

export default function EditDeal() {
  const { deal, contacts, companies } = useLoaderData<typeof clientLoader>();
  const params = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await db.deals.delete(params.id!);
    window.location.href = '/deals';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Oportunidad</h1>
        <p className="text-gray-500 mt-1">Actualiza la información de la oportunidad</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título *</label>
          <input type="text" id="title" name="title" defaultValue={deal.title} required className="mt-1 input-field" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor (€) *</label>
            <input type="number" id="value" name="value" step="0.01" min="0" defaultValue={deal.value} required className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Etapa *</label>
            <select id="stage" name="stage" defaultValue={deal.stage} className="mt-1 input-field">
              <option value="prospecting">Prospección</option>
              <option value="qualification">Calificación</option>
              <option value="proposal">Propuesta</option>
              <option value="negotiation">Negociación</option>
              <option value="closed-won">Ganado</option>
              <option value="closed-lost">Perdido</option>
            </select>
          </div>
          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700">Probabilidad (%)</label>
            <input type="number" id="probability" name="probability" min="0" max="100" defaultValue={deal.probability} className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">Contacto</label>
            <select id="contactId" name="contactId" defaultValue={deal.contactId || ''} className="mt-1 input-field">
              <option value="">Sin contacto</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName} ({contact.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Empresa</label>
            <select id="companyId" name="companyId" defaultValue={deal.companyId || ''} className="mt-1 input-field">
              <option value="">Sin empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-700">Fecha estimada de cierre *</label>
          <input type="date" id="expectedCloseDate" name="expectedCloseDate" defaultValue={deal.expectedCloseDate} required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" name="description" rows={4} defaultValue={deal.description} className="mt-1 input-field" />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to={`/deals/${params.id}`} className="btn-secondary">Cancelar</Link>
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