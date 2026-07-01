import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance, getStudentFee, getNotifications } from '../../services/api';
import { FiUser, FiCalendar, FiDollarSign, FiBell, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Overview() {
  const { user } = useAuth();
  const [att, setAtt] = useState(null);
  const [fee, setFee] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([
      getStudentAttendance(user._id).catch(() => null),
      getStudentFee(user._id).catch(() => null),
      getNotifications().catch(() => null),
    ]).then(([a, f, n]) => {
      setAtt(a?.data);
      setFee(f?.data);
      setNotifs(n?.data?.notifications?.slice(0, 4) || []);
      setLoading(false);
    });
  }, [user]);

  const statCards = [
    { label: 'Attendance', value: att ? `${att.percentage}%` : '--', sub: `${att?.present || 0} / ${att?.total || 0} classes`, icon: FiCalendar, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Fee', value: fee ? `₹${fee.totalFee?.toLocaleString()}` : '--', sub: `Pending: ₹${fee?.pendingAmount?.toLocaleString() || 0}`, icon: FiDollarSign, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Fee Paid', value: fee ? `₹${fee.paidAmount?.toLocaleString()}` : '--', sub: fee?.status === 'paid' ? '✅ Fully Paid' : '⏳ Partial Payment', icon: FiTrendingUp, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    { label: 'Notifications', value: notifs.filter(n => !n.isRead).length, sub: 'Unread messages', icon: FiBell, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="loader" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h2>
            <p className="text-white/80">{user?.department} · Year {user?.year} · Section {user?.section}</p>
            <div className="flex gap-3 mt-3">
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">{user?.rollNumber}</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">{user?.email}</span>
            </div>
          </div>
          <div className="hidden sm:flex w-16 h-16 bg-white/20 rounded-2xl items-center justify-center text-4xl">
            {user?.profilePhoto
              ? <img src={`http://localhost:5000${user.profilePhoto}`} className="w-full h-full object-cover rounded-2xl" alt="" />
              : '🎓'}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
              <c.icon className={c.text} size={22} />
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-slate-900 dark:text-white">{c.value}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{c.sub}</div>
              <div className="text-slate-400 dark:text-slate-500 text-xs">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance chart */}
        {att && (
          <div className="dashboard-card">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Attendance Overview</h3>
            <div className="flex items-center gap-8">
              <div className="w-36 h-36">
                <Doughnut
                  data={{
                    labels: ['Present', 'Absent'],
                    datasets: [{ data: [att.present, att.absent], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }]
                  }}
                  options={{ cutout: '75%', plugins: { legend: { display: false } } }}
                />
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-display font-bold text-slate-900 dark:text-white">{att.percentage}%</div>
                <div className="space-y-1">
                  {[['Present', att.present, 'bg-emerald-500'], ['Absent', att.absent, 'bg-red-500']].map(([l, v, c]) => (
                    <div key={l} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${c}`} />
                      <span className="text-slate-500 dark:text-slate-400 text-sm">{l}: {v}</span>
                    </div>
                  ))}
                </div>
                <div className={`badge ${att.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
                  {att.percentage >= 75 ? '✓ Good Standing' : '⚠ Low Attendance'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent notifications */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Recent Notifications</h3>
          {notifs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No notifications yet</div>
          ) : (
            <div className="space-y-3">
              {notifs.map((n, i) => (
                <div key={i} className={`p-3 rounded-xl border ${!n.isRead ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800/30' : 'border-slate-100 dark:border-slate-700/50'}`}>
                  <div className="flex items-start gap-2">
                    <div className="text-lg mt-0.5">{n.type === 'fee' ? '💰' : n.type === 'attendance' ? '📅' : n.type === 'approval' ? '✅' : '📢'}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{n.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fee summary */}
      {fee && (
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Fee Summary</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ['Total Fee', fee.totalFee, 'text-slate-700 dark:text-slate-300'],
              ['Paid Amount', fee.paidAmount, 'text-emerald-600 dark:text-emerald-400'],
              ['Pending Amount', fee.pendingAmount, fee.pendingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600'],
            ].map(([l, v, cls]) => (
              <div key={l} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">{l}</div>
                <div className={`font-display font-bold text-xl ${cls}`}>₹{v?.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Payment Progress</span>
              <span>{Math.round((fee.paidAmount / fee.totalFee) * 100) || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2.5 rounded-full transition-all"
                style={{ width: `${Math.round((fee.paidAmount / fee.totalFee) * 100) || 0}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
