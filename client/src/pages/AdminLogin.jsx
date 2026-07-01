import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginAdmin } from '../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from 'react-icons/fi';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAdmin(form);
      login(res.data.admin, res.data.token, 'admin');
      toast.success(`Welcome, ${res.data.admin.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-700 via-accent-900 to-slate-900" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
            <FiShield className="text-white" size={28} />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-4">Admin Control Center</h1>
          <p className="text-accent-200 text-lg leading-relaxed mb-8">Manage the entire campus ecosystem from one powerful dashboard.</p>
          <div className="space-y-3">
            {['👥 Manage all students', '📊 View analytics & reports', '🎪 Create & manage events', '✅ Approve registrations', '💰 Fee management', '📅 Attendance control'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-accent-100">
                <div className="w-2 h-2 bg-accent-400 rounded-full" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-white/80 text-sm font-medium mb-1">Admin Credentials</p>
            <p className="text-white/60 text-xs">📧 admin@campus.com</p>
            <p className="text-white/60 text-xs">🔐 Admin@123</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 bg-slate-950">
        <div className="mb-10 max-w-md mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <FiArrowLeft size={16} /> Back to Home
          </Link>
        </div>
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-500/30 text-accent-400 px-3 py-1.5 rounded-lg text-xs font-semibold mb-4">
              <FiShield size={12} /> ADMIN ACCESS
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Admin Login</h2>
            <p className="text-slate-400">Restricted area — authorized personnel only</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Admin Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input id="admin-email" type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@campus.com"
                  className="input-field pl-10 bg-slate-900 border-slate-700 text-white" />
              </div>
            </div>
            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input id="admin-password" type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter admin password"
                  className="input-field pl-10 pr-10 bg-slate-900 border-slate-700 text-white" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <button id="admin-login-btn" type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : '🛡️ Admin Sign In'}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-6">
            Not an admin?{' '}
            <Link to="/student/login" className="text-primary-400 hover:text-primary-300 font-medium">Student Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
