const Student = require('../models/Student');
const Fee = require('../models/Fee');

// @desc  Get all students (Admin)
const getAllStudents = async (req, res) => {
  try {
    const { department, year, search, isActive } = req.query;
    let filter = {};
    if (department) filter.department = department;
    if (year) filter.year = Number(year);
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }
    const students = await Student.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Get single student
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Update student
const updateStudent = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (req.file) updateData.profilePhoto = `/uploads/${req.file.filename}`;

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Change student password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isMatch = await student.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    student.password = newPassword;
    await student.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Delete student (Admin)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Suspend / Activate student
const toggleSuspend = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ message: `Student ${student.isActive ? 'activated' : 'suspended'} successfully`, isActive: student.isActive });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Add student (Admin)
const addStudent = async (req, res) => {
  try {
    const { email, rollNumber, registerNumber } = req.body;
    const existing = await Student.findOne({ $or: [{ email }, { rollNumber }, { registerNumber }] });
    if (existing) return res.status(400).json({ message: 'Student already exists with given email/roll/register number' });

    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : '';
    const student = await Student.create({ ...req.body, profilePhoto, year: Number(req.body.year) });
    await Fee.create({ studentId: student._id, totalFee: 75000, pendingAmount: 75000, dueDate: new Date(Date.now() + 30*24*60*60*1000), academicYear: '2024-25' });
    res.status(201).json(student);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const departments = await Student.distinct('department');
    const yearWise = await Student.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const deptWise = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    res.json({ totalStudents, activeStudents, totalDepartments: departments.length, yearWise, deptWise });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllStudents, getStudentById, updateStudent, changePassword, deleteStudent, toggleSuspend, addStudent, getDashboardStats };
