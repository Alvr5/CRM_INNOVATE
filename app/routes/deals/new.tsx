import { Form, Link, useLoaderData, useSearchParams, redirect } from "react-router";
import { db } from "~/lib/db";

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const contactId = url.searchParams.get('contactId') || undefined;
  const companyId = url.searchParams.get('companyId') || undefined;

  const [contacts, companies] = await Promise.all([
    db.contacts.getAll(),
    db.companies.getAll(),
  ]);

  return { contacts, companies, contactId, companyId };
}

export async function clientAction({ request }: { request: Request }) {
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

  const deal = await db.deals.create(data);
  return redirect(`/deals/${deal.id}`);
}

export default function NewDeal() {
  const { contacts, companies, contactId, companyId } = useLoaderData<typeof clientLoader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Oportunidad</h1>
        <p className="text-gray-500 mt-1">Crea una nueva oportunidad de venta</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título *</label>
          <input type="text" id="title" name="title" required className="mt-1 input-field" placeholder="Ej: Renovación licencia Enterprise" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor (€) *</label>
            <input type="number" id="value" name="value" step="0.01" min="0" required className="mt-1 input-field" placeholder="50000" />
          </div>
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Etapa *</label>
            <select id="stage" name="stage" defaultValue="prospecting" className="mt-1 input-field">
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
            <input type="number" id="probability" name="probability" min="0" max="100" defaultValue="10" className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">Contacto</label>
            <select id="contactId" name="contactId" defaultValue={contactId || searchParams.get('contactId') || ''} className="mt-1 input-field">
              <option value="">Sin contacto</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName} ({contact.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Empresa</label>
            <select id="companyId" name="companyId" defaultValue={companyId || searchParams.get('companyId') || ''} className="mt-1 input-field">
              <option value="">Sin empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-700">Fecha estimada de cierre *</label>
          <input type="date" id="expectedCloseDate" name="expectedCloseDate" required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" name="description" rows={4} className="mt-1 input-field" placeholder="Detalles de la oportunidad..." />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to="/deals" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Crear Oportunidad</button>
        </div>
      </Form>
    </div>
  );
}