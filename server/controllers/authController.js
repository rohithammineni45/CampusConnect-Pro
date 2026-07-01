const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const { generateToken } = require('../middleware/authMiddleware');

// @desc  Register student
// @route POST /api/auth/student/register
const registerStudent = async (req, res) => {
  try {
    const { fullName, rollNumber, registerNumber, department, year, section,
      dob, gender, email, mobile, parentName, parentMobile, address, password } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }, { registerNumber }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email, roll number, or register number already exists' });
    }

    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : '';

    const student = await Student.create({
      fullName, rollNumber, registerNumber, department, year: Number(year), section,
      dob, gender, email, mobile, parentName, parentMobile, address, password, profilePhoto
    });

    // Auto-create fee record
    await Fee.create({ studentId: student._id, totalFee: 75000, pendingAmount: 75000, dueDate: new Date(Date.now() + 30*24*60*60*1000), academicYear: '2024-25' });

    // Welcome notification
    await Notification.create({
      recipientId: student._id, recipientType: 'student',
      title: 'Welcome to CampusConnect Pro!',
      message: `Welcome ${fullName}! Your account has been created successfully.`,
      type: 'announcement'
    });

    const token = generateToken(student._id, 'student');
    res.status(201).json({
      token, role: 'student',
      student: { _id: student._id, fullName: student.fullName, email: student.email, department: student.department, profilePhoto: student.profilePhoto }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login student
// @route POST /api/auth/student/login
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ message: 'Invalid email or password' });
    if (!student.isActive) return res.status(403).json({ message: 'Account suspended. Contact admin.' });

    const isMatch = await student.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(student._id, 'student');
    res.json({
      token, role: 'student',
      student: { _id: student._id, fullName: student.fullName, email: student.email, department: student.department, rollNumber: student.rollNumber, profilePhoto: student.profilePhoto }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login admin
// @route POST /api/auth/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(admin._id, 'admin');
    res.json({
      token, role: 'admin',
      admin: { _id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerStudent, loginStudent, loginAdmin };
