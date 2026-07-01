import { useState, useEffect } from 'react';
import { getAllStudents, getAllFees, getAllRegistrations } from '../../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');

  useEffect(() => {
    Promise.all([
      getAllStudents().catch(()=>null),
      getAllFees().catch(()=>null),
      getAllRegistrations().catch(()=>null),
    ]).then(([s,f,r]) => {
      setStudents(s?.data||[]); setFees(f?.data||[]); setRegs(r?.data||[]);
      setLoading(false);
    });
  }, []);

  const pdfHeader = (doc, title) => {
    doc.setFillColor(59, 130, 246); doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(16); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold');
    doc.text('CampusConnect Pro', 14, 12);
    doc.setFontSize(11); doc.setFont(undefined, 'normal');
    doc.text(title, 14, 22);
    doc.setTextColor(0,0,0);
    doc.setFontSize(9); doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 140, 8);
    doc.text(`Total Records: `, 140, 15);
  };

  const downloadStudentPDF = () => {
    setGenerating('studentPDF');
    const doc = new jsPDF();
    pdfHeader(doc, 'Student Report');
    autoTable(doc, {
      startY: 35,
      head: [['Name','Roll No.','Dept','Year','Email','Status']],
      body: students.map(s=>[s.fullName, s.rollNumber, s.department, `Year ${s.year}`, s.email, s.isActive?'Active':'Suspended']),
      headStyles: { fillColor:[59,130,246] }, alternateRowStyles: { fillColor:[248,250,252] }, styles: { fontSize:8 }
    });
    doc.save('Student_Report.pdf');
    toast.success('Student report downloaded!');
    setGenerating('');
  };

  const downloadFeePDF = () => {
    setGenerating('feePDF');
    const doc = new jsPDF();
    pdfHeader(doc, 'Fee Management Report');
    autoTable(doc, {
      startY: 35,
      head: [['Student','Dept','Total Fee','Paid','Pending','Status']],
      body: fees.map(f=>[f.studentId?.fullName||'—', f.studentId?.department||'—', `₹${f.totalFee?.toLocaleString()}`, `₹${f.paidAmount?.toLocaleString()}`, `₹${f.pendingAmount?.toLocaleString()}`, f.status]),
      headStyles: { fillColor:[16,185,129] }, styles: { fontSize:8 }
    });
    const total = fees.reduce((a,f)=>a+f.paidAmount,0);
    const pending = fees.reduce((a,f)=>a+f.pendingAmount,0);
    const y = doc.lastAutoTable?.finalY||40;
    doc.setFontSize(10); doc.text(`Total Collected: ₹${total.toLocaleString()}`, 14, y+15);
    doc.text(`Total Pending: ₹${pending.toLocaleString()}`, 14, y+22);
    doc.save('Fee_Report.pdf');
    toast.success('Fee report downloaded!');
    setGenerating('');
  };

  const downloadEventPDF = () => {
    setGenerating('eventPDF');
    const doc = new jsPDF();
    pdfHeader(doc, 'Event Registration Report');
    autoTable(doc, {
      startY: 35,
      head: [['Student','Roll No.','Event','Registered Date','Status']],
      body: regs.map(r=>[r.studentId?.fullName||'—', r.studentId?.rollNumber||'—', r.eventId?.title||'—', new Date(r.registeredAt).toLocaleDateString('en-IN'), r.status]),
      headStyles: { fillColor:[139,92,246] }, styles: { fontSize:8 }
    });
    doc.save('Event_Registration_Report.pdf');
    toast.success('Event report downloaded!');
    setGenerating('');
  };

  const downloadStudentExcel = () => {
    setGenerating('studentXL');
    const data = students.map(s=>({ 'Full Name':s.fullName, 'Roll Number':s.rollNumber, 'Register Number':s.registerNumber, 'Department':s.department, 'Year':s.year, 'Section':s.section, 'Email':s.email, 'Mobile':s.mobile, 'Gender':s.gender, 'Status':s.isActive?'Active':'Suspended' }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'Student_Report.xlsx');
    toast.success('Excel downloaded!');
    setGenerating('');
  };

  const downloadFeeExcel = () => {
    setGenerating('feeXL');
    const data = fees.map(f=>({ 'Student':f.studentId?.fullName, 'Roll No':f.studentId?.rollNumber, 'Department':f.studentId?.department, 'Total Fee':f.totalFee, 'Paid':f.paidAmount, 'Pending':f.pendingAmount, 'Status':f.status, 'Due Date':f.dueDate?new Date(f.dueDate).toLocaleDateString('en-IN'):'—' }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fees');
    XLSX.writeFile(wb, 'Fee_Report.xlsx');
    toast.success('Excel downloaded!');
    setGenerating('');
  };

  const reportCards = [
    { title: 'Student Report', desc: `${students.length} students`, icon: '👥', pdfFn: downloadStudentPDF, xlFn: downloadStudentExcel, pdfKey: 'studentPDF', xlKey: 'studentXL', color: 'from-blue-500 to-blue-600' },
    { title: 'Fee Report', desc: `${fees.length} records`, icon: '💰', pdfFn: downloadFeePDF, xlFn: downloadFeeExcel, pdfKey: 'feePDF', xlKey: 'feeXL', color: 'from-emerald-500 to-emerald-600' },
    { title: 'Event Report', desc: `${regs.length} registrations`, icon: '🎪', pdfFn: downloadEventPDF, xlFn: null, pdfKey: 'eventPDF', xlKey: null, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display font-bold text-slate-900 dark:text-white text-xl">Reports & Exports</h2>

      {loading ? <div className="flex justify-center py-20"><div className="loader"/></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((r, i) => (
            <div key={i} className="dashboard-card">
              <div className={`w-12 h-12 bg-gradient-to-br ${r.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>{r.icon}</div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-1">{r.title}</h3>
              <p className="text-slate-400 text-sm mb-5">{r.desc} available for export</p>
              <div className="space-y-2">
                <button onClick={r.pdfFn} disabled={generating===r.pdfKey}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                  <FiDownload size={14}/> {generating===r.pdfKey ? 'Generating...' : 'Download PDF'}
                </button>
                {r.xlFn && (
                  <button onClick={r.xlFn} disabled={generating===r.xlKey}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm dark:border-slate-600 dark:text-white disabled:opacity-60">
                    <FiFileText size={14}/> {generating===r.xlKey ? 'Generating...' : 'Download Excel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data preview */}
      <div className="dashboard-card">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Quick Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ['Total Students', students.length, 'Active: '+students.filter(s=>s.isActive).length],
            ['Total Fee Records', fees.length, `Collected: ₹${(fees.reduce((a,f)=>a+f.paidAmount,0)/100000).toFixed(1)}L`],
            ['Event Registrations', regs.length, `Approved: ${regs.filter(r=>r.status==='approved').length}`],
          ].map(([l,v,sub])=>(
            <div key={l} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              <div className="font-display font-bold text-2xl text-slate-900 dark:text-white">{v}</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{l}</div>
              <div className="text-slate-400 text-xs mt-1">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
