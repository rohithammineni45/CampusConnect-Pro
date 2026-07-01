import { useState, useEffect } from 'react';
import { getEvents, getMyRegistrations, registerForEvent, cancelRegistration } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiUsers, FiClock } from 'react-icons/fi';

const statusColors = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
const statusIcons = { pending: '⏳', approved: '✅', rejected: '❌' };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [tab, setTab] = useState('available');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [ev, my] = await Promise.all([getEvents(), getMyRegistrations()]);
      setEvents(ev.data);
      setMyRegs(my.data);
    } catch { toast.error('Failed to load events'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isRegistered = (eventId) => myRegs.find(r => r.eventId?._id === eventId);

  const handleRegister = async (eventId) => {
    try {
      await registerForEvent(eventId);
      toast.success('Registration submitted! Awaiting approval.');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
  };

  const handleCancel = async (eventId) => {
    try {
      await cancelRegistration(eventId);
      toast.success('Registration cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="loader" /></div>;

  const EventCard = ({ event }) => {
    const reg = isRegistered(event._id);
    const isFull = event.registeredCount >= event.capacity;
    return (
      <div className="dashboard-card hover:shadow-premium transition-shadow duration-300">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">{event.title}</h3>
            <span className="badge badge-info mt-1">{event.category || 'General'}</span>
          </div>
          {reg && <span className={`badge ${statusColors[reg.status]}`}>{statusIcons[reg.status]} {reg.status}</span>}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2"><FiCalendar size={14} />{new Date(event.date).toLocaleDateString('en-IN')}</div>
          <div className="flex items-center gap-2"><FiClock size={14} />{event.time || 'TBD'}</div>
          <div className="flex items-center gap-2"><FiMapPin size={14} />{event.venue}</div>
          <div className="flex items-center gap-2"><FiUsers size={14} />{event.registeredCount}/{event.capacity}</div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mb-4">
          <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }} />
        </div>
        {!reg ? (
          <button onClick={() => handleRegister(event._id)} disabled={isFull}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${isFull ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : 'btn-primary'}`}>
            {isFull ? '🚫 Full Capacity' : '📝 Register Now'}
          </button>
        ) : reg.status !== 'approved' ? (
          <button onClick={() => handleCancel(event._id)} className="w-full btn-danger py-2.5 text-sm">❌ Cancel Registration</button>
        ) : (
          <div className="text-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm py-2">🎉 You're approved to attend!</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2">
        {[['available', '🎪 Available Events'], ['my', '📋 My Registrations']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${tab === t ? 'btn-primary' : 'btn-secondary dark:border-slate-700 dark:text-slate-300'}`}>{l}</button>
        ))}
      </div>

      {tab === 'available' && (
        <>
          {events.length === 0 ? <div className="text-center py-20 text-slate-400">No events available</div> :
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map(e => <EventCard key={e._id} event={e} />)}
            </div>}
        </>
      )}

      {tab === 'my' && (
        <>
          {myRegs.length === 0 ? <div className="text-center py-20 text-slate-400">You haven't registered for any events yet</div> :
            <div className="dashboard-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>{['Event', 'Date', 'Venue', 'Registered On', 'Status'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {myRegs.map((r, i) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell font-medium">{r.eventId?.title}</td>
                      <td className="table-cell">{r.eventId?.date ? new Date(r.eventId.date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="table-cell">{r.eventId?.venue}</td>
                      <td className="table-cell">{new Date(r.registeredAt).toLocaleDateString('en-IN')}</td>
                      <td className="table-cell"><span className={`badge ${statusColors[r.status]}`}>{statusIcons[r.status]} {r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
        </>
      )}
    </div>
  );
}
