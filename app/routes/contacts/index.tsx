import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";

export async function clientLoader() {
  const [allContacts, companies] = await Promise.all([
    db.contacts.getAll(),
    db.companies.getAll(),
  ]);

  const contacts = allContacts.filter(
    (contact) =>
      "firstName" in contact &&
      "lastName" in contact &&
      "position" in contact,
  );
  const companyMap = new Map<string, string>();
  for (const company of companies) {
    if ("name" in company) companyMap.set(company.id, company.name);
  }

  return { contacts, companyMap };
}

export default function ContactsIndex() {
  const { contacts, companyMap } = useLoaderData<typeof clientLoader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-500 mt-1">Gestiona tus contactos comerciales</p>
        </div>
        <Link to="/contacts/new" className="btn-primary">Nuevo Contacto</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {contacts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.94 3.197M15.653 13.67a3 3 0 00-4.298-.007" /></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contactos</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer contacto.</p>
            <div className="mt-6">
              <Link to="/contacts/new" className="btn-primary">Agregar Contacto</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/contacts/${contact.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {"companyId" in contact && contact.companyId
                        ? companyMap.get(contact.companyId) || '-'
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/contacts/${contact.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">Editar</Link>
                      <button
                        onClick={async () => {
                          if (confirm('¿Estás seguro de eliminar este contacto?')) {
                            await db.contacts.delete(contact.id);
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