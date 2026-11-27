import { Form, Link, useLoaderData, redirect } from "react-router";
import { db } from "~/lib/db";
import { useState } from "react";
import type { Invoice, Product, Contact, Company } from "~/lib/db";

export async function clientLoader({ params }: { params: { id: string } }) {
  const invoice = await db.invoices.getById(params.id);
  if (!invoice) throw new Response("Factura no encontrada", { status: 404 });
  const products = (await db.products.getAll()).filter(p => p.isActive);
  const contacts = await db.contacts.getAll();
  const companies = await db.companies.getAll();
  const settings = await db.settings.getAll();
  const defaultTaxRate = parseFloat(settings.find(s => s.key === 'tax_rate')?.value || '21');
  return { invoice, products, contacts, companies, defaultTaxRate };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
  const formData = await request.formData();
  
  const items: any[] = [];
  const itemCount = parseInt(formData.get("itemCount") as string) || 0;
  
  for (let i = 0; i < itemCount; i++) {
    const productId = formData.get(`items[${i}].productId`) as string;
    const description = formData.get(`items[${i}].description`) as string;
    const quantity = parseFloat(formData.get(`items[${i}].quantity`) as string) || 0;
    const unitPrice = parseFloat(formData.get(`items[${i}].unitPrice`) as string) || 0;
    const taxRate = parseFloat(formData.get(`items[${i}].taxRate`) as string) || 0;
    const total = quantity * unitPrice * (1 + taxRate / 100);
    
    if (description && quantity > 0 && unitPrice > 0) {
      items.push({ productId: productId || undefined, description, quantity, unitPrice, taxRate, total, id: `item-${Date.now()}-${i}` });
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100), 0);
  const total = subtotal + taxAmount;

  const data = {
    number: formData.get("number") as string,
    contactId: formData.get("contactId") as string || undefined,
    companyId: formData.get("companyId") as string || undefined,
    dealId: formData.get("dealId") as string || undefined,
    status: formData.get("status") as Invoice['status'] || 'draft',
    issueDate: formData.get("issueDate") as string,
    dueDate: formData.get("dueDate") as string,
    subtotal,
    taxAmount,
    total,
    currency: formData.get("currency") as string,
    notes: formData.get("notes") as string,
    items,
  };

  await db.invoices.update(params.id, data);
  return redirect("/invoices");
}

export default function InvoicesEdit() {
  const { invoice, products, contacts, companies, defaultTaxRate } = useLoaderData() as any;
  const [items, setItems] = useState<any[]>(invoice.items.length > 0 ? invoice.items : [{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, taxRate: defaultTaxRate, total: 0 }]);

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      const qty = field === 'quantity' ? value : newItems[index].quantity;
      const price = field === 'unitPrice' ? value : newItems[index].unitPrice;
      const tax = field === 'taxRate' ? value : newItems[index].taxRate;
      newItems[index].total = qty * price * (1 + tax / 100);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, taxRate: defaultTaxRate, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    return { subtotal, taxAmount, total: subtotal + taxAmount };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Factura</h1>
          <p className="text-gray-500 mt-1">Modifica la factura {invoice.number}</p>
        </div>
      </div>

      <Form method="post" className="card space-y-6">
        <input type="hidden" name="itemCount" value={items.length} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
            <input type="text" name="number" required className="input-field" defaultValue={invoice.number} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select name="status" required className="input-field" defaultValue={invoice.status}>
              <option value="draft">Borrador</option>
              <option value="sent">Enviada</option>
              <option value="paid">Pagada</option>
              <option value="overdue">Vencida</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Contacto)</label>
            <select name="contactId" className="input-field" defaultValue={invoice.contactId || ''}>
              <option value="">Seleccionar contacto...</option>
              {contacts.map((c: Contact) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select name="companyId" className="input-field" defaultValue={invoice.companyId || ''}>
              <option value="">Seleccionar empresa...</option>
              {companies.map((c: Company) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Emisión *</label>
            <input type="date" name="issueDate" required className="input-field" defaultValue={invoice.issueDate.split('T')[0]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento *</label>
            <input type="date" name="dueDate" required className="input-field" defaultValue={invoice.dueDate.split('T')[0]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <input type="text" name="currency" className="input-field" defaultValue={invoice.currency} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea name="notes" rows={2} className="input-field" defaultValue={invoice.notes}></textarea>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Líneas de Factura</h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-lg">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto/Servicio</label>
                  <select
                    name={`items[${index}].productId`}
                    className="input-field"
                    value={item.productId || ''}
                    onChange={e => {
                      const product = products.find((p: Product) => p.id === e.target.value);
                      if (product) {
                        updateItem(index, 'description', product.name);
                        updateItem(index, 'unitPrice', product.price);
                        updateItem(index, 'taxRate', product.taxRate);
                      } else {
                        updateItem(index, 'productId', e.target.value);
                      }
                    }}
                  >
                    <option value="">Seleccionar producto o escribir manual...</option>
                    {products.map((p: Product) => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price} {p.unit}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <input
                    type="text"
                    name={`items[${index}].description`}
                    required
                    className="input-field"
                    value={item.description}
                    onChange={e => updateItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-12 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    name={`items[${index}].quantity`}
                    step="0.01"
                    min="0.01"
                    required
                    className="input-field"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unit. *</label>
                  <input
                    type="number"
                    name={`items[${index}].unitPrice`}
                    step="0.01"
                    min="0"
                    required
                    className="input-field"
                    value={item.unitPrice}
                    onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-12 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">IVA %</label>
                  <input
                    type="number"
                    name={`items[${index}].taxRate`}
                    step="0.01"
                    min="0"
                    max="100"
                    className="input-field"
                    value={item.taxRate}
                    onChange={e => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-12 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input type="text" className="input-field font-mono bg-gray-100" value={item.total.toFixed(2)} readOnly />
                </div>
                <div className="col-span-12 md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                    disabled={items.length <= 1}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem} className="btn-secondary text-sm">
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Añadir Línea
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-end space-x-8">
            <div className="text-right">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-lg font-semibold text-gray-900">{subtotal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">IVA</p>
              <p className="text-lg font-semibold text-gray-900">{taxAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-blue-600">{total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to="/invoices" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
        </div>
      </Form>
    </div>
  );
}