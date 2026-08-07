const express = require('express');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/fees  (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/fees?term=&session=&status=  (admin only — full dashboard)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { term, session, status } = req.query;
    const filter = {};
    if (term) filter.term = term;
    if (session) filter.session = session;
    if (status) filter.status = status;

    const fees = await Fee.find(filter).populate('student', 'firstName lastName admissionNumber className');
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/fees/defaulters?term=&session=  (admin only — quick defaulter list)
router.get('/defaulters', protect, authorize('admin'), async (req, res) => {
  try {
    const { term, session } = req.query;
    const filter = { status: { $in: ['unpaid', 'partial'] } };
    if (term) filter.term = term;
    if (session) filter.session = session;

    const defaulters = await Fee.find(filter).populate(
      'student',
      'firstName lastName admissionNumber className'
    );
    res.json(defaulters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/fees/student/:studentId  (admin, or the linked parent)
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (req.user.role === 'parent' && String(student.parent) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this record' });
    }

    if (req.user.role === 'student' && String(req.user.studentProfile) !== String(student._id)) {
      return res.status(403).json({ message: 'Not authorized to view this record' });
    }

    const fees = await Fee.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/fees/:id  (admin only — record a payment)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });

    if (req.body.amountPaid !== undefined) fee.amountPaid = req.body.amountPaid;
    if (req.body.amountDue !== undefined) fee.amountDue = req.body.amountDue;
    if (req.body.dueDate !== undefined) fee.dueDate = req.body.dueDate;

    await fee.save(); // pre-save hook recalculates status
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;