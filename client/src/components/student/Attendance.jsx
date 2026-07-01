import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance } from '../../services/api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Attendance() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    getStudentAttendance(user._id).then(res => { setData(res.data); setLoading(false); });
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="loader" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-400">No attendance data</div>;

  const chartOpts = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } };

  const subjectChartData = {
    labels: data.subjectWise.map(s => s.subject.length > 15 ? s.subject.slice(0, 15) + '…' : s.subject),
    datasets: [{ data: data.subjectWise.map(s => s.percentage), backgroundColor: data.subjectWise.map(s => s.percentage >= 75 ? '#10b981' : '#ef4444'), borderRadius: 8 }]
  };

  const monthlyChartData = {
    labels: data.monthly.map(m => MONTHS[m.month - 1]),
    datasets: [{
      label: 'Attendance %',
      data: data.monthly.map(m => m.total > 0 ? Math.round((m.present / m.total) * 100) : 0),
      borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#3b82f6',
    }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          ['Overall %', `${data.percentage}%`, data.percentage >= 75 ? 'text-emerald-500' : 'text-red-500'],
          ['Total Classes', data.total, 'text-blue-500'],
          ['Present', data.present, 'text-emerald-500'],
          ['Absent', data.absent, 'text-red-500'],
        ].map(([l, v, cls]) => (
          <div key={l} className="dashboard-card text-center">
            <div className={`font-display font-bold text-3xl ${cls}`}>{v}</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">{l}</div>
          </div>
        ))}
      </div>

      {data.percentage < 75 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Low Attendance Warning</p>
            <p className="text-red-600 dark:text-red-500 text-sm">Your attendance is below 75%. You need to attend more classes to avoid academic consequences.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject-wise */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Subject-wise Attendance</h3>
          <Bar data={subjectChartData} options={{ ...chartOpts, scales: { ...chartOpts.scales, y: { min: 0, max: 100 } } }} />
          <div className="mt-4 space-y-2">
            {data.subjectWise.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-28 text-xs text-slate-600 dark:text-slate-400 truncate">{s.subject}</div>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full">
                  <div className={`h-2 rounded-full ${s.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${s.percentage}%` }} />
                </div>
                <div className={`text-xs font-bold w-10 text-right ${s.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{s.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly trend */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Monthly Trend</h3>
          <Line data={monthlyChartData} options={{ ...chartOpts, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
        </div>
      </div>

      {/* Detailed table */}
      <div className="dashboard-card overflow-hidden">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Subject Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Subject', 'Total', 'Present', 'Absent', 'Percentage', 'Status'].map(h => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.subjectWise.map((s, i) => (
                <tr key={i} className="table-row">
                  <td className="table-cell font-medium">{s.subject}</td>
                  <td className="table-cell">{s.total}</td>
                  <td className="table-cell text-emerald-600 dark:text-emerald-400">{s.present}</td>
                  <td className="table-cell text-red-600 dark:text-red-400">{s.total - s.present}</td>
                  <td className="table-cell font-bold">{s.percentage}%</td>
                  <td className="table-cell">
                    <span className={`badge ${s.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
                      {s.percentage >= 75 ? '✓ Good' : '⚠ Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
