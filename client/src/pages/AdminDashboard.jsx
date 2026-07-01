import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiGrid, FiUsers, FiCalendar, FiDollarSign, FiAward,
  FiCheckSquare, FiBarChart2, FiFileText, FiLogOut, FiSun, FiMoon, FiMenu, FiShield
} from 'react-icons/fi';

import AdminOverview from '../components/admin/AdminOverview';
import StudentManagement from '../components/admin/StudentManagement';
import AttendanceManagement from '../components/admin/AttendanceManagement';
import FeeManagement from '../components/admin/FeeManagement';
import EventManagement from '../components/admin/EventManagement';
import EventApprovals from '../components/admin/EventApprovals';
import Analytics from '../components/admin/Analytics';
import Reports from '../components/admin/Reports';

const navItems = [
  { path: '', label: 'Dashboard', icon: FiGrid },
  { path: 'students', label: 'Students', icon: FiUsers },
  { path: 'attendance', label: 'Attendance', icon: FiCalendar },
  { path: 'fees', label: 'Fee Management', icon: FiDollarSign },
  { path: 'events', label: 'Events', icon: FiAward },
  { path: 'approvals', label: 'Event Approvals', icon: FiCheckSquare },
  { path: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: 'reports', label: 'Reports', icon: FiFileText },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getActive = () => {
    const parts = location.pathname.split('/');
    const last = parts[parts.length - 1];
    return last === 'dashboard' ? '' : last;
  };

  const handleNav = (path) => {
    navigate(`/admin/dashboard${path ? '/' + path : ''}`);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center"><FiShield className="text-white" size={20} /></div>
          <div>
            <div className="font-display font-bold text-white text-sm">CampusConnect</div>
            <div className="text-accent-400 text-xs font-semibold">Admin Panel</div>
          </div>
        </div>
      </div>
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-primary-400 flex items-center justify-center text-white font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{user?.name}</div>
            <div className="text-slate-400 text-xs">Super Administrator</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = getActive() === path;
          return (
            <button key={path} onClick={() => handleNav(path)}
              className={`sidebar-item w-full text-left ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        <button onClick={toggleTheme} className="sidebar-item w-full text-left">
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={() => { logout(); navigate('/'); }} className="sidebar-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <FiLogOut size={18} /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col"><SidebarContent /></aside>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-icon">
            <FiMenu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <span className="badge badge-purple"><FiShield size={10} /> Admin</span>
            <h1 className="font-display font-bold text-slate-900 dark:text-white">
              {navItems.find(n => n.path === getActive())?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={toggleTheme} className="btn-icon text-slate-500 dark:text-slate-400">
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button onClick={() => { logout(); navigate('/'); }} className="btn-icon text-red-400 hover:text-red-300">
              <FiLogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="approvals" element={<EventApprovals />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
