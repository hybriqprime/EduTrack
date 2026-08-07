const express = require('express');
const PDFDocument = require('pdfkit');
const Result = require('../models/Result');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/results  (teacher, admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/results/class/:className?term=&session=  (teacher, admin)
// Returns all results for a class/term, ranked by average (position computed on the fly)
router.get('/class/:className', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { term, session } = req.query;
    const results = await Result.find({
      className: req.params.className,
      term,
      session,
    })
      .populate('student', 'firstName lastName admissionNumber')
      .sort({ average: -1 });

    // Assign position based on sorted average
    const ranked = results.map((r, index) => ({
      ...r.toObject(),
      position: index + 1,
    }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/results/student/:studentId  (admin, teacher, or the linked parent)
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (req.user.role === 'parent' && String(student.parent) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    if (req.user.role === 'student' && String(req.user.studentProfile) !== String(student._id)) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    const results = await Result.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/results/:id/pdf  (generates a printable result sheet)
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate('student');
    if (!result) return res.status(404).json({ message: 'Result not found' });

    if (
      req.user.role === 'parent' &&
      String(result.student.parent) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    if (
      req.user.role === 'student' &&
      String(req.user.studentProfile) !== String(result.student._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=result-${result.student.admissionNumber}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(18).text('EduTrack', { align: 'center' });
    doc.fontSize(12).text('Student Result Sheet', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Student: ${result.student.firstName} ${result.student.lastName}`);
    doc.text(`Admission No: ${result.student.admissionNumber}`);
    doc.text(`Class: ${result.className}`);
    doc.text(`Term: ${result.term}   Session: ${result.session}`);
    doc.moveDown();

    doc.fontSize(12).text('Subject Scores', { underline: true });
    doc.moveDown(0.5);
    result.subjects.forEach((s) => {
      doc.fontSize(11).text(`${s.subject}: ${s.score}`);
    });

    doc.moveDown();
    doc.fontSize(12).text(`Average: ${result.average}`, { underline: true });
    if (result.position) doc.text(`Position in Class: ${result.position}`);
    if (result.teacherComment) {
      doc.moveDown();
      doc.text(`Teacher's Comment: ${result.teacherComment}`);
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;