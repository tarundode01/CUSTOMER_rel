const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meetingType: {
    type: String,
    enum: ['Online (Google Meet/Zoom)', 'In-Person (Office)'],
    default: 'Online (Google Meet/Zoom)'
  },
  subject: {
    type: String,
    required: true
  },
  preferredDate: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Confirmation', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'],
    default: 'Confirmed'
  },
  joinLink: {
    type: String,
    default: 'https://meet.google.com/crm-client-sync'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);

