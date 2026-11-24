import { Form, useLoaderData, redirect } from "react-router";
import { db } from "~/lib/db";

export async function clientLoader() {
  const companies = await db.companies.getAll();
  return { companies };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    companyId: formData.get('companyId') as string || undefined,
    position: formData.get('position') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    country: formData.get('country') as string,
    notes: formData.get('notes') as string,
  };

  const contact = db.contacts.create(data);
  return redirect(`/contacts/${contact.id}`);
}

export default function NewContact() {
  const { companies } = useLoaderData<typeof clientLoader>();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Contacto</h1>
        <p className="text-gray-500 mt-1">Agrega un nuevo contacto a tu CRM</p>
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" id="phone" name="phone" className="mt-1 input-field" />
          </div>
        </div>

        <div>
          <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Empresa</label>
          <select id="companyId" name="companyId" className="mt-1 input-field">
            <option value="">Sin empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">Cargo</label>
          <input type="text" id="position" name="position" className="mt-1 input-field" />
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
          <textarea id="notes" name="notes" rows={4} className="mt-1 input-field" />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <a href="/contacts" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Guardar Contacto</button>
        </div>
      </Form>
    </div>
  );
}