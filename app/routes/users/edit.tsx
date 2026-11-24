import { Form, useLoaderData, useParams, redirect, Link, useNavigate } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";
import { useAuth } from "~/context/AuthContext";
import { useEffect } from "react";

export async function clientLoader({ params }: { params: { id: string } }) {
  const user = await db.users.getById(params.id!);
  if (!user) throw new Response("Not Found", { status: 404 });

  const roles = await db.roles.getAll();
  return { user, roles };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
  const formData = await request.formData();
  const data: any = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    roleId: formData.get('roleId') as string,
    isActive: formData.get('isActive') === 'on',
  };

  const password = formData.get('password') as string;
  if (password) {
    data.passwordHash = `hashed_${password}`;
  }

  db.users.update(params.id!, data);
  return redirect(`/users/${params.id}`);
}

export default function EditUser() {
  const { user, roles } = useLoaderData<typeof clientLoader>();
  const params = useParams();
  const { isAdmin, user: currentUser, hasPermission } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin()) return null;

  const handleDelete = () => {
    db.users.delete(params.id!);
    window.location.href = '/users';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
        <p className="text-gray-500 mt-1">Actualiza la información del usuario</p>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input type="text" id="firstName" name="firstName" defaultValue={user.firstName} required className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos *</label>
            <input type="text" id="lastName" name="lastName" defaultValue={user.lastName} required className="mt-1 input-field" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
          <input type="email" id="email" name="email" defaultValue={user.email} required className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nueva Contraseña (dejar vacío para no cambiar)</label>
          <input type="password" id="password" name="password" className="mt-1 input-field" />
        </div>

        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Rol *</label>
          <select id="roleId" name="roleId" defaultValue={user.roleId} required className="mt-1 input-field">
            <option value="">Seleccionar rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="isActive" name="isActive" defaultChecked={user.isActive} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Usuario activo</label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to={`/users/${params.id}`} className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
          {hasPermission('users', 'delete') && user.id !== currentUser?.id && (
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Usuario</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar "{user.firstName} {user.lastName}"? Esta acción no se puede deshacer.</p>
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