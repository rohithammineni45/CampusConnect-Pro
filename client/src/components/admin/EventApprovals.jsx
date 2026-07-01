import { useState, useEffect } from 'react';
import { getAllRegistrations, updateRegistrationStatus } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const statusColors = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
const tabs = ['all', 'pending', 'approved', 'rejected'];

export default function EventApprovals() {
  const [regs, setRegs] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // { reg, action }
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = tab !== 'all' ? { status: tab } : {};
    const res = await getAllRegistrations(params).catch(() => null);
    setRegs(res?.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const handleAction = async () => {
    if (!actionModal) return;
    setSaving(true);
    try {
      await updateRegistrationStatus(actionModal.reg._id, { status: actionModal.action, adminNote: note });
      toast.success(`Registration ${actionModal.action}! Student notified.`);
      setActionModal(null); setNote(''); load();
    } catch { toast.error('Action failed'); }
    setSaving(false);
  };

  const counts = { pending: regs.filter(r=>r.status==='pending').length };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all flex items-center gap-2 ${tab===t ? 'btn-primary' : 'btn-secondary dark:border-slate-700 dark:text-slate-300'}`}>
            {t === 'pending' && <FiClock size={13}/>}
            {t === 'approved' && <FiCheck size={13}/>}
            {t === 'rejected' && <FiX size={13}/>}
            {t}
            {t === 'pending' && counts.pending > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{counts.pending}</span>}
          </button>
        ))}
      </div>

      <div className="dashboard-card overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Event Registrations ({regs.length})</h3>
        </div>
        {loading ? <div className="flex justify-center py-16"><div className="loader"/></div> :
          regs.length === 0 ? <div className="text-center py-16 text-slate-400">No {tab} registrations</div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>{['Student','Roll No.','Event','Date','Registered','Status','Actions'].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr></thead>
                <tbody>
                  {regs.map((r, i) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell font-medium text-sm">{r.studentId?.fullName}</td>
                      <td className="table-cell text-xs font-mono">{r.studentId?.rollNumber}</td>
                      <td className="table-cell text-sm">{r.eventId?.title}</td>
                      <td className="table-cell text-xs">{r.eventId?.date ? new Date(r.eventId.date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="table-cell text-xs">{new Date(r.registeredAt).toLocaleDateString('en-IN')}</td>
                      <td className="table-cell"><span className={`badge ${statusColors[r.status]}`}>{r.status}</span></td>
                      <td className="table-cell">
                        {r.status === 'pending' ? (
                          <div className="flex gap-1">
                            <button onClick={() => { setActionModal({ reg: r, action: 'approved' }); setNote(''); }}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors">
                              <FiCheck size={11}/> Approve
                            </button>
                            <button onClick={() => { setActionModal({ reg: r, action: 'rejected' }); setNote(''); }}
                              className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors">
                              <FiX size={11}/> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">{r.adminNote || '—'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-premium">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-3">
              {actionModal.action === 'approved' ? '✅ Approve Registration' : '❌ Reject Registration'}
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4 text-sm">
              <p className="font-medium text-slate-800 dark:text-slate-200">{actionModal.reg.studentId?.fullName}</p>
              <p className="text-slate-500">Event: {actionModal.reg.eventId?.title}</p>
            </div>
            <div>
              <label className="label-field">Note to Student (optional)</label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Add a note for the student..."
                className="input-field text-sm resize-none"/>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setActionModal(null)} className="btn-secondary flex-1 dark:border-slate-600 dark:text-white">Cancel</button>
              <button onClick={handleAction} disabled={saving}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60 ${actionModal.action === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {saving ? 'Processing...' : `Confirm ${actionModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
