const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enquiryId: {
    type: String,
    unique: true
  },
  productService: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    default: 'Flexible'
  },
  preferredContactTime: {
    type: String,
    default: 'Anytime'
  },
  status: {
    type: String,
    enum: [
      'Submitted',
      'Received',
      'Under Review',
      'Contacted',
      'In Discussion',
      'Proposal Sent',
      'Negotiation',
      'Converted',
      'Closed',
      'Cancelled'
    ],
    default: 'Submitted'
  },
  assignedSales: {
    name: { type: String, default: 'Vikram Malhotra' },
    phone: { type: String, default: '+91 98112 34567' },
    email: { type: String, default: 'sales@crm.com' }
  },
  timeline: [
    {
      status: String,
      title: String,
      note: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  attachments: [String]
}, { timestamps: true });

enquirySchema.pre('save', function (next) {
  if (!this.enquiryId) {
    this.enquiryId = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  if (this.timeline.length === 0) {
    this.timeline.push({
      status: 'Submitted',
      title: 'Enquiry Submitted',
      note: 'Your enquiry has been received and queued for review.'
    });
  }
  next();
});

module.exports = mongoose.model('Enquiry', enquirySchema);

