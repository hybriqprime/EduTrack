const express = require('express');
const Student = require('../models/Student');
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

// @route GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('parent', 'name email');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Parents can only view their own child
    if (req.user.role === 'parent' && String(student.parent) !== String(req.user._id)) {
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

module.exports = router;
