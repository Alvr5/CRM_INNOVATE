import { Form, redirect } from "react-router";
import { db } from "~/lib/db";

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = {
    name: formData.get('name') as string,
    industry: formData.get('industry') as string,
    size: formData.get('size') as string,
    website: formData.get('website') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    country: formData.get('country') as string,
    notes: formData.get('notes') as string,
  };

  const company = await db.companies.create(data);
  return redirect(`/companies/${company.id}`);
}

export default function NewCompany() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Empresa</h1>
        <p className="text-gray-500 mt-1">Agrega una nueva empresa a tu CRM</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input type="text" id="name" name="name" required className="mt-1 input-field" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industria</label>
            <select id="industry" name="industry" className="mt-1 input-field">
              <option value="">Seleccionar</option>
              <option value="Technology">Tecnología</option>
              <option value="Manufacturing">Manufactura</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finanzas</option>
              <option value="Healthcare">Salud</option>
              <option value="Retail">Comercio</option>
              <option value="Other">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">Tamaño</label>
            <select id="size" name="size" className="mt-1 input-field">
              <option value="">Seleccionar</option>
              <option value="1-10">1-10</option>
              <option value="10-50">10-50</option>
              <option value="50-200">50-200</option>
              <option value="200-500">200-500</option>
              <option value="500-1000">500-1000</option>
              <option value="1000+">1000+</option>
            </select>
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Sitio Web</label>
            <input type="url" id="website" name="website" placeholder="https://ejemplo.com" className="mt-1 input-field" />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input type="tel" id="phone" name="phone" className="mt-1 input-field" />
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
          <Link to="/companies" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Empresa</button>
        </div>
      </Form>
    </div>
  );
}