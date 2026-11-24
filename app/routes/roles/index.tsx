import { Link, useLoaderData, useNavigate } from "react-router";
import { db } from "~/lib/db";
import { useAuth } from "~/context/AuthContext";
import { useEffect } from "react";

const ALL_PERMISSIONS = [
  { resource: 'leads', label: 'Leads' },
  { resource: 'contacts', label: 'Contactos' },
  { resource: 'companies', label: 'Empresas' },
  { resource: 'deals', label: 'Oportunidades' },
  { resource: 'activities', label: 'Actividades' },
  { resource: 'users', label: 'Usuarios' },
  { resource: 'roles', label: 'Roles' },
  { resource: 'settings', label: 'Configuración' },
] as const;

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;

export async function clientLoader() {
  const [roles, permissions] = await Promise.all([
    db.roles.getAll(),
    Promise.resolve(db.permissions.getAll()),
  ]);

  const permissionList = permissions as unknown as Array<{
    id: string;
    resource: string;
    action: string;
  }>;
  const permissionMap = new Map(permissionList.map(p => [p.id, p]));

  return { roles, permissionMap: Object.fromEntries(permissionMap) };
}

export default function RolesIndex() {
  const { roles, permissionMap } = useLoaderData<typeof clientLoader>();
  const { isAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin()) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
          <p className="text-gray-500 mt-1">Gestiona los roles y permisos del sistema</p>
        </div>
        {hasPermission('roles', 'create') && (
          <Link to="/roles/new" className="btn-primary">Nuevo Rol</Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {roles.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay roles</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer rol.</p>
            {hasPermission('roles', 'create') && (
              <div className="mt-6">
                <Link to="/roles/new" className="btn-primary">Crear Rol</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sistema</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/roles/${role.id}/edit`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {role.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.isSystem ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {role.isSystem ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map((permId) => {
                          const perm = permissionMap[permId];
                          return perm ? (
                            <span key={perm.id} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                              {perm.resource}:{perm.action}
                            </span>
                          ) : (
                            <span key={permId} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                              {permId}
                            </span>
                          );
                        })}
                        {role.permissions.length > 5 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                            +{role.permissions.length - 5} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {hasPermission('roles', 'update') && (
                        <Link to={`/roles/${role.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">Editar</Link>
                      )}
                      {hasPermission('roles', 'delete') && !role.isSystem && (
                        <button
                          onClick={async () => {
                            if (confirm('¿Estás seguro de eliminar este rol?')) {
                              await db.roles.delete(role.id);
                              window.location.reload();
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriz de Permisos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-10">Rol</th>
                {ALL_PERMISSIONS.flatMap(p => ACTIONS.map(a => (
                  <th key={`${p.resource}:${a}`} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rotate-45">
                    <div className="whitespace-nowrap">{p.label} - {a}</div>
                  </th>
                )))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-left text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    {role.name} {role.isSystem && <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Sistema</span>}
                  </td>
                  {ALL_PERMISSIONS.flatMap(p => ACTIONS.map(a => {
                    const hasPerm = role.permissions.some(permId => {
                      const perm = permissionMap[permId];
                      return perm && perm.resource === p.resource && perm.action === a;
                    }) || role.permissions.includes(`${p.resource}:manage`);
                    return (
                      <td key={`${p.resource}:${a}`} className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={hasPerm}
                          disabled
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-not-allowed"
                        />
                      </td>
                    );
                  }))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}