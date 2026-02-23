const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    required: true,
    enum: ['personal', 'business', 'education', 'emergency'],
    default: 'personal'
  },
  principal: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'paid', 'overdue'],
    default: 'active'
  },
  interestRate: {
    type: Number,
    default: 0
  },
  termMonths: {
    type: Number,
    default: 12
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
loanSchema.index({ member: 1, status: 1 });
loanSchema.index({ society: 1 });

module.exports = mongoose.model('Loan', loanSchema);
