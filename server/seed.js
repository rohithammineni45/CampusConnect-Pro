require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Event = require('./models/Event');
const Fee = require('./models/Fee');
const Attendance = require('./models/Attendance');
const Notification = require('./models/Notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Create admin
    const existingAdmin = await Admin.findOne({ email: 'admin@campus.com' });
    if (!existingAdmin) {
      await Admin.create({ name: 'Super Admin', email: 'admin@campus.com', password: 'Admin@123' });
      console.log('✅ Admin created: admin@campus.com / Admin@123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create demo student
    const existingStudent = await Student.findOne({ email: 'student@campus.com' });
    let student;
    if (!existingStudent) {
      student = await Student.create({
        fullName: 'Arjun Sharma', rollNumber: '22CS001', registerNumber: '22UCS001',
        department: 'Computer Science', year: 3, section: 'A',
        dob: new Date('2003-05-15'), gender: 'Male', email: 'student@campus.com',
        mobile: '9876543210', parentName: 'Ramesh Sharma', parentMobile: '9876543211',
        address: '123 College Road, Chennai, TN 600001', password: 'Student@123',
      });
      console.log('✅ Student created: student@campus.com / Student@123');
    } else {
      student = existingStudent;
      console.log('ℹ️  Demo student already exists');
    }

    // Create fee for student
    const existingFee = await Fee.findOne({ studentId: student._id });
    if (!existingFee) {
      await Fee.create({
        studentId: student._id, totalFee: 75000, paidAmount: 25000, pendingAmount: 50000,
        dueDate: new Date('2025-03-31'), academicYear: '2024-25', status: 'partial',
        paymentHistory: [{ amount: 25000, method: 'Online', transactionId: 'TXN001', status: 'Success', date: new Date('2024-08-01') }]
      });
      console.log('✅ Fee record created');
    }

    // Create sample events
    const admin = await Admin.findOne({ email: 'admin@campus.com' });
    const eventsCount = await Event.countDocuments();
    if (eventsCount === 0) {
      await Event.insertMany([
        { title: 'Annual Tech Fest 2025', description: 'A grand celebration of technology, innovation, and creativity. Featuring hackathons, coding challenges, and tech talks.', date: new Date('2025-02-15'), time: '09:00 AM', venue: 'Main Auditorium', capacity: 500, category: 'Technical', createdBy: admin._id },
        { title: 'Cultural Night 2025', description: 'An evening of music, dance, and cultural performances by students from all departments.', date: new Date('2025-02-20'), time: '06:00 PM', venue: 'Open Air Theatre', capacity: 800, category: 'Cultural', createdBy: admin._id },
        { title: 'Sports Day', description: 'Annual inter-department sports competition with events in cricket, football, basketball, and athletics.', date: new Date('2025-03-05'), time: '08:00 AM', venue: 'Sports Ground', capacity: 400, category: 'Sports', createdBy: admin._id },
        { title: 'Guest Lecture: AI & Future', description: 'Eminent industry expert speaks about Artificial Intelligence trends and career opportunities.', date: new Date('2025-01-25'), time: '10:00 AM', venue: 'Seminar Hall A', capacity: 200, category: 'Academic', createdBy: admin._id },
        { title: 'Entrepreneurship Summit', description: 'Connect with startup founders, investors, and industry leaders. Pitch your ideas!', date: new Date('2025-03-15'), time: '09:30 AM', venue: 'Conference Hall', capacity: 300, category: 'Business', createdBy: admin._id },
      ]);
      console.log('✅ Sample events created');
    }

    // Create sample attendance
    const attCount = await Attendance.countDocuments({ studentId: student._id });
    if (attCount === 0) {
      const subjects = ['Mathematics', 'Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks'];
      const records = [];
      for (let month = 8; month <= 12; month++) {
        for (const subject of subjects) {
          for (let day = 1; day <= 20; day++) {
            const date = new Date(2024, month - 1, day);
            if (date.getDay() !== 0 && date.getDay() !== 6) {
              records.push({ studentId: student._id, subject, date, status: Math.random() > 0.2 ? 'present' : 'absent', month, year: 2024 });
            }
          }
        }
      }
      await Attendance.insertMany(records);
      console.log(`✅ ${records.length} attendance records created`);
    }

    // Welcome notification
    const notifCount = await Notification.countDocuments({ recipientId: student._id });
    if (notifCount === 0) {
      await Notification.insertMany([
        { recipientId: student._id, recipientType: 'student', title: 'Welcome to CampusConnect Pro!', message: 'Your account has been set up. Explore your dashboard to get started.', type: 'announcement' },
        { recipientId: student._id, recipientType: 'student', title: 'Fee Reminder', message: 'Your semester fee of ₹50,000 is pending. Due date: March 31, 2025.', type: 'fee' },
        { recipientId: student._id, recipientType: 'student', title: 'Attendance Alert', message: 'Your attendance in Mathematics is below 75%. Please attend classes regularly.', type: 'attendance' },
      ]);
      console.log('✅ Sample notifications created');
    }

    console.log('\n🎓 CampusConnect Pro seeded successfully!');
    console.log('📧 Admin: admin@campus.com | Password: Admin@123');
    console.log('📧 Student: student@campus.com | Password: Student@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seed();
