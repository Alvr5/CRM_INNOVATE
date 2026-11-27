import { Form, redirect, useNavigate } from "react-router";
import { db } from "~/lib/db";
import { useAuth } from "~/context/AuthContext";
import { useEffect } from "react";

const ALL_PERMISSIONS = [
  { resource: 'leads', label: 'Leads' },
  { resource: 'contacts', label: 'Contactos' },
  { resource: 'companies', label: 'Empresas' },
  { resource: 'deals', label: 'Oportunidades' },
  { resource: 'activities', label: 'Actividades' },
  { resource: 'products', label: 'Productos' },
  { resource: 'invoices', label: 'Facturas' },
  { resource: 'quotes', label: 'Presupuestos' },
  { resource: 'teamMembers', label: 'Equipo' },
  { resource: 'users', label: 'Usuarios' },
  { resource: 'roles', label: 'Roles' },
  { resource: 'settings', label: 'Configuración' },
] as const;

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const permissions: string[] = [];

  ALL_PERMISSIONS.forEach(p => {
    ACTIONS.forEach(a => {
      if (formData.get(`${p.resource}:${a}`) === 'on') {
        permissions.push(`${p.resource}:${a}`);
      }
    });
  });

  await db.roles.create({ name, description, permissions, isSystem: false });
  return redirect(`/roles`);
}

export default function NewRole() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin()) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Rol</h1>
        <p className="text-gray-500 mt-1">Crea un nuevo rol con permisos personalizados</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input type="text" id="name" name="name" required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" name="description" rows={3} className="mt-1 input-field" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                  {ACTIONS.map(a => (
                    <th key={a} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider capitalize">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ALL_PERMISSIONS.map(p => (
                  <tr key={p.resource} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left text-sm font-medium text-gray-900">{p.label}</td>
                    {ACTIONS.map(a => (
                      <td key={a} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          id={`${p.resource}:${a}`}
                          name={`${p.resource}:${a}`}
                          value="on"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <a href="/roles" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Crear Rol</button>
        </div>
      </Form>
    </div>
  );
}