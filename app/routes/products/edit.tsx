import { Form, useLoaderData, useActionData, redirect } from "react-router";
import { db } from "~/lib/db";
import type { Product } from "~/lib/db";

export async function clientLoader({ params }: { params: { id: string } }) {
  const product = db.products.getById(params.id);
  if (!product) throw new Response("Producto no encontrado", { status: 404 });
  return { product };
}

export async function clientAction({ request, params }: { request: Request; params: { id: string } }) {
  const formData = await request.formData();
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    sku: formData.get("sku") as string,
    price: parseFloat(formData.get("price") as string) || 0,
    taxRate: parseFloat(formData.get("taxRate") as string) || 21,
    unit: formData.get("unit") as string,
    type: formData.get("type") as 'product' | 'service',
    isActive: formData.get("isActive") === "on",
  };
  db.products.update(params.id, data);
  return redirect("/products");
}

export default function ProductsEdit() {
  const { product } = useLoaderData() as { product: Product };
  const actionData = useActionData<{ errors?: Record<string, string> }>();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-gray-500 mt-1">Modifica la información del producto</p>
        </div>
      </div>

      <Form method="post" className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" name="name" required className="input-field" defaultValue={product.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input type="text" name="sku" required className="input-field" defaultValue={product.sku} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="description" rows="3" className="input-field" defaultValue={product.description}></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select name="type" required className="input-field" defaultValue={product.type}>
              <option value="product">Producto</option>
              <option value="service">Servicio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
            <input type="number" name="price" step="0.01" min="0" required className="input-field" defaultValue={product.price} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
            <input type="text" name="unit" required className="input-field" defaultValue={product.unit} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IVA (%) *</label>
            <input type="number" name="taxRate" step="0.01" min="0" max="100" required className="input-field" defaultValue={product.taxRate} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="isActive" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked={product.isActive} />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <a href="/products" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Guardar Cambios</button>
        </div>
      </Form>
    </div>
  );
}