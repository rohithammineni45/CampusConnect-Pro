import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentById, updateStudent, changePassword } from '../../services/api';
import toast from 'react-hot-toast';
import { FiEdit, FiLock, FiSave, FiX, FiUpload } from 'react-icons/fi';

const departments = ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Electrical Engineering'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    getStudentById(user._id).then(res => { setData(res.data); setForm(res.data); });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      const allowed = ['fullName', 'mobile', 'parentName', 'parentMobile', 'address', 'section', 'year', 'department'];
      allowed.forEach(k => fd.append(k, form[k] || ''));
      if (photo) fd.append('profilePhoto', photo);
      const res = await updateStudent(user._id, fd);
      setData(res.data); setForm(res.data);
      updateUser({ ...user, ...res.data });
      setEditMode(false); setPhoto(null); setPhotoPreview(null);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Minimum 6 characters');
    setLoading(true);
    try {
      await changePassword(user._id, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!'); setPwMode(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (f) { setPhoto(f); setPhotoPreview(URL.createObjectURL(f)); }
  };

  if (!data) return <div className="flex justify-center py-20"><div className="loader" /></div>;

  const Field = ({ label, value, editValue, onChange, type = 'text', options }) => (
    <div>
      <label className="label-field">{label}</label>
      {editMode ? (
        options ? (
          <select value={editValue} onChange={e => onChange(e.target.value)} className="input-field">
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={editValue || ''} onChange={e => onChange(e.target.value)} className="input-field" />
        )
      ) : (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{value || '—'}</div>
      )}
    </div>
  );

  const photoUrl = photoPreview || (data.profilePhoto ? `http://localhost:5000${data.profilePhoto}` : null);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" alt="" /> : data.fullName?.[0]}
            </div>
            {editMode && (
              <label htmlFor="profile-photo" className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-600">
                <FiUpload size={14} className="text-white" />
                <input id="profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.fullName}</h2>
            <p className="text-slate-500 dark:text-slate-400">{data.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge badge-info">{data.rollNumber}</span>
              <span className="badge badge-purple">{data.department}</span>
              <span className="badge badge-success">Year {data.year} · Sec {data.section}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!editMode && !pwMode && (
              <>
                <button onClick={() => setEditMode(true)} className="btn-primary flex items-center gap-2 text-sm"><FiEdit size={14} /> Edit</button>
                <button onClick={() => setPwMode(true)} className="btn-secondary flex items-center gap-2 text-sm dark:border-slate-600 dark:text-white"><FiLock size={14} /> Password</button>
              </>
            )}
            {(editMode || pwMode) && (
              <button onClick={() => { setEditMode(false); setPwMode(false); setPhotoPreview(null); }} className="btn-secondary flex items-center gap-2 text-sm dark:border-slate-600 dark:text-white">
                <FiX size={14} /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Change password panel */}
      {pwMode && (
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Change Password</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[['Current Password', 'currentPassword'], ['New Password', 'newPassword'], ['Confirm Password', 'confirmPassword']].map(([l, k]) => (
              <div key={k}>
                <label className="label-field">{l}</label>
                <input type="password" value={pwForm[k]} onChange={e => setPwForm(p => ({ ...p, [k]: e.target.value }))} className="input-field" placeholder="••••••••" />
              </div>
            ))}
          </div>
          <button onClick={handlePasswordChange} disabled={loading} className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-60">
            {loading ? 'Saving...' : <><FiSave size={14} /> Change Password</>}
          </button>
        </div>
      )}

      {/* Profile fields */}
      <div className="dashboard-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Personal Information</h3>
          {editMode && (
            <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              {loading ? 'Saving...' : <><FiSave size={14} /> Save Changes</>}
            </button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={data.fullName} editValue={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
          <Field label="Email" value={data.email} editValue={data.email} onChange={() => {}} />
          <Field label="Mobile Number" value={data.mobile} editValue={form.mobile} onChange={v => setForm(f => ({ ...f, mobile: v }))} />
          <Field label="Date of Birth" value={new Date(data.dob).toLocaleDateString('en-IN')} editValue={data.dob?.split('T')[0]} onChange={v => setForm(f => ({ ...f, dob: v }))} type="date" />
          <Field label="Gender" value={data.gender} editValue={data.gender} onChange={() => {}} />
          <Field label="Roll Number" value={data.rollNumber} editValue={data.rollNumber} onChange={() => {}} />
          <Field label="Register Number" value={data.registerNumber} editValue={data.registerNumber} onChange={() => {}} />
          <Field label="Department" value={data.department} editValue={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} options={departments} />
          <Field label="Year" value={`Year ${data.year}`} editValue={String(form.year)} onChange={v => setForm(f => ({ ...f, year: v }))} options={['1','2','3','4']} />
          <Field label="Section" value={data.section} editValue={form.section} onChange={v => setForm(f => ({ ...f, section: v }))} options={['A','B','C','D']} />
          <Field label="Parent Name" value={data.parentName} editValue={form.parentName} onChange={v => setForm(f => ({ ...f, parentName: v }))} />
          <Field label="Parent Mobile" value={data.parentMobile} editValue={form.parentMobile} onChange={v => setForm(f => ({ ...f, parentMobile: v }))} />
        </div>
        <div className="mt-4">
          <Field label="Address" value={data.address} editValue={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
        </div>
      </div>
    </div>
  );
}
