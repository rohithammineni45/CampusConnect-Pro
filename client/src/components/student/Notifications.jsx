import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/api';
import toast from 'react-hot-toast';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

const icons = { event: '🎪', fee: '💰', attendance: '📅', announcement: '📢', approval: '✅' };
const colors = {
  event: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30',
  fee: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30',
  attendance: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30',
  announcement: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30',
  approval: 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800/30',
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getNotifications().then(res => {
      setNotifs(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    await markAsRead(id);
    load();
  };

  const handleReadAll = async () => {
    await markAllAsRead();
    toast.success('All marked as read');
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="loader" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl">Notifications</h2>
          <p className="text-slate-400 text-sm">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <button onClick={handleReadAll} className="btn-secondary text-sm flex items-center gap-2 dark:border-slate-600 dark:text-white">
            <FiCheckCircle size={14} /> Mark All Read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-20">
          <FiBell size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <div className="text-slate-400">No notifications yet</div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n, i) => (
            <div key={i} onClick={() => !n.isRead && handleRead(n._id)}
              className={`p-4 rounded-2xl border flex items-start gap-4 transition-all cursor-pointer hover:shadow-card ${n.isRead ? 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50' : (colors[n.type] || colors.announcement)}`}>
              <div className="text-2xl flex-shrink-0 mt-0.5">{icons[n.type] || '📢'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                  {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{n.message}</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <span className={`badge capitalize flex-shrink-0 ${n.type === 'fee' ? 'badge-success' : n.type === 'attendance' ? 'badge-warning' : 'badge-info'}`}>{n.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
