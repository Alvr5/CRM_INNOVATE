import { Form, useLoaderData, useSearchParams, redirect } from "react-router";
import { db } from "~/lib/db";

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const contactId = url.searchParams.get('contactId') || undefined;
  const companyId = url.searchParams.get('companyId') || undefined;
  const dealId = url.searchParams.get('dealId') || undefined;

  const [contacts, companies, deals] = await Promise.all([
    db.contacts.getAll(),
    db.companies.getAll(),
    db.deals.getAll(),
  ]);

  return { contacts, companies, deals, contactId, companyId, dealId };
}

export async function clientAction({ request }: { request: Request }) {
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

  const activity = await db.activities.create(data);
  return redirect(`/activities`);
}

export default function NewActivity() {
  const { contacts, companies, deals, contactId, companyId, dealId } = useLoaderData<typeof clientLoader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Actividad</h1>
        <p className="text-gray-500 mt-1">Crea una nueva actividad o tarea</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo *</label>
          <select id="type" name="type" defaultValue="task" className="mt-1 input-field">
            <option value="task">Tarea</option>
            <option value="call">Llamada</option>
            <option value="email">Email</option>
            <option value="meeting">Reunión</option>
            <option value="note">Nota</option>
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto *</label>
          <input type="text" id="subject" name="subject" required className="mt-1 input-field" placeholder="Ej: Llamada de seguimiento" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" name="description" rows={4} className="mt-1 input-field" placeholder="Detalles de la actividad..." />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Fecha límite *</label>
          <input type="date" id="dueDate" name="dueDate" required className="mt-1 input-field" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div>
            <label htmlFor="dealId" className="block text-sm font-medium text-gray-700">Oportunidad</label>
            <select id="dealId" name="dealId" defaultValue={dealId || searchParams.get('dealId') || ''} className="mt-1 input-field">
              <option value="">Sin oportunidad</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>{deal.title} ({new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(deal.value)})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="completed" name="completed" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <label htmlFor="completed" className="ml-2 block text-sm text-gray-700">Marcar como completada</label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to="/activities" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Crear Actividad</button>
        </div>
      </Form>
    </div>
  );
}