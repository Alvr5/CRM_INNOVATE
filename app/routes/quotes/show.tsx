import { Link, useLoaderData } from "react-router";
import { db } from "~/lib/db";
import type { Quote, Contact, Company } from "~/lib/db";

export async function clientLoader({ params }: { params: { id: string } }) {
  const quote = db.quotes.getById(params.id);
  if (!quote) throw new Response("Presupuesto no encontrado", { status: 404 });
  const contacts = db.contacts.getAll();
  const companies = db.companies.getAll();
  return { quote, contacts, companies };
}

export default function QuotesShow() {
  const { quote, contacts, companies } = useLoaderData() as { quote: Quote; contacts: any[]; companies: any[] };

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

  const contact = quote.contactId ? contacts.find(c => c.id === quote.contactId) : null;
  const company = quote.companyId ? companies.find(c => c.id === quote.companyId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quote.number}</h1>
          <p className="text-gray-500 mt-1">Detalle de presupuesto</p>
        </div>
        <div className="flex space-x-3">
          <Link to={`/quotes/${quote.id}/edit`} className="btn-secondary">Editar</Link>
          <Link to="/quotes" className="btn-primary">Volver</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Presupuesto</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Estado</dt>
                <dd className="mt-1">{getStatusBadge(quote.status)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Fecha Emisión</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(quote.issueDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Válido Hasta</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(quote.validUntil).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Moneda</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.currency}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-gray-500">Notas</dt>
                <dd className="mt-1 text-sm text-gray-900">{quote.notes || 'Sin notas'}</dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Líneas de Presupuesto</h3>
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
                  {quote.items.map((item: any) => (
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
                <dd className="font-medium text-gray-900">{quote.subtotal.toLocaleString()} {quote.currency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">IVA</dt>
                <dd className="font-medium text-gray-900">{quote.taxAmount.toLocaleString()} {quote.currency}</dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <dt className="text-lg font-semibold text-gray-900">Total</dt>
                <dd className="text-lg font-bold text-blue-600">{quote.total.toLocaleString()} {quote.currency}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}