import { Link, useLoaderData, useState, useEffect } from "react";
import { db } from "~/lib/db";
import type { Activity, User } from "~/lib/db";

const STATUSES = [
  { key: 'pending', label: 'Pendientes', color: 'bg-gray-100 text-gray-700' },
  { key: 'in_progress', label: 'En Progreso', color: 'bg-blue-100 text-blue-700' },
  { key: 'review', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'completed', label: 'Completadas', color: 'bg-green-100 text-green-700' },
];

const TYPE_LABELS: Record<string, string> = {
  task: 'Tarea',
  call: 'Llamada',
  email: 'Email',
  meeting: 'Reunión',
  note: 'Nota',
};

const TYPE_COLORS: Record<string, string> = {
  task: 'bg-orange-100 text-orange-700',
  call: 'bg-green-100 text-green-700',
  email: 'bg-blue-100 text-blue-700',
  meeting: 'bg-purple-100 text-purple-700',
  note: 'bg-gray-100 text-gray-700',
};

export async function clientLoader() {
  const [tasks, users] = await Promise.all([
    db.activities.getAll(),
    db.users.getAll(),
  ]);

  const activeUsers = users.filter(u => u.isActive);
  const userMap = new Map(activeUsers.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s.key] = tasks
      .filter(t => (t as any).status === s.key || (t.completed && s.key === 'completed') || (!t.completed && s.key === 'pending'))
      .sort((a, b) => new Date((b as any).dueDate || b.dueDate).getTime() - new Date((a as any).dueDate || a.dueDate).getTime());
    return acc;
  }, {} as Record<string, Activity[]>);

  return { tasksByStatus, users: activeUsers, userMap };
}

export default function TasksIndex() {
  const { tasksByStatus, users, userMap } = useLoaderData<typeof clientLoader>();
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Activity | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setNotificationPermission);
      }
    }
  }, []);

  useEffect(() => {
    const checkNotifications = async () => {
      const currentUser = db.auth.getCurrentUser();
      if (!currentUser) return;

      const allTasks = await db.activities.getAll();
      const myTasks = allTasks.filter(t => (t as any).assigneeId === currentUser.id);
      
      myTasks.forEach(task => {
        const isNew = localStorage.getItem(`task_notified_${task.id}`) !== 'true';
        const isAssigned = (task as any).assigneeId === currentUser.id;
        const dueSoon = new Date((task as any).dueDate || task.dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000;
        
        if (isAssigned && isNew && (dueSoon || (task as any).status === 'pending')) {
          if (Notification.permission === 'granted') {
            new Notification(`Nueva tarea asignada: ${task.subject}`, {
              body: `Vence: ${new Date((task as any).dueDate || task.dueDate).toLocaleDateString()}`,
              icon: '/favicon.ico',
            });
          }
          localStorage.setItem(`task_notified_${task.id}`, 'true');
        }
      });
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (task: Activity, newStatus: string) => {
    await db.activities.update(task.id, { 
      completed: newStatus === 'completed',
      status: newStatus,
    } as any);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta tarea?')) {
      await db.activities.delete(id);
      window.location.reload();
    }
  };

  const getAssigneeName = (assigneeId?: string) => {
    if (!assigneeId) return 'Sin asignar';
    return userMap.get(assigneeId) || 'Usuario desconocido';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus tareas y asignaciones</p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Tarea
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map(({ key, label, color }) => (
          <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-300px)] min-h-[400px]">
            <div className={`px-4 py-3 border-b border-gray-200 ${color} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{label}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-white/50 rounded-full">
                  {tasksByStatus[key]?.length || 0}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3" id={`column-${key}`}>
              {tasksByStatus[key]?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assigneeName={getAssigneeName((task as any).assigneeId)}
                  typeLabel={TYPE_LABELS[task.type]}
                  typeColor={TYPE_COLORS[task.type]}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => handleDelete(task.id)}
                  onStatusChange={(status) => handleStatusChange(task, status)}
                />
              ))}
              {(!tasksByStatus[key] || tasksByStatus[key].length === 0) && (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Sin tareas
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showNewTask && (
        <TaskModal
          users={users}
          onClose={() => setShowNewTask(false)}
          onSuccess={() => { setShowNewTask(false); window.location.reload(); }}
        />
      )}

      {editingTask && (
        <TaskModal
          users={users}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => { setEditingTask(null); window.location.reload(); }}
        />
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Activity;
  assigneeName: string;
  typeLabel: string;
  typeColor: string;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}

function TaskCard({ task, assigneeName, typeLabel, typeColor, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const isOverdue = new Date((task as any).dueDate || task.dueDate) < new Date() && !(task as any).completed;
  const status = (task as any).status || (task.completed ? 'completed' : 'pending');

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColor}`}>
          {typeLabel}
        </span>
        <div className="flex items-center space-x-1">
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-gray-600" title="Editar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600" title="Eliminar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <h4 className="font-medium text-gray-900 text-sm mb-1">{task.subject}</h4>
      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="space-y-1 text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {new Date((task as any).dueDate || task.dueDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{assigneeName}</span>
        </div>
      </div>

      <div className="flex space-x-1 pt-2 border-t border-gray-200">
        {STATUSES.filter(s => s.key !== status).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={`flex-1 px-2 py-1 text-xs font-medium rounded ${color} hover:opacity-80 transition-opacity`}
            title={`Mover a ${label}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TaskModalProps {
  users: User[];
  task?: Activity;
  onClose: () => void;
  onSuccess: () => void;
}

function TaskModal({ users, task, onClose, onSuccess }: TaskModalProps) {
  const isEditing = !!task;
  const [formData, setFormData] = useState({
    type: (task as any)?.type || 'task',
    subject: task?.subject || '',
    description: task?.description || '',
    dueDate: (task as any)?.dueDate ? (task as any).dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
    assigneeId: (task as any)?.assigneeId || '',
    status: (task as any)?.status || 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      type: formData.type,
      subject: formData.subject,
      description: formData.description,
      dueDate: formData.dueDate,
      completed: formData.status === 'completed',
      status: formData.status,
      assigneeId: formData.assigneeId || undefined,
    };

    try {
      if (isEditing) {
        await db.activities.update(task!.id, data as any);
      } else {
        await db.activities.create(data as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error al guardar la tarea');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="input-field w-full"
              required
            >
              <option value="task">Tarea</option>
              <option value="call">Llamada</option>
              <option value="email">Email</option>
              <option value="meeting">Reunión</option>
              <option value="note">Nota</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              required
              className="input-field w-full"
              placeholder="Ej: Llamada de seguimiento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field w-full"
              placeholder="Detalles de la tarea..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
              <select
                value={formData.assigneeId}
                onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                className="input-field w-full"
              >
                <option value="">Sin asignar</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="input-field w-full"
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="review">En Revisión</option>
              <option value="completed">Completada</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}