import { useState, useEffect } from 'react';
import { getAllFees, assignFee, getFeeAnalytics } from '../../services/api';
import toast from 'react-hot-toast';
import { FiDollarSign, FiPlus, FiX } from 'react-icons/fi';

const statusColors = { paid: 'badge-success', partial: 'badge-warning', pending: 'badge-danger' };

export default function FeeManagement() {
  const [fees, setFees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', totalFee: '', dueDate: '', academicYear: '2024-25' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [f, a] = await Promise.all([getAllFees().catch(() => null), getFeeAnalytics().catch(() => null)]);
    setFees(f?.data || []);
    setAnalytics(a?.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assignFee({ ...form, totalFee: Number(form.totalFee) });
      toast.success('Fee assigned successfully');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Analytics cards */}
      {analytics && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Total Assigned', `₹${(analytics.totalAssigned/100000).toFixed(1)}L`, 'text-blue-500'],
            ['Collected', `₹${(analytics.totalCollected/100000).toFixed(1)}L`, 'text-emerald-500'],
            ['Pending', `₹${(analytics.totalPending/100000).toFixed(1)}L`, 'text-red-500'],
            ['Students', analytics.totalStudents, 'text-purple-500'],
          ].map(([l,v,c]) => (
            <div key={l} className="dashboard-card text-center">
              <div className={`font-display font-bold text-2xl ${c}`}>{v}</div>
              <div className="text-slate-500 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-slate-900 dark:text-white">Fee Records</h3>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={15}/> Assign Fee
        </button>
      </div>

      <div className="dashboard-card overflow-hidden p-0">
        {loading ? <div className="flex justify-center py-16"><div className="loader"/></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{['Student','Dept','Total Fee','Paid','Pending','Due Date','Status'].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr></thead>
              <tbody>
                {fees.map((f, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell font-medium text-sm">{f.studentId?.fullName}</td>
                    <td className="table-cell text-xs">{f.studentId?.department}</td>
                    <td className="table-cell font-semibold">₹{f.totalFee?.toLocaleString()}</td>
                    <td className="table-cell text-emerald-600 dark:text-emerald-400">₹{f.paidAmount?.toLocaleString()}</td>
                    <td className="table-cell text-red-600 dark:text-red-400">₹{f.pendingAmount?.toLocaleString()}</td>
                    <td className="table-cell text-xs">{f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="table-cell"><span className={`badge ${statusColors[f.status]}`}>{f.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-premium">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Assign Fee</h3>
              <button onClick={() => setModal(false)} className="btn-icon text-slate-400"><FiX/></button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="label-field">Select Student</label>
                <select value={form.studentId} onChange={e => setForm(f=>({...f,studentId:e.target.value}))} required className="input-field">
                  <option value="">Select Student</option>
                  {fees.map(f => <option key={f.studentId?._id} value={f.studentId?._id}>{f.studentId?.fullName} ({f.studentId?.rollNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="label-field">Total Fee Amount (₹)</label>
                <input type="number" value={form.totalFee} onChange={e => setForm(f=>({...f,totalFee:e.target.value}))} required placeholder="75000" className="input-field"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} required className="input-field"/>
                </div>
                <div>
                  <label className="label-field">Academic Year</label>
                  <input value={form.academicYear} onChange={e => setForm(f=>({...f,academicYear:e.target.value}))} className="input-field" placeholder="2024-25"/>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 dark:border-slate-600 dark:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Saving...' : '💰 Assign Fee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
