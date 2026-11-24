import { Form, useLoaderData, redirect } from "react-router";
import { db } from "~/lib/db";
import { useAuth } from "~/context/AuthContext";

export async function clientLoader() {
  const [users, companies] = await Promise.all([
    db.users.getAll(),
    db.companies.getAll(),
  ]);
  return { users, companies };
}

export async function clientAction({ request }: { request: Request }) {
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

  const lead = await db.leads.create(data);
  return redirect(`/leads/${lead.id}`);
}

export default function NewLead() {
  const { users, companies } = useLoaderData<typeof clientLoader>();
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Lead</h1>
        <p className="text-gray-500 mt-1">Registra una nueva oportunidad de venta</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input type="text" id="firstName" name="firstName" required className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos *</label>
            <input type="text" id="lastName" name="lastName" required className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" id="email" name="email" required className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono *</label>
            <input type="tel" id="phone" name="phone" required className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
            <input type="text" id="company" name="company" list="companies" className="mt-1 input-field" />
            <datalist id="companies">
              {companies.map((company) => <option key={company.id} value={company.name} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Cargo</label>
            <input type="text" id="position" name="position" className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Origen *</label>
            <select id="source" name="source" defaultValue="other" className="mt-1 input-field">
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
            <select id="status" name="status" defaultValue="new" className="mt-1 input-field">
              <option value="new">Nuevo</option>
              <option value="contacted">Contactado</option>
              <option value="qualified">Calificado</option>
              <option value="unqualified">No Calificado</option>
            </select>
          </div>
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700">Puntuación (0-100)</label>
            <input type="number" id="score" name="score" min="0" max="100" defaultValue="0" className="mt-1 input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700">Valor Estimado (€)</label>
            <input type="number" id="estimatedValue" name="estimatedValue" step="0.01" min="0" defaultValue="0" className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Asignado a</label>
            <select id="assignedTo" name="assignedTo" defaultValue={user?.id || ''} className="mt-1 input-field">
              <option value="">Sin asignar</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" id="address" name="address" className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
            <input type="text" id="city" name="city" className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
            <input type="text" id="country" name="country" className="mt-1 input-field" />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
          <textarea id="notes" name="notes" rows={4} className="mt-1 input-field" placeholder="Información adicional..." />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <a href="/leads" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Crear Lead</button>
        </div>
      </Form>
    </div>
  );
}