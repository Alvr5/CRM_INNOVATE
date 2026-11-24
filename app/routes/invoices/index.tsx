import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";
import type { Invoice } from "~/lib/db";

export async function clientLoader() {
  const invoices = db.invoices.getAll();
  const contacts = db.contacts.getAll();
  const companies = db.companies.getAll();
  return { invoices, contacts, companies };
}

export default function InvoicesIndex() {
  const { invoices, contacts, companies } = useLoaderData() as { invoices: Invoice[]; contacts: any[]; companies: any[] };

  const getStatusBadge = (status: Invoice['status']) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Enviada',
      paid: 'Pagada',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{labels[status]}</span>;
  };

  const getClientName = (invoice: Invoice) => {
    if (invoice.contactId) {
      const contact = contacts.find(c => c.id === invoice.contactId);
      if (contact) return `${contact.firstName} ${contact.lastName}`;
    }
    if (invoice.companyId) {
      const company = companies.find(c => c.id === invoice.companyId);
      if (company) return company.name;
    }
    return 'Sin cliente';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-500 mt-1">Gestiona las facturas de tu negocio</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Factura
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Emisión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Vencimiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.number}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{getClientName(invoice)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{invoice.total.toLocaleString()} {invoice.currency}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-900 mr-4">Ver</Link>
                  <Link to={`/invoices/${invoice.id}/edit`} className="text-blue-600 hover:text-blue-900">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No hay facturas. <Link to="/invoices/new" className="text-blue-600 hover:underline">Crear una</Link>
          </div>
        )}
      </div>
    </div>
  );
}