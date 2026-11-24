import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";
import type { Invoice, Contact, Company } from "~/lib/db";

export async function clientLoader({ params }: { params: { id: string } }) {
  const invoice = db.invoices.getById(params.id);
  if (!invoice) throw new Response("Factura no encontrada", { status: 404 });
  const contacts = db.contacts.getAll();
  const companies = db.companies.getAll();
  return { invoice, contacts, companies };
}

export default function InvoicesShow() {
  const { invoice, contacts, companies } = useLoaderData() as { invoice: Invoice; contacts: any[]; companies: any[] };

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

  const contact = invoice.contactId ? contacts.find(c => c.id === invoice.contactId) : null;
  const company = invoice.companyId ? companies.find(c => c.id === invoice.companyId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
          <p className="text-gray-500 mt-1">Detalle de factura</p>
        </div>
        <div className="flex space-x-3">
          <Link to={`/invoices/${invoice.id}/edit`} className="btn-secondary">Editar</Link>
          <Link to="/invoices" className="btn-primary">Volver</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Factura</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Estado</dt>
                <dd className="mt-1">{getStatusBadge(invoice.status)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Fecha Emisión</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(invoice.issueDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Fecha Vencimiento</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Moneda</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.currency}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-gray-500">Notas</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.notes || 'Sin notas'}</dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Líneas de Factura</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">IVA</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.taxRate}%</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
            {contact && (
              <div>
                <p className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</p>
                <p className="text-sm text-gray-500">{contact.email}</p>
                <p className="text-sm text-gray-500">{contact.phone}</p>
              </div>
            )}
            {company && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="font-medium text-gray-900">{company.name}</p>
                <p className="text-sm text-gray-500">{company.address}, {company.city}, {company.country}</p>
              </div>
            )}
            {!contact && !company && <p className="text-gray-500">Sin cliente asignado</p>}
          </div>

          <div className="card bg-gray-50 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Totales</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium text-gray-900">{invoice.subtotal.toLocaleString()} {invoice.currency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">IVA</dt>
                <dd className="font-medium text-gray-900">{invoice.taxAmount.toLocaleString()} {invoice.currency}</dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <dt className="text-lg font-semibold text-gray-900">Total</dt>
                <dd className="text-lg font-bold text-blue-600">{invoice.total.toLocaleString()} {invoice.currency}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}