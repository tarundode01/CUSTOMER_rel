const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  stage: {
    type: String,
    enum: ['Lead', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
    default: 'Lead'
  },
  closingDate: Date,
  assignedSales: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);

