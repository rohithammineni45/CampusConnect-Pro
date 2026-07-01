import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNotifications } from '../services/api';
import {
  FiGrid, FiUser, FiCalendar, FiDollarSign, FiCheckSquare,
  FiBell, FiLogOut, FiSun, FiMoon, FiMenu, FiX, FiAward
} from 'react-icons/fi';

// Sub-modules
import Overview from '../components/student/Overview';
import Profile from '../components/student/Profile';
import Attendance from '../components/student/Attendance';
import Fees from '../components/student/Fees';
import Events from '../components/student/Events';
import Tasks from '../components/student/Tasks';
import Notifications from '../components/student/Notifications';

const navItems = [
  { path: '', label: 'Overview', icon: FiGrid },
  { path: 'profile', label: 'My Profile', icon: FiUser },
  { path: 'attendance', label: 'Attendance', icon: FiCalendar },
  { path: 'fees', label: 'Fee Management', icon: FiDollarSign },
  { path: 'events', label: 'Events', icon: FiAward },
  { path: 'tasks', label: 'Tasks', icon: FiCheckSquare },
  { path: 'notifications', label: 'Notifications', icon: FiBell },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotifications().then(res => setUnreadCount(res.data.unreadCount || 0)).catch(() => {});
  }, [location.pathname]);

  const getActive = () => {
    const parts = location.pathname.split('/');
    return parts[parts.length - 1] === 'dashboard' ? '' : parts[parts.length - 1];
  };

  const handleNav = (path) => {
    navigate(`/student/dashboard${path ? '/' + path : ''}`);
    setSidebarOpen(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center font-bold text-white">C</div>
          <div>
            <div className="font-display font-bold text-white text-sm">CampusConnect</div>
            <div className="text-slate-400 text-xs">Student Portal</div>
          </div>
        </div>
      </div>
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
            {user?.profilePhoto
              ? <img src={`http://localhost:5000${user.profilePhoto}`} className="w-full h-full object-cover rounded-xl" alt="" />
              : user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm truncate">{user?.fullName}</div>
            <div className="text-slate-400 text-xs truncate">{user?.department}</div>
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
              {path === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        <button onClick={toggleTheme} className="sidebar-item w-full text-left">
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <FiLogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-icon">
            <FiMenu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="hidden lg:block">
            <h1 className="font-display font-bold text-slate-900 dark:text-white">
              {navItems.find(n => n.path === getActive())?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={toggleTheme} className="btn-icon text-slate-500 dark:text-slate-400">
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button onClick={() => handleNav('notifications')} className="relative btn-icon text-slate-500 dark:text-slate-400">
              <FiBell size={18} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <button onClick={handleLogout} className="btn-icon text-red-400 hover:text-red-300">
              <FiLogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="fees" element={<Fees />} />
            <Route path="events" element={<Events />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
