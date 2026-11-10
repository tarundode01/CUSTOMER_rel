const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getAdminDashboard,
  getAllUsers,
  createUser,
  updateUserStatus,
  getAllEnquiries,
  assignEnquiryToSales
} = require('../../controllers/adminController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Public Admin Auth
router.post('/auth/login', loginAdmin);

// Protected Admin APIs
router.use(protect);
router.use(authorize('admin'));

// Dashboard Stats & Analytics
router.get('/dashboard', getAdminDashboard);

// User & Role Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/status', updateUserStatus);

// Enquiries & Assignment
router.get('/enquiries', getAllEnquiries);
router.put('/enquiries/:id/assign', assignEnquiryToSales);

module.exports = router;
