import { Form, useLoaderData, redirect } from "react-router";
import { db } from "~/lib/db";
import type { User } from "~/lib/db";

export async function clientLoader() {
  const users = (await db.users.getAll()).filter(u => u.isActive);
  const teamMembers = await db.teamMembers.getAll();
  const availableUsers = users.filter(u => !teamMembers.some(tm => tm.userId === u.id));
  return { availableUsers };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = {
    userId: formData.get("userId") as string,
    department: formData.get("department") as string,
    position: formData.get("position") as string,
    managerId: formData.get("managerId") as string || undefined,
    hireDate: formData.get("hireDate") as string,
    skills: (formData.get("skills") as string).split(',').map(s => s.trim()).filter(s => s),
    isActive: formData.get("isActive") === "on",
  };
  await db.teamMembers.create(data);
  return redirect("/team");
}

export default function TeamNew() {
  const { availableUsers } = useLoaderData() as { availableUsers: User[] };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Miembro del Equipo</h1>
          <p className="text-gray-500 mt-1">Añade un usuario al equipo</p>
        </div>
      </div>

      <Form method="post" className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
          <select name="userId" required className="input-field">
            <option value="">Seleccionar usuario...</option>
            {availableUsers.map((u: User) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
            ))}
          </select>
          {availableUsers.length === 0 && <p className="text-sm text-red-600 mt-1">No hay usuarios disponibles. Todos los usuarios activos ya están en el equipo.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
            <input type="text" name="department" required className="input-field" placeholder="Ej: Ventas, Soporte, Marketing" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puesto *</label>
            <input type="text" name="position" required className="input-field" placeholder="Ej: Account Executive, Developer" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jefe Directo</label>
          <select name="managerId" className="input-field">
            <option value="">Sin jefe asignado</option>
            {availableUsers.map((u: User) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso *</label>
            <input type="date" name="hireDate" required className="input-field" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="isActive" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades (separadas por comas)</label>
          <input type="text" name="skills" className="input-field" placeholder="Ej: Ventas, Negociación, CRM, Prospección" />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <a href="/team" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary" disabled={availableUsers.length === 0}>Crear Miembro</button>
        </div>
      </Form>
    </div>
  );
}