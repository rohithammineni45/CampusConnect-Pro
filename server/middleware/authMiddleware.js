const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else {
        req.user = await Student.findById(decoded.id).select('-password');
      }

      if (!req.user) return res.status(401).json({ message: 'User not found' });
      req.user.role = decoded.role;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Student access required' });
  }
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = { protect, adminOnly, studentOnly, generateToken };
