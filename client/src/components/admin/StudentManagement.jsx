import { useState, useEffect } from 'react';
import { getAllStudents, addStudent, updateStudent, deleteStudent, toggleSuspend } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUserX, FiUserCheck, FiX } from 'react-icons/fi';

const departments = ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Electrical Engineering'];
const emptyForm = { fullName: '', rollNumber: '', registerNumber: '', department: '', year: '1', section: 'A', dob: '', gender: 'Male', email: '', mobile: '', parentName: '', parentMobile: '', address: '', password: '' };

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (deptFilter) params.department = deptFilter;
    const res = await getAllStudents(params).catch(() => null);
    setStudents(res?.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, deptFilter]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal('add'); };
  const openEdit = (s) => {
    setForm({ ...s, dob: s.dob?.split('T')[0] || '', password: '' });
    setEditId(s._id); setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (modal === 'add') { await addStudent(fd); toast.success('Student added!'); }
      else { await updateStudent(editId, fd); toast.success('Student updated!'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"?`)) return;
    await deleteStudent(id).catch(() => {});
    toast.success('Student deleted'); load();
  };

  const handleToggle = async (s) => {
    await toggleSuspend(s._id).catch(() => {});
    toast.success(`Student ${s.isActive ? 'suspended' : 'activated'}`);
    load();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="input-field pl-9 text-sm" />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field text-sm w-auto">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
          <FiPlus size={16} /> Add Student
        </button>
      </div>

      <div className="dashboard-card overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Students ({students.length})</h3>
        </div>
        {loading ? <div className="flex justify-center py-16"><div className="loader" /></div> :
          students.length === 0 ? <div className="text-center py-16 text-slate-400">No students found</div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>{['Name', 'Roll No.', 'Dept.', 'Year/Sec', 'Email', 'Status', 'Actions'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s._id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            {s.profilePhoto ? <img src={`http://localhost:5000${s.profilePhoto}`} className="w-full h-full object-cover" alt="" /> : s.fullName?.[0]}
                          </div>
                          <span className="font-medium">{s.fullName}</span>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-xs">{s.rollNumber}</td>
                      <td className="table-cell text-xs">{s.department}</td>
                      <td className="table-cell text-xs">Y{s.year} / {s.section}</td>
                      <td className="table-cell text-xs">{s.email}</td>
                      <td className="table-cell">
                        <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? '● Active' : '● Suspended'}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(s)} className="btn-icon text-slate-400 hover:text-primary-500"><FiEdit size={14} /></button>
                          <button onClick={() => handleToggle(s)} className={`btn-icon ${s.isActive ? 'text-slate-400 hover:text-amber-500' : 'text-slate-400 hover:text-emerald-500'}`}>
                            {s.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                          </button>
                          <button onClick={() => handleDelete(s._id, s.fullName)} className="btn-icon text-slate-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-2xl my-8 shadow-premium">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-xl">{modal === 'add' ? 'Add New Student' : 'Edit Student'}</h3>
              <button onClick={() => setModal(null)} className="btn-icon text-slate-400"><FiX /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[['Full Name', 'fullName', 'text'], ['Email', 'email', 'email'], ['Roll Number', 'rollNumber', 'text'], ['Register Number', 'registerNumber', 'text'], ['Mobile', 'mobile', 'tel'], ['Parent Name', 'parentName', 'text'], ['Parent Mobile', 'parentMobile', 'tel'], ['Date of Birth', 'dob', 'date']].map(([l, k, t]) => (
                  <div key={k}>
                    <label className="label-field">{l}</label>
                    <input type={t} value={form[k] || ''} onChange={e => set(k, e.target.value)} className="input-field text-sm" required={modal === 'add'} />
                  </div>
                ))}
                <div>
                  <label className="label-field">Department</label>
                  <select value={form.department} onChange={e => set('department', e.target.value)} className="input-field text-sm" required>
                    <option value="">Select</option>
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Gender</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field text-sm">
                    {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Year</label>
                  <select value={form.year} onChange={e => set('year', e.target.value)} className="input-field text-sm">
                    {['1','2','3','4'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Section</label>
                  <select value={form.section} onChange={e => set('section', e.target.value)} className="input-field text-sm">
                    {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {modal === 'add' && (
                  <div>
                    <label className="label-field">Password</label>
                    <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="input-field text-sm" required minLength={6} placeholder="Min. 6 characters" />
                  </div>
                )}
              </div>
              <div>
                <label className="label-field">Address</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2} className="input-field text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 dark:border-slate-600 dark:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Saving...' : modal === 'add' ? '✅ Add Student' : '✅ Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
