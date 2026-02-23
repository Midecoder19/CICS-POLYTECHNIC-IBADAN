const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactionType: {
    type: String,
    enum: ['loan_disbursement', 'loan_payment', 'contribution', 'withdrawal', 'interest'],
    required: true
  },
  reference: {
    type: String,
    trim: true
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
ledgerSchema.index({ member: 1, date: -1 });
ledgerSchema.index({ society: 1, date: -1 });
ledgerSchema.index({ member: 1, transactionType: 1 });

module.exports = mongoose.model('Ledger', ledgerSchema);
