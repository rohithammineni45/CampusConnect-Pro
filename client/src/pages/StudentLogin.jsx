import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { loginStudent } from '../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi';

export default function StudentLogin() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginStudent(form);
      login(res.data.student, res.data.token, 'student');
      toast.success(`Welcome back, ${res.data.student.fullName}!`);
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-800 to-slate-900" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl font-bold text-white">C</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-4">Welcome Back, Student!</h1>
            <p className="text-primary-200 text-lg leading-relaxed">Access your personalized dashboard, track attendance, manage fees, and register for exciting campus events.</p>
          </div>
          <div className="space-y-4">
            {['📊 Real-time attendance tracking', '💰 Online fee payments', '🎪 Event registration', '✅ Task management', '🔔 Smart notifications'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-primary-100">
                <div className="w-2 h-2 bg-primary-400 rounded-full" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-white/80 text-sm font-medium mb-1">Demo Credentials</p>
            <p className="text-white/60 text-xs">📧 student@campus.com</p>
            <p className="text-white/60 text-xs">🔐 Student@123</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 bg-slate-950">
        <div className="flex justify-between items-center mb-10 max-w-md mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <FiArrowLeft size={16} /> Back to Home
          </Link>
          <button onClick={toggleTheme} className="btn-icon text-slate-400">
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2">Student Login</h2>
            <p className="text-slate-400">Sign in to access your campus portal</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input id="student-email" type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="student@campus.com"
                  className="input-field pl-10 bg-slate-900 border-slate-700 text-white" />
              </div>
            </div>
            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input id="student-password" type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10 bg-slate-900 border-slate-700 text-white" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <button id="student-login-btn" type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : '🎓 Sign In'}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/student/register" className="text-primary-400 hover:text-primary-300 font-medium">Register here</Link>
          </p>
          <div className="mt-4 text-center">
            <Link to="/admin/login" className="text-slate-500 hover:text-slate-300 text-xs">Admin? Login here →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
