const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/students  (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/students  (admin, teacher — full list)
router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const filter = req.query.className ? { className: req.query.className } : {};
    const students = await Student.find(filter).populate('parent', 'name email');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/students/my-children  (parent — only their linked kids)
router.get('/my-children', protect, authorize('parent'), async (req, res) => {
  try {
    const students = await Student.find({ parent: req.user._id });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/students/my-profile  (student — their own record)
router.get('/my-profile', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentProfile);
    if (!student) return res.status(404).json({ message: 'Student profile not linked' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('parent', 'name email');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Parents can only view their own child
    if (req.user.role === 'parent' && String(student.parent) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this student' });
    }

    // Students can only view their own profile
    if (req.user.role === 'student' && String(req.user.studentProfile) !== String(student._id)) {
      return res.status(403).json({ message: 'Not authorized to view this student' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/students/:id  (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/students/:id  (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/students/:id/create-login  (admin only)
// Creates a login account for an existing student, linked via studentProfile
router.post('/:id/create-login', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name: `${student.firstName} ${student.lastName}`,
      email,
      password,
      role: 'student',
      studentProfile: student._id,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentProfile: user.studentProfile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;