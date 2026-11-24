import { useLoaderData, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { db } from "~/lib/db";
import { useAuth } from "~/context/AuthContext";
import type { Setting } from "~/lib/db";

export async function clientLoader() {
  const settings = db.settings.getAll();
  return { settings };
}

export default function SettingsIndex() {
  const { settings } = useLoaderData() as { settings: Setting[] };
  const { isAdmin } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin()) return null;

  const handleEdit = (setting: Setting) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
  };

  const handleSave = async (setting: Setting) => {
    db.settings.update(setting.id, { value: editValue });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const categories = [...new Set(settings.map(s => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 mt-1">Gestiona la configuración del sistema</p>
        </div>
      </div>

      {categories.map(category => (
        <div key={category} className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{category}</h2>
          <div className="space-y-3">
            {settings.filter(s => s.category === category).map(setting => (
              <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">{setting.key}</label>
                  <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                </div>
                {editingId === setting.id ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="input-field flex-1 max-w-xs"
                    />
                    <button
                      onClick={() => handleSave(setting)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-900 font-mono text-sm">{setting.value}</span>
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}