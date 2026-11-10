const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['enquiry', 'ticket', 'meeting', 'quotation', 'invoice', 'system'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  linkId: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

