const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    className: { type: String, required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true,
    },
    period: { type: String, required: true }, // e.g. "8:00 - 8:45"
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Prevent double-booking the same class/day/period
timetableSchema.index({ className: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);