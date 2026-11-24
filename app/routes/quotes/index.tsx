import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";
import type { Quote } from "~/lib/db";

export async function clientLoader() {
  const quotes = db.quotes.getAll();
  const contacts = db.contacts.getAll();
  const companies = db.companies.getAll();
  return { quotes, contacts, companies };
}

export default function QuotesIndex() {
  const { quotes, contacts, companies } = useLoaderData() as { quotes: Quote[]; contacts: any[]; companies: any[] };

  const getStatusBadge = (status: Quote['status']) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };
    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Enviado',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      expired: 'Expirado',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{labels[status]}</span>;
  };

  const getClientName = (quote: Quote) => {
    if (quote.contactId) {
      const contact = contacts.find(c => c.id === quote.contactId);
      if (contact) return `${contact.firstName} ${contact.lastName}`;
    }
    if (quote.companyId) {
      const company = companies.find(c => c.id === quote.companyId);
      if (company) return company.name;
    }
    return 'Sin cliente';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-500 mt-1">Gestiona los presupuestos de tu negocio</p>
        </div>
        <Link to="/quotes/new" className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Presupuesto
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Emisión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Válido Hasta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map(quote => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{quote.number}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{getClientName(quote)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(quote.issueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(quote.validUntil).toLocaleDateString()}</td>
                <td className="px-6 py-4">{getStatusBadge(quote.status)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{quote.total.toLocaleString()} {quote.currency}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link to={`/quotes/${quote.id}`} className="text-blue-600 hover:text-blue-900 mr-4">Ver</Link>
                  <Link to={`/quotes/${quote.id}/edit`} className="text-blue-600 hover:text-blue-900">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No hay presupuestos. <Link to="/quotes/new" className="text-blue-600 hover:underline">Crear uno</Link>
          </div>
        )}
      </div>
    </div>
  );
}