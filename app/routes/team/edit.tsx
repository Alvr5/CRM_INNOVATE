import { Form, useLoaderData, redirect } from "react-router";
import { db } from "~/lib/db";
import type { TeamMember, User } from "~/lib/db";

export async function clientLoader({ params }: { params: { id: string } }) {
  const member = db.teamMembers.getById(params.id);
  if (!member) throw new Response("Miembro no encontrado", { status: 404 });
  const users = db.users.getAll().filter(u => u.isActive);
  return { member, users };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
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
  db.teamMembers.update(params.id, data);
  return redirect("/team");
}

export default function TeamEdit() {
  const { member, users } = useLoaderData() as { member: TeamMember; users: User[] };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Miembro</h1>
          <p className="text-gray-500 mt-1">Modifica la información del miembro del equipo</p>
        </div>
      </div>

      <Form method="post" className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
          <select name="userId" required className="input-field" defaultValue={member.userId}>
            {users.map((u: User) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
            <input type="text" name="department" required className="input-field" defaultValue={member.department} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puesto *</label>
            <input type="text" name="position" required className="input-field" defaultValue={member.position} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jefe Directo</label>
          <select name="managerId" className="input-field" defaultValue={member.managerId || ''}>
            <option value="">Sin jefe asignado</option>
            {users.filter(u => u.id !== member.userId).map((u: User) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso *</label>
            <input type="date" name="hireDate" required className="input-field" defaultValue={member.hireDate.split('T')[0]} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="isActive" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked={member.isActive} />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades (separadas por comas)</label>
          <input type="text" name="skills" className="input-field" defaultValue={member.skills.join(', ')} />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <a href="/team" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
        </div>
      </Form>
    </div>
  );
}