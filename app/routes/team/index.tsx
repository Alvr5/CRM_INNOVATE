import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";
import type { TeamMember, User } from "~/lib/db";

export async function clientLoader() {
  const teamMembers = db.teamMembers.getAll();
  const users = db.users.getAll();
  return { teamMembers, users };
}

export default function TeamIndex() {
  const { teamMembers, users } = useLoaderData() as { teamMembers: TeamMember[]; users: User[] };

  const getUser = (userId: string) => users.find(u => u.id === userId);
  const getManager = (managerId: string) => users.find(u => u.id === managerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
          <p className="text-gray-500 mt-1">Gestiona los miembros de tu equipo</p>
        </div>
        <Link to="/team/new" className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Miembro
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miembro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jefe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamMembers.map(member => {
              const user = getUser(member.userId);
              const manager = member.managerId ? getManager(member.managerId) : null;
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{member.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{member.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{manager ? `${manager.firstName} ${manager.lastName}` : 'Sin jefe'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{new Date(member.hireDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {member.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link to={`/team/${member.id}/edit`} className="text-blue-600 hover:text-blue-900">Editar</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {teamMembers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No hay miembros en el equipo. <Link to="/team/new" className="text-blue-600 hover:underline">Añadir uno</Link>
          </div>
        )}
      </div>
    </div>
  );
}