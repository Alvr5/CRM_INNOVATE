import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";

export async function clientLoader() {
  const [companies, contacts] = await Promise.all([
    db.companies.getAll(),
    db.contacts.getAll(),
  ]);

  const contactCount = new Map<string, number>();
  contacts.forEach(c => {
    if (c.companyId) {
      contactCount.set(c.companyId, (contactCount.get(c.companyId) || 0) + 1);
    }
  });

  return { companies, contactCount };
}

export default function CompaniesIndex() {
  const { companies, contactCount } = useLoaderData<typeof clientLoader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus empresas y cuentas</p>
        </div>
        <Link to="/companies/new" className="btn-primary">Nueva Empresa</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {companies.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empresas</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primera empresa.</p>
            <div className="mt-6">
              <Link to="/companies/new" className="btn-primary">Agregar Empresa</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contactos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/companies/${company.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.industry}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contactCount.get(company.id) || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/companies/${company.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">Editar</Link>
                      <button
                        onClick={async () => {
                          if (confirm('¿Estás seguro de eliminar esta empresa?')) {
                            await db.companies.delete(company.id);
                            window.location.reload();
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}