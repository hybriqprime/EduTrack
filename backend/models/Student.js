const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    admissionNumber: { type: String, required: true, unique: true },
    className: { type: String, required: true }, // e.g. "JSS 1", "Primary 4"
    gender: { type: String, enum: ['male', 'female'] },
    dateOfBirth: { type: Date },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
