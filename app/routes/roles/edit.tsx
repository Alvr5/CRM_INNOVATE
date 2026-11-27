import { Form, useLoaderData, useParams, redirect, Link, useNavigate } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";
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

export async function clientLoader({ params }: { params: { id: string } }) {
  const role = await db.roles.getById(params.id!);
  if (!role) throw new Response("Not Found", { status: 404 });

  const permissions = await db.permissions.getAll();
  const permissionMap = Object.fromEntries(permissions.map(p => [p.id, p]));

  return { role, permissions, permissionMap };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
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

  await db.roles.update(params.id!, { name, description, permissions });
  db.auth.invalidateCache();
  return redirect(`/roles`);
}

export default function EditRole() {
  const { role, permissionMap } = useLoaderData<typeof clientLoader>();
  const params = useParams();
  const { isAdmin, hasPermission } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const roleName = "name" in role ? role.name : "";
  const rolePermissions = "permissions" in role ? role.permissions : [];
  const isSystemRole = "isSystem" in role && role.isSystem;

  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin()) return null;

  const handleDelete = async () => {
    await db.roles.delete(params.id!);
    db.auth.invalidateCache();
    window.location.href = '/roles';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Rol</h1>
        <p className="text-gray-500 mt-1">Actualiza los permisos del rol</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input type="text" id="name" name="name" defaultValue={roleName} required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" name="description" rows={3} defaultValue={"description" in role ? role.description : ""} className="mt-1 input-field" />
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
                    {ACTIONS.map(a => {
                      const hasPerm =
                        rolePermissions.includes(`${p.resource}:${a}`) ||
                        rolePermissions.includes(`${p.resource}:manage`) ||
                        rolePermissions.some((permId) => {
                          const perm = permissionMap[permId];
                          return (
                            perm &&
                            'resource' in perm &&
                            'action' in perm &&
                            perm.resource === p.resource &&
                            perm.action === a
                          );
                        });
                      return (
                        <td key={a} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            id={`${p.resource}:${a}`}
                            name={`${p.resource}:${a}`}
                            value="on"
                            defaultChecked={hasPerm}
                            disabled={isSystemRole && a === 'manage'}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to="/roles" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
          {hasPermission('roles', 'delete') && !isSystemRole && (
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Rol</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar "{roleName}"? Esta acción no se puede deshacer.</p>
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