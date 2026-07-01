import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentFee, payFee } from '../../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiCreditCard } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Fees() {
  const { user } = useAuth();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Online Transfer');
  const [paying, setPaying] = useState(false);

  const load = () => {
    if (!user?._id) return;
    getStudentFee(user._id).then(res => { setFee(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const handlePay = async () => {
    if (!payAmount || Number(payAmount) <= 0) return toast.error('Enter valid amount');
    if (Number(payAmount) > fee.pendingAmount) return toast.error('Amount exceeds pending fee');
    setPaying(true);
    try {
      const res = await payFee(user._id, { amount: Number(payAmount), method: payMethod });
      setFee(res.data.fee);
      setPayModal(false); setPayAmount('');
      toast.success('Payment successful!');
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    setPaying(false);
  };

  const downloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(59, 130, 246);
    doc.text('CampusConnect Pro', 14, 20);
    doc.setFontSize(14); doc.setTextColor(0, 0, 0);
    doc.text('Fee Receipt', 14, 32);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100);
    doc.text(`Student: ${user?.fullName}`, 14, 45);
    doc.text(`Roll No: ${user?.rollNumber}`, 14, 52);
    doc.text(`Department: ${user?.department}`, 14, 59);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 66);

    autoTable(doc, {
      startY: 75,
      head: [['Date', 'Amount', 'Method', 'Transaction ID', 'Status']],
      body: (fee?.paymentHistory || []).map(p => [
        new Date(p.date).toLocaleDateString('en-IN'), `₹${p.amount?.toLocaleString()}`, p.method, p.transactionId, p.status
      ]),
      headStyles: { fillColor: [59, 130, 246] },
    });

    const finalY = doc.lastAutoTable?.finalY || 100;
    doc.setFontSize(11);
    doc.text(`Total Fee: ₹${fee?.totalFee?.toLocaleString()}`, 14, finalY + 15);
    doc.text(`Paid: ₹${fee?.paidAmount?.toLocaleString()}`, 14, finalY + 22);
    doc.setTextColor(239, 68, 68);
    doc.text(`Pending: ₹${fee?.pendingAmount?.toLocaleString()}`, 14, finalY + 29);
    doc.save(`Fee_Receipt_${user?.rollNumber}.pdf`);
    toast.success('Receipt downloaded!');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="loader" /></div>;

  const pct = fee ? Math.round((fee.paidAmount / fee.totalFee) * 100) || 0 : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          ['Total Fee', fee?.totalFee, 'from-blue-500 to-blue-600', '💰'],
          ['Paid Amount', fee?.paidAmount, 'from-emerald-500 to-emerald-600', '✅'],
          ['Pending Amount', fee?.pendingAmount, 'from-red-500 to-red-600', '⏳'],
        ].map(([l, v, g, ico]) => (
          <div key={l} className={`bg-gradient-to-br ${g} rounded-2xl p-5 text-white`}>
            <div className="text-3xl mb-2">{ico}</div>
            <div className="font-display font-bold text-2xl">₹{v?.toLocaleString()}</div>
            <div className="text-white/70 text-sm mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white">Fee Payment Progress</h3>
            <p className="text-slate-400 text-sm">Academic Year: {fee?.academicYear}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadReceipt} className="btn-secondary text-sm flex items-center gap-2 dark:border-slate-600 dark:text-white">
              <FiDownload size={14} /> Receipt
            </button>
            {fee?.pendingAmount > 0 && (
              <button onClick={() => setPayModal(true)} className="btn-primary text-sm flex items-center gap-2">
                <FiCreditCard size={14} /> Pay Now
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-4 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300 text-sm w-12 text-right">{pct}%</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Paid: ₹{fee?.paidAmount?.toLocaleString()}</span>
          <span>Due: {fee?.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '—'}</span>
        </div>
        <div className="mt-3">
          <span className={`badge ${fee?.status === 'paid' ? 'badge-success' : fee?.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
            {fee?.status === 'paid' ? '✅ Fully Paid' : fee?.status === 'partial' ? '⚡ Partial Payment' : '⏳ Pending'}
          </span>
        </div>
      </div>

      {/* Payment history */}
      <div className="dashboard-card overflow-hidden">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Payment History</h3>
        {!fee?.paymentHistory?.length ? (
          <div className="text-center py-10 text-slate-400">No payments made yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{['Date', 'Amount', 'Method', 'Transaction ID', 'Status'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {fee.paymentHistory.map((p, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                    <td className="table-cell font-semibold text-emerald-600 dark:text-emerald-400">₹{p.amount?.toLocaleString()}</td>
                    <td className="table-cell">{p.method}</td>
                    <td className="table-cell font-mono text-xs">{p.transactionId}</td>
                    <td className="table-cell"><span className="badge badge-success">✓ {p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-premium">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-4">💳 Pay Fee</h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Amount (Pending: ₹{fee.pendingAmount?.toLocaleString()})</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  max={fee.pendingAmount} placeholder={`Max ₹${fee.pendingAmount}`} className="input-field" />
              </div>
              <div>
                <label className="label-field">Payment Method</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="input-field">
                  {['Online Transfer', 'UPI', 'Net Banking', 'Credit Card', 'Debit Card'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setPayModal(false)} className="btn-secondary flex-1 dark:border-slate-600 dark:text-white">Cancel</button>
              <button onClick={handlePay} disabled={paying} className="btn-success flex-1 disabled:opacity-60">
                {paying ? 'Processing...' : '✅ Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
