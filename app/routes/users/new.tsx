import { Form, useLoaderData, redirect } from "react-router";
import { db } from "~/lib/db";
import { useAuth } from "~/context/AuthContext";

export async function clientLoader() {
  const roles = await db.roles.getAll();
  return { roles };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    passwordHash: `hashed_${formData.get('password')}`,
    roleId: formData.get('roleId') as string,
    isActive: formData.get('isActive') === 'on',
  };

  await db.users.create(data);
  return redirect('/users');
}

export default function NewUser() {
  const { roles } = useLoaderData<typeof clientLoader>();
  const { isAdmin } = useAuth();

  if (!isAdmin()) return null;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="text-gray-500 mt-1">Crea un nuevo usuario en el sistema</p>
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

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
          <input type="email" id="email" name="email" required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña *</label>
          <input type="password" id="password" name="password" required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Rol *</label>
          <select id="roleId" name="roleId" required className="mt-1 input-field">
            <option value="">Seleccionar rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="isActive" name="isActive" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Usuario activo</label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <a href="/users" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Crear Usuario</button>
        </div>
      </Form>
    </div>
  );
}