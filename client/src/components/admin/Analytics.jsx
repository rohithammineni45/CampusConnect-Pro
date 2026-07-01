import { useState, useEffect } from 'react';
import { getFeeAnalytics, getEventAnalytics, getAttendanceAnalytics, getStudentStats } from '../../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [fee, setFee] = useState(null);
  const [event, setEvent] = useState(null);
  const [att, setAtt] = useState(null);
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeeAnalytics().catch(()=>null),
      getEventAnalytics().catch(()=>null),
      getAttendanceAnalytics().catch(()=>null),
      getStudentStats().catch(()=>null),
    ]).then(([f,e,a,s]) => {
      setFee(f?.data); setEvent(e?.data); setAtt(a?.data); setStudents(s?.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="loader"/></div>;

  const chartOpts = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } };

  // Fee bar chart
  const feeBarData = {
    labels: ['Collected', 'Pending'],
    datasets: [{ data: [fee?.totalCollected||0, fee?.totalPending||0], backgroundColor: ['#10b981','#ef4444'], borderRadius: 10 }]
  };

  // Event participation bar
  const evtBarData = {
    labels: event?.eventParticipation?.map(e=>e.title.slice(0,15)+'…')||[],
    datasets: [
      { label: 'Registered', data: event?.eventParticipation?.map(e=>e.registered)||[], backgroundColor: '#3b82f6', borderRadius: 6 },
      { label: 'Approved', data: event?.eventParticipation?.map(e=>e.approved)||[], backgroundColor: '#10b981', borderRadius: 6 },
    ]
  };

  // Attendance monthly line
  const attMonthly = {};
  (att?.monthly || []).forEach(m => {
    const key = `${MONTHS[(m._id.month||1)-1]} ${m._id.year}`;
    if (!attMonthly[key]) attMonthly[key] = { present: 0, absent: 0 };
    if (m._id.status === 'present') attMonthly[key].present = m.count;
    else attMonthly[key].absent = m.count;
  });
  const attLabels = Object.keys(attMonthly);
  const attLineData = {
    labels: attLabels,
    datasets: [
      { label: 'Present', data: attLabels.map(k=>attMonthly[k].present), borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.1)', fill:true, tension:0.4 },
      { label: 'Absent', data: attLabels.map(k=>attMonthly[k].absent), borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.1)', fill:true, tension:0.4 },
    ]
  };

  // Department distribution
  const deptData = {
    labels: students?.deptWise?.map(d=>d._id)||[],
    datasets: [{ data: students?.deptWise?.map(d=>d.count)||[], backgroundColor:['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4'], borderWidth:0 }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl">Analytics Dashboard</h2>

      {/* KPI summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Fee Collection Rate', fee ? `${Math.round((fee.totalCollected/fee.totalAssigned)*100)||0}%` : '—', 'text-emerald-500'],
          ['Event Fill Rate', event && event.eventParticipation?.length ? `${Math.round(event.eventParticipation.reduce((a,e)=>a+(e.registered/e.capacity),0)/event.eventParticipation.length*100)||0}%` : '—', 'text-blue-500'],
          ['Approval Rate', event ? `${event.statusCount.approved+event.statusCount.rejected > 0 ? Math.round(event.statusCount.approved/(event.statusCount.approved+event.statusCount.rejected)*100) : 0}%` : '—', 'text-purple-500'],
          ['Active Students', students ? `${Math.round((students.activeStudents/students.totalStudents)*100)||0}%` : '—', 'text-amber-500'],
        ].map(([l,v,c]) => (
          <div key={l} className="dashboard-card text-center">
            <div className={`font-display font-bold text-3xl ${c}`}>{v}</div>
            <div className="text-slate-500 text-sm mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fee chart */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Fee Collection Overview</h3>
          <Bar data={feeBarData} options={{ ...chartOpts, plugins: { legend: { display: false } } }}/>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[['Total Assigned',fee?.totalAssigned,'text-slate-600 dark:text-slate-400'],['Collected',fee?.totalCollected,'text-emerald-600 dark:text-emerald-400'],['Pending',fee?.totalPending,'text-red-600 dark:text-red-400']].map(([l,v,c])=>(
              <div key={l} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div className={`font-bold text-sm ${c}`}>₹{(v/1000).toFixed(0)}K</div>
                <div className="text-slate-400 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dept distribution */}
        <div className="dashboard-card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Student Distribution</h3>
          <div className="h-56">
            <Doughnut data={deptData} options={{ maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ boxWidth:12, font:{ size:11 } } } } }}/>
          </div>
        </div>

        {/* Attendance trend */}
        <div className="dashboard-card lg:col-span-2">
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Monthly Attendance Trend</h3>
          <Line data={attLineData} options={{ responsive:true, plugins:{ legend:{ position:'top' } }, scales:{ x:{ grid:{ display:false } } } }}/>
        </div>

        {/* Event participation */}
        {event?.eventParticipation?.length > 0 && (
          <div className="dashboard-card lg:col-span-2">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Event Participation</h3>
            <Bar data={evtBarData} options={{ responsive:true, plugins:{ legend:{ position:'top' } }, scales:{ x:{ grid:{ display:false } } } }}/>
          </div>
        )}
      </div>
    </div>
  );
}
