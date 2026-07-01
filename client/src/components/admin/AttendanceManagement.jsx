import { useState, useEffect } from 'react';
import { getAllStudents, getAllAttendance, addAttendance, addBulkAttendance, deleteAttendance } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';

const subjects = ['Mathematics', 'Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks', 'Software Engineering', 'Machine Learning'];
const statusColors = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning' };

export default function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('view');
  const [form, setForm] = useState({ studentId: '', subject: subjects[0], date: new Date().toISOString().split('T')[0], status: 'present' });
  const [bulk, setBulk] = useState({ subject: subjects[0], date: new Date().toISOString().split('T')[0], entries: [] });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [rec, stu] = await Promise.all([getAllAttendance().catch(() => null), getAllStudents().catch(() => null)]);
    setRecords(rec?.data || []);
    setStudents(stu?.data || []);
    // Init bulk entries
    const entries = (stu?.data || []).map(s => ({ studentId: s._id, name: s.fullName, rollNumber: s.rollNumber, status: 'present' }));
    setBulk(b => ({ ...b, entries }));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addAttendance(form);
      toast.success('Attendance recorded');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleBulk = async () => {
    setSaving(true);
    try {
      const records = bulk.entries.map(e => ({ studentId: e.studentId, subject: bulk.subject, date: bulk.date, status: e.status }));
      await addBulkAttendance({ records });
      toast.success(`${records.length} attendance records saved`);
      load();
    } catch { toast.error('Bulk save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await deleteAttendance(id).catch(() => {});
    toast.success('Record deleted');
    load();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-2">
        {[['view','📋 View Records'],['add','➕ Add Single'],['bulk','📊 Bulk Entry']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab===t ? 'btn-primary' : 'btn-secondary dark:border-slate-700 dark:text-slate-300'}`}>{l}</button>
        ))}
      </div>

      {/* View */}
      {tab === 'view' && (
        <div className="dashboard-card overflow-hidden p-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
            <h3 className="font-display font-bold text-slate-900 dark:text-white">Attendance Records ({records.length})</h3>
          </div>
          {loading ? <div className="flex justify-center py-16"><div className="loader" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>{['Student','Roll No.','Subject','Date','Status','Action'].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr></thead>
                <tbody>
                  {records.slice(0, 50).map((r, i) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell font-medium text-sm">{r.studentId?.fullName || '—'}</td>
                      <td className="table-cell text-xs font-mono">{r.studentId?.rollNumber || '—'}</td>
                      <td className="table-cell text-xs">{r.subject}</td>
                      <td className="table-cell text-xs">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                      <td className="table-cell"><span className={`badge ${statusColors[r.status]}`}>{r.status}</span></td>
                      <td className="table-cell"><button onClick={() => handleDelete(r._id)} className="btn-icon text-slate-400 hover:text-red-500"><FiTrash2 size={13}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {records.length > 50 && <p className="text-center text-slate-400 text-xs py-3">Showing first 50 records</p>}
            </div>
          )}
        </div>
      )}

      {/* Add single */}
      {tab === 'add' && (
        <div className="dashboard-card max-w-lg">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Add Attendance Record</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label-field">Student</label>
              <select value={form.studentId} onChange={e => setForm(f=>({...f,studentId:e.target.value}))} required className="input-field text-sm">
                <option value="">Select Student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.fullName} ({s.rollNumber})</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Subject</label>
              <select value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} className="input-field text-sm">
                {subjects.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} className="input-field text-sm" required />
              </div>
              <div>
                <label className="label-field">Status</label>
                <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} className="input-field text-sm">
                  {['present','absent','late'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
              {saving ? 'Saving...' : <><FiPlus className="inline mr-1"/> Save Attendance</>}
            </button>
          </form>
        </div>
      )}

      {/* Bulk */}
      {tab === 'bulk' && (
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Bulk Attendance Entry</h3>
          <div className="flex gap-4 mb-5 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="label-field">Subject</label>
              <select value={bulk.subject} onChange={e => setBulk(b=>({...b,subject:e.target.value}))} className="input-field text-sm">
                {subjects.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="label-field">Date</label>
              <input type="date" value={bulk.date} onChange={e => setBulk(b=>({...b,date:e.target.value}))} className="input-field text-sm" />
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {bulk.entries.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{e.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{e.rollNumber}</div>
                </div>
                <div className="flex gap-2">
                  {['present','absent','late'].map(s => (
                    <button key={s} type="button" onClick={() => setBulk(b => ({ ...b, entries: b.entries.map((en,j) => j===i ? {...en,status:s} : en) }))}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${e.status===s ? (s==='present'?'bg-emerald-500 text-white':s==='absent'?'bg-red-500 text-white':'bg-amber-500 text-white') : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleBulk} disabled={saving || bulk.entries.length===0} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {saving ? 'Saving...' : `💾 Save All ${bulk.entries.length} Records`}
          </button>
        </div>
      )}
    </div>
  );
}
