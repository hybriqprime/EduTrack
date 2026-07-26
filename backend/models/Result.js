const mongoose = require('mongoose');

const subjectScoreSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    className: { type: String, required: true },
    term: { type: String, enum: ['First Term', 'Second Term', 'Third Term'], required: true },
    session: { type: String, required: true }, // e.g. "2025/2026"
    subjects: { type: [subjectScoreSchema], required: true },
    average: { type: Number }, // computed before save
    position: { type: Number }, // computed after all results for the class/term are in
    teacherComment: { type: String },
  },
  { timestamps: true }
);

// Auto-compute average whenever subjects change
resultSchema.pre('save', function (next) {
  if (this.subjects && this.subjects.length > 0) {
    const total = this.subjects.reduce((sum, s) => sum + s.score, 0);
    this.average = Math.round((total / this.subjects.length) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
