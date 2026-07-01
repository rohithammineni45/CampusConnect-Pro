import { useState, useEffect } from 'react';
import { getStudentStats, getFeeAnalytics, getEventAnalytics, getAttendanceAnalytics } from '../../services/api';
import { FiUsers, FiDollarSign, FiAward, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [fee, setFee] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStudentStats().catch(() => null),
      getFeeAnalytics().catch(() => null),
      getEventAnalytics().catch(() => null),
    ]).then(([s, f, e]) => {
      setStats(s?.data);
      setFee(f?.data);
      setEvent(e?.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="loader" /></div>;

  const kpis = [
    { label: 'Total Students', value: stats?.totalStudents || 0, sub: `${stats?.activeStudents || 0} active`, icon: FiUsers, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Departments', value: stats?.totalDepartments || 0, sub: 'Active departments', icon: FiAward, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    { label: 'Total Events', value: event?.totalEvents || 0, sub: `${event?.totalRegistrations || 0} registrations`, icon: FiCalendar, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
    { label: 'Fee Collected', value: fee ? `₹${(fee.totalCollected / 100000).toFixed(1)}L` : '—', sub: `Pending: ₹${fee ? (fee.totalPending / 100000).toFixed(1) : 0}L`, icon: FiDollarSign, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  ];

  const deptData = {
    labels: stats?.deptWise?.map(d => d._id) || [],
    datasets: [{ data: stats?.deptWise?.map(d => d.count) || [], backgroundColor: ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4'], borderWidth: 0 }]
  };

  const yearData = {
    labels: stats?.yearWise?.map(y => `Year ${y._id}`) || [],
    datasets: [{ label: 'Students', data: stats?.yearWise?.map(y => y.count) || [], backgroundColor: '#3b82f6', borderRadius: 8 }]
  };

  const feeData = {
    labels: ['Paid', 'Partial', 'Pending'],
    datasets: [{ data: [fee?.statusCount?.paid || 0, fee?.statusCount?.partial || 0, fee?.statusCount?.pending || 0], backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 0 }]
  };

  const evtData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{ data: [event?.statusCount?.approved || 0, event?.statusCount?.pending || 0, event?.statusCount?.rejected || 0], backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 0 }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-600 to-primary-600 text-white border-0">
        <h2 className="font-display text-2xl font-bold mb-1">Admin Control Center 🛡️</h2>
        <p className="text-white/70">Manage students, events, fees, and more from one powerful dashboard.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="stat-card">
            <div className={`w-12 h-12 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
              <k.icon className={k.text} size={22} />
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-slate-900 dark:text-white">{k.value}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{k.sub}</div>
              <div className="text-slate-400 dark:text-slate-500 text-xs">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department wise */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Students by Department</h3>
          <div className="h-52">
            <Doughnut data={deptData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }} />
          </div>
        </div>

        {/* Year wise */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Students by Year</h3>
          <Bar data={yearData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } }} />
        </div>

        {/* Fee status */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Fee Collection Status</h3>
          <div className="flex items-center gap-6">
            <div className="h-40 w-40 flex-shrink-0">
              <Doughnut data={feeData} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }} />
            </div>
            <div className="space-y-3 flex-1">
              {[['Fully Paid', fee?.statusCount?.paid || 0, 'bg-emerald-500'],
                ['Partial', fee?.statusCount?.partial || 0, 'bg-amber-500'],
                ['Pending', fee?.statusCount?.pending || 0, 'bg-red-500']].map(([l, v, c]) => (
                <div key={l} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${c}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{l}</span>
                  <span className="font-bold text-slate-800 dark:text-white">{v}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500">Total Collected</div>
                <div className="font-display font-bold text-emerald-600 dark:text-emerald-400 text-lg">₹{fee?.totalCollected?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Event registrations */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Event Registration Status</h3>
          <div className="flex items-center gap-6">
            <div className="h-40 w-40 flex-shrink-0">
              <Doughnut data={evtData} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }} />
            </div>
            <div className="space-y-3 flex-1">
              {[['Approved', event?.statusCount?.approved || 0, 'bg-emerald-500'],
                ['Pending', event?.statusCount?.pending || 0, 'bg-amber-500'],
                ['Rejected', event?.statusCount?.rejected || 0, 'bg-red-500']].map(([l, v, c]) => (
                <div key={l} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${c}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{l}</span>
                  <span className="font-bold text-slate-800 dark:text-white">{v}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500">Total Events</div>
                <div className="font-display font-bold text-blue-600 dark:text-blue-400 text-lg">{event?.totalEvents || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
