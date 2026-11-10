const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  docName: {
    type: String,
    required: true
  },
  docType: {
    type: String,
    enum: ['Quotation', 'Invoice', 'Agreement', 'Identity/GST', 'Attachment'],
    default: 'Attachment'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: String
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);

