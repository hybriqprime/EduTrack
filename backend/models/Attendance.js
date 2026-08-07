const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/attendance  (teacher, admin — mark a single student)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const record = await Attendance.create({ ...req.body, markedBy: req.user._id });
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Attendance already recorded for this student on this date' });
    }
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/attendance/bulk  (teacher, admin — mark a whole class at once)
// Body: { className, date, records: [{ student, status }, ...] }
router.post('/bulk', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { className, date, records } = req.body;
    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.student, date: new Date(date) },
        update: {
          $set: {
            student: r.student,
            className,
            date: new Date(date),
            status: r.status,
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ message: `Attendance recorded for ${records.length} students` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/attendance/class/:className?date=  (teacher, admin)
router.get('/class/:className', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const filter = { className: req.params.className };
    if (req.query.date) {
      const day = new Date(req.query.date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      filter.date = { $gte: day, $lt: nextDay };
    }
    const records = await Attendance.find(filter).populate('student', 'firstName lastName admissionNumber');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/attendance/student/:studentId  (admin, teacher, linked parent, or the student themself)
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

    const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;