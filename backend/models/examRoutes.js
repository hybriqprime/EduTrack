const express = require('express');
const Exam = require('../models/Exam');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/exams  (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/exams/class/:className?term=&session=  (any logged-in role)
router.get('/class/:className', protect, async (req, res) => {
  try {
    const { term, session } = req.query;
    const filter = { className: req.params.className };
    if (term) filter.term = term;
    if (session) filter.session = session;

    const exams = await Exam.find(filter).sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/exams/my-schedule?term=&session=  (student — their own class's exams)
router.get('/my-schedule', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentProfile);
    if (!student) return res.status(404).json({ message: 'Student profile not linked' });

    const { term, session } = req.query;
    const filter = { className: student.className };
    if (term) filter.term = term;
    if (session) filter.session = session;

    const exams = await Exam.find(filter).sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/exams/:id  (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/exams/:id  (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;