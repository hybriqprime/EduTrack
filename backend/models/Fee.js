const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    term: { type: String, enum: ['First Term', 'Second Term', 'Third Term'], required: true },
    session: { type: String, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'unpaid',
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Auto-set status based on payment amounts
feeSchema.pre('save', function (next) {
  if (this.amountPaid <= 0) this.status = 'unpaid';
  else if (this.amountPaid >= this.amountDue) this.status = 'paid';
  else this.status = 'partial';
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
