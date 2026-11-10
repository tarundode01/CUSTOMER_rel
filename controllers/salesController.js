const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const Meeting = require('../models/Meeting');
const Quotation = require('../models/Quotation');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_crm_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// 1. Sales Agent Login
exports.loginSales = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'sales' });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Sales credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Sales credentials' });
    }

    res.json({
      success: true,
      message: 'Sales Agent logged in',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Sales Assigned Leads & Enquiries
exports.getMyAssignedEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('customerId', 'name email phone company')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Update Lead Status & Add Follow-up Note
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status, note, title } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) enquiry.status = status;
    if (note) {
      enquiry.timeline.push({
        status: status || enquiry.status,
        title: title || `Status updated to ${status}`,
        note: note,
        timestamp: new Date()
      });
    }

    await enquiry.save();
    res.json({ success: true, message: 'Lead status & timeline updated', data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Create Quotation for Customer
exports.createQuotationForCustomer = async (req, res) => {
  try {
    const { customerId, title, subTotal, taxGst, totalAmount, items, validUntil } = req.body;
    const quotation = await Quotation.create({
      customerId,
      title,
      subTotal,
      taxGst,
      totalAmount,
      items,
      validUntil
    });

    res.status(201).json({ success: true, message: 'Quotation dispatched to Customer', data: quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

