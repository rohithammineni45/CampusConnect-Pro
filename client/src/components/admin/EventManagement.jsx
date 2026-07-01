import { useState, useEffect } from 'react';
import { getEventsAdmin, createEvent, updateEvent, deleteEvent } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';

const emptyForm = { title: '', description: '', date: '', time: '', venue: '', capacity: '', category: 'Technical' };
const categories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Business', 'General'];

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getEventsAdmin().catch(() => null);
    setEvents(res?.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setBanner(null); setModal('form'); };
  const openEdit = (e) => {
    setForm({ title:e.title, description:e.description, date:e.date?.split('T')[0]||'', time:e.time||'', venue:e.venue, capacity:String(e.capacity), category:e.category||'General' });
    setEditId(e._id); setBanner(null); setModal('form');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (banner) fd.append('bannerImage', banner);
      if (modal === 'add' || !editId) { await createEvent(fd); toast.success('Event created!'); }
      else { await updateEvent(editId, fd); toast.success('Event updated!'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    await deleteEvent(id).catch(() => {});
    toast.success('Event deleted'); load();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-xl">Events ({events.length})</h3>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><FiPlus size={15}/> Create Event</button>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="loader"/></div> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(e => (
            <div key={e._id} className="dashboard-card hover:shadow-premium transition-shadow">
              {e.bannerImage && (
                <div className="h-32 rounded-xl overflow-hidden mb-4 -mx-2 -mt-2">
                  <img src={`http://localhost:5000${e.bannerImage}`} alt={e.title} className="w-full h-full object-cover"/>
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-display font-bold text-slate-900 dark:text-white">{e.title}</h4>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button onClick={() => openEdit(e)} className="btn-icon text-slate-400 hover:text-primary-500"><FiEdit size={13}/></button>
                  <button onClick={() => handleDelete(e._id, e.title)} className="btn-icon text-slate-400 hover:text-red-500"><FiTrash2 size={13}/></button>
                </div>
              </div>
              <span className="badge badge-info mb-3">{e.category}</span>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 line-clamp-2">{e.description}</p>
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><FiCalendar size={11}/>{new Date(e.date).toLocaleDateString('en-IN')} {e.time && `at ${e.time}`}</div>
                <div className="flex items-center gap-2"><FiMapPin size={11}/>{e.venue}</div>
                <div className="flex items-center gap-2"><FiUsers size={11}/>{e.registeredCount}/{e.capacity} registered</div>
              </div>
              <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min((e.registeredCount/e.capacity)*100, 100)}%` }}/>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`badge ${e.isActive ? 'badge-success' : 'badge-danger'}`}>{e.isActive ? '● Active' : '● Inactive'}</span>
                <span className="text-xs text-slate-400">{e.capacity - e.registeredCount} spots left</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'form' && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-xl my-8 shadow-premium">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-xl">{editId ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setModal(null)} className="btn-icon text-slate-400"><FiX/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label-field">Event Title</label>
                <input value={form.title} onChange={e=>set('title',e.target.value)} required placeholder="Annual Tech Fest 2025" className="input-field text-sm"/>
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea value={form.description} onChange={e=>set('description',e.target.value)} required rows={3} className="input-field text-sm resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Date</label>
                  <input type="date" value={form.date} onChange={e=>set('date',e.target.value)} required className="input-field text-sm"/>
                </div>
                <div>
                  <label className="label-field">Time</label>
                  <input value={form.time} onChange={e=>set('time',e.target.value)} placeholder="09:00 AM" className="input-field text-sm"/>
                </div>
              </div>
              <div>
                <label className="label-field">Venue</label>
                <input value={form.venue} onChange={e=>set('venue',e.target.value)} required placeholder="Main Auditorium" className="input-field text-sm"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Capacity</label>
                  <input type="number" value={form.capacity} onChange={e=>set('capacity',e.target.value)} required placeholder="500" className="input-field text-sm"/>
                </div>
                <div>
                  <label className="label-field">Category</label>
                  <select value={form.category} onChange={e=>set('category',e.target.value)} className="input-field text-sm">
                    {categories.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">Banner Image (optional)</label>
                <input type="file" accept="image/*" onChange={e=>setBanner(e.target.files[0])} className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white cursor-pointer"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 dark:border-slate-600 dark:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Saving...' : editId ? '✏️ Update' : '🎪 Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
