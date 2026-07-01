import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const priorityColors = { low: 'badge-info', medium: 'badge-warning', high: 'badge-danger' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

  const load = async () => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    const res = await getTasks(params).catch(() => null);
    setTasks(res?.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setEditTask(null); setForm({ title: '', description: '', dueDate: '', priority: 'medium' }); setShowModal(true); };
  const openEdit = (t) => { setEditTask(t); setForm({ title: t.title, description: t.description, dueDate: t.dueDate?.split('T')[0] || '', priority: t.priority }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTask) { await updateTask(editTask._id, form); toast.success('Task updated'); }
      else { await createTask(form); toast.success('Task created'); }
      setShowModal(false); load();
    } catch { toast.error('Failed to save task'); }
  };

  const handleDelete = async (id) => {
    await deleteTask(id).catch(() => {});
    toast.success('Task deleted'); load();
  };

  const toggleStatus = async (t) => {
    const newStatus = t.status === 'completed' ? 'pending' : 'completed';
    await updateTask(t._id, { ...t, status: newStatus });
    load();
  };

  const displayed = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {['all', 'pending', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[['Total', tasks.length, 'text-blue-500'], ['Pending', tasks.filter(t => t.status === 'pending').length, 'text-amber-500'], ['Done', tasks.filter(t => t.status === 'completed').length, 'text-emerald-500']].map(([l, v, c]) => (
          <div key={l} className="dashboard-card text-center">
            <div className={`font-display font-bold text-2xl ${c}`}>{v}</div>
            <div className="text-slate-500 text-sm">{l}</div>
          </div>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-10"><div className="loader" /></div> :
        displayed.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <div className="text-slate-400">No tasks found. Add your first task!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(t => (
              <div key={t._id} className={`dashboard-card flex items-start gap-4 transition-all ${t.status === 'completed' ? 'opacity-60' : ''}`}>
                <button onClick={() => toggleStatus(t)}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${t.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'}`}>
                  {t.status === 'completed' && <FiCheck size={12} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-semibold text-slate-900 dark:text-white ${t.status === 'completed' ? 'line-through' : ''}`}>{t.title}</h4>
                    <span className={`badge ${priorityColors[t.priority]}`}>{t.priority}</span>
                  </div>
                  {t.description && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.description}</p>}
                  {t.dueDate && <p className="text-slate-400 text-xs mt-1">📅 Due: {new Date(t.dueDate).toLocaleDateString('en-IN')}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="btn-icon text-slate-400 hover:text-primary-500"><FiEdit size={15} /></button>
                  <button onClick={() => handleDelete(t._id)} className="btn-icon text-slate-400 hover:text-red-500"><FiTrash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-premium">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-slate-900 dark:text-white">{editTask ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon text-slate-400"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Task title" className="input-field" />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional details..." className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                    {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 dark:border-slate-600 dark:text-white">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editTask ? 'Update' : 'Create'} Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
