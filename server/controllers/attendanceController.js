const Attendance = require('../models/Attendance');

// @desc  Add attendance (Admin)
const addAttendance = async (req, res) => {
  try {
    const { studentId, subject, date, status } = req.body;
    // Check for duplicate
    const existing = await Attendance.findOne({ studentId, subject, date: new Date(date) });
    if (existing) {
      existing.status = status;
      await existing.save();
      return res.json({ message: 'Attendance updated', attendance: existing });
    }
    const attendance = await Attendance.create({ studentId, subject, date, status });
    res.status(201).json(attendance);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Add bulk attendance
const addBulkAttendance = async (req, res) => {
  try {
    const { records } = req.body; // [{studentId, subject, date, status}]
    const results = [];
    for (const record of records) {
      const existing = await Attendance.findOne({ studentId: record.studentId, subject: record.subject, date: new Date(record.date) });
      if (existing) { existing.status = record.status; await existing.save(); results.push(existing); }
      else { const att = await Attendance.create(record); results.push(att); }
    }
    res.json({ message: `${results.length} attendance records processed`, results });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Get attendance for a student
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, month, year } = req.query;
    let filter = { studentId };
    if (subject) filter.subject = subject;
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const records = await Attendance.find(filter).sort({ date: -1 });

    // Calculate overall stats
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    // Subject-wise
    const subjects = [...new Set(records.map(r => r.subject))];
    const subjectWise = subjects.map(sub => {
      const subRecords = records.filter(r => r.subject === sub);
      const subPresent = subRecords.filter(r => r.status === 'present').length;
      return { subject: sub, total: subRecords.length, present: subPresent, percentage: subRecords.length > 0 ? Math.round((subPresent / subRecords.length) * 100) : 0 };
    });

    // Monthly
    const monthlyMap = {};
    records.forEach(r => {
      const key = `${r.year}-${r.month}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: r.month, year: r.year, total: 0, present: 0 };
      monthlyMap[key].total++;
      if (r.status === 'present') monthlyMap[key].present++;
    });
    const monthly = Object.values(monthlyMap).sort((a, b) => a.year - b.year || a.month - b.month);

    res.json({ records, total, present, absent: total - present, percentage, subjectWise, monthly });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Get all attendance (Admin)
const getAllAttendance = async (req, res) => {
  try {
    const { department, subject, date } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (date) filter.date = new Date(date);
    const records = await Attendance.find(filter).populate('studentId', 'fullName rollNumber department year section').sort({ date: -1 });
    res.json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Update attendance
const updateAttendance = async (req, res) => {
  try {
    const att = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!att) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(att);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Delete attendance
const deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance record deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Attendance analytics
const getAttendanceAnalytics = async (req, res) => {
  try {
    const overall = await Attendance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const monthly = await Attendance.aggregate([
      { $group: { _id: { month: '$month', year: '$year', status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({ overall, monthly });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { addAttendance, addBulkAttendance, getStudentAttendance, getAllAttendance, updateAttendance, deleteAttendance, getAttendanceAnalytics };
