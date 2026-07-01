import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerStudent } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiArrowRight, FiUpload } from 'react-icons/fi';

const departments = ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Electrical Engineering'];

const steps = ['Personal Info', 'Academic Details', 'Contact & Family', 'Security'];

const Field = ({ label, id, type = 'text', value, onChange, placeholder, required = true, className = '' }) => (
    <div className={className}>
      <label className="label-field text-slate-300">{label}{required && ' *'}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="input-field bg-slate-900 border-slate-700 text-white placeholder-slate-500" />
    </div>
  );

  const Select = ({ label, id, value, onChange, options, required = true }) => (
    <div>
      <label className="label-field text-slate-300">{label}{required && ' *'}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="input-field bg-slate-900 border-slate-700 text-white">
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

export default function StudentRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', dob: '', gender: '',
    rollNumber: '', registerNumber: '', department: '', year: '', section: '',
    mobile: '', parentName: '', parentMobile: '', address: '',
    password: '', confirmPassword: '', profilePhoto: null,
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      set('profilePhoto', file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = () => {
    if (step === 0 && (!form.fullName || !form.email || !form.dob || !form.gender)) { toast.error('Fill all personal details'); return false; }
    if (step === 1 && (!form.rollNumber || !form.registerNumber || !form.department || !form.year || !form.section)) { toast.error('Fill all academic details'); return false; }
    if (step === 2 && (!form.mobile || !form.parentName || !form.parentMobile || !form.address)) { toast.error('Fill all contact details'); return false; }
    if (step === 3) {
      if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v && k !== 'confirmPassword') fd.append(k, v); });
      const res = await registerStudent(fd);
      login(res.data.student, res.data.token, 'student');
      toast.success('Account created successfully! Welcome to CampusConnect Pro!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/student/login" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <FiArrowLeft size={16} /> Back to Login
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">C</div>
            <span className="font-display font-bold text-white text-sm hidden sm:block">CampusConnect Pro</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-primary-400 font-medium' : 'text-slate-500'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-12 sm:w-20 h-0.5 ml-2 ${i < step ? 'bg-primary-500' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-white mb-6">{steps[step]}</h2>
          <form onSubmit={step === 3 ? handleSubmit : e => { e.preventDefault(); if (validateStep()) setStep(s => s + 1); }}>
            {step === 0 && (
              <div className="space-y-4">
                {/* Photo upload */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden">
                    {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <FiUpload className="text-slate-500" size={24} />}
                  </div>
                  <div>
                    <label htmlFor="photo-upload" className="btn-secondary text-sm cursor-pointer inline-block dark:text-white dark:border-slate-600">
                      Upload Photo
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    <p className="text-slate-500 text-xs mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>
                <Field label="Full Name" id="fullName" value={form.fullName} onChange={v => set('fullName', v)} placeholder="Arjun Sharma" />
                <Field label="Email Address" id="email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="arjun@example.com" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date of Birth" id="dob" type="date" value={form.dob} onChange={v => set('dob', v)} placeholder="" />
                  <Select label="Gender" id="gender" value={form.gender} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other']} />
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Roll Number" id="rollNumber" value={form.rollNumber} onChange={v => set('rollNumber', v)} placeholder="22CS001" />
                  <Field label="Register Number" id="registerNumber" value={form.registerNumber} onChange={v => set('registerNumber', v)} placeholder="22UCS001" />
                </div>
                <Select label="Department" id="department" value={form.department} onChange={v => set('department', v)} options={departments} />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Year" id="year" value={form.year} onChange={v => set('year', v)} options={['1', '2', '3', '4']} />
                  <Select label="Section" id="section" value={form.section} onChange={v => set('section', v)} options={['A', 'B', 'C', 'D']} />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <Field label="Mobile Number" id="mobile" type="tel" value={form.mobile} onChange={v => set('mobile', v)} placeholder="9876543210" />
                <Field label="Parent / Guardian Name" id="parentName" value={form.parentName} onChange={v => set('parentName', v)} placeholder="Ramesh Sharma" />
                <Field label="Parent Mobile Number" id="parentMobile" type="tel" value={form.parentMobile} onChange={v => set('parentMobile', v)} placeholder="9876543211" />
                <div>
                  <label className="label-field text-slate-300">Address *</label>
                  <textarea id="address" value={form.address} onChange={e => set('address', e.target.value)} required rows={3}
                    placeholder="Enter full residential address..."
                    className="input-field bg-slate-900 border-slate-700 text-white placeholder-slate-500 resize-none" />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <Field label="Password" id="password" type="password" value={form.password} onChange={v => set('password', v)} placeholder="Min. 6 characters" />
                <Field label="Confirm Password" id="confirmPassword" type="password" value={form.confirmPassword} onChange={v => set('confirmPassword', v)} placeholder="Re-enter password" />
                <div className="bg-slate-800 rounded-xl p-4 text-sm text-slate-400 space-y-1">
                  <p className={form.password.length >= 6 ? 'text-emerald-400' : ''}>✓ Minimum 6 characters</p>
                  <p className={form.password === form.confirmPassword && form.password ? 'text-emerald-400' : ''}>✓ Passwords match</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1 dark:text-white dark:border-slate-600">
                  <FiArrowLeft className="inline mr-2" /> Previous
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</> :
                  step === 3 ? '🎓 Create Account' : <>Next <FiArrowRight /></>}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account? <Link to="/student/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
