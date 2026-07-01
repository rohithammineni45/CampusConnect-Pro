const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, unique: true },
  registerNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  section: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobile: { type: String, required: true },
  parentName: { type: String, required: true },
  parentMobile: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  profilePhoto: { type: String, default: '' },
  role: { type: String, default: 'student' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
