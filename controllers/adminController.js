const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const Ticket = require('../models/Ticket');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Meeting = require('../models/Meeting');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_crm_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// 1. Admin Authentication
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const admin = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
    }

    res.json({
      success: true,
      message: 'Admin logged in successfully',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
        token: generateToken(admin._id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Admin Global Analytics & Stats
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalSalesAgents = await User.countDocuments({ role: 'sales' });
    const totalEnquiries = await Enquiry.countDocuments();
    const activeEnquiries = await Enquiry.countDocuments({
      status: { $in: ['Contacted', 'In Discussion', 'Proposal Sent', 'Negotiation'] }
    });
    const convertedDeals = await Enquiry.countDocuments({ status: 'Converted' });
    const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } });

    // Financial Metrics
    const allInvoices = await Invoice.find();
    const totalRevenue = allInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pendingCollections = allInvoices
      .filter((inv) => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const recentEnquiries = await Enquiry.find()
      .populate('customerId', 'name email company phone')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTickets = await Ticket.find()
      .populate('customerId', 'name email company')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics: {
          totalCustomers,
          totalSalesAgents,
          totalEnquiries,
          activeEnquiries,
          convertedDeals,
          openTickets,
          totalRevenue,
          pendingCollections
        },
        recentEnquiries,
        recentTickets
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. User Management (Customers & Sales Employees)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, company, designation } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password: hashedPassword,
      role,
      company: company || '',
      designation: designation || ''
    });

    res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} user created successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'inactive', 'suspended'
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status || user.status;
    await user.save();
    res.json({ success: true, message: `User status updated to ${status}`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Global Enquiries Management & Assignment
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('customerId', 'name email company phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignEnquiryToSales = async (req, res) => {
  try {
    const { salesName, salesPhone, salesEmail } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    enquiry.assignedSales = {
      name: salesName,
      phone: salesPhone,
      email: salesEmail
    };
    enquiry.status = 'Under Review';
    enquiry.timeline.push({
      status: 'Under Review',
      title: 'Sales Agent Assigned',
      note: `Enquiry handed over to ${salesName} for customer discovery.`
    });

    await enquiry.save();
    res.json({ success: true, message: 'Sales executive assigned successfully', data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

