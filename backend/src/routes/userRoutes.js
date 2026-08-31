import express from 'express';
import {
  check,
  forgotPassword,
  login,
  portalLogin,
  hostLogin,
  adminLogin,
  logout,
  protect,
  resetPassword,
  signup,
  updateMe,
  updatePassword,
  toggleWishlist,
  getWishlist,
  sendEmailOTP,
  verifyEmailOTP,
  emailReceipt,
  getAdminStats,
  getHostStats,
  deleteUserAdmin,
  toggleUserRoleAdmin,
  createInquiry,
  getAdminInquiries,
  resolveInquiryAdmin,
  deleteInquiryAdmin,
  getMyInquiries,
} from '../controllers/authController.js';
import {
  createProperty,
  getUsersProperties,
} from '../controllers/propertyController.js';
import { cancelBooking } from '../controllers/bookingController.js';
import { createBookingHold, releaseBookingHold } from '../controllers/holdController.js';
import {
  applyCoupon,
  createSupportTicket,
  getUserSupportTickets,
  replySupportTicket,
  getUserNotifications,
  markNotificationRead,
  getAdminAuditLogs,
} from '../controllers/featureController.js';

const router = express.Router();

// Public Auth Portals
router.post('/signup', signup);
router.post('/login', login);
router.post('/user-login', login);
router.post('/portal-login', portalLogin);
router.post('/host-login', hostLogin);
router.post('/admin-login', adminLogin);
router.get('/logout', logout);
router.post('/inquiry', createInquiry);

// Password Reset Routes (Public Access)
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Email OTP Verification
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);

// Protected routes
router.use(protect);

router.get('/me', check);
router.patch('/updateMe', updateMe);
router.patch('/updateMyPassword', updatePassword);

// User Inquiries, Receipts & Cancellations
router.get('/my-inquiries', getMyInquiries);
router.post('/email-receipt', emailReceipt);
router.post('/booking/cancel/:bookingId', cancelBooking);

// Temporary 10-Minute Booking Holds
router.post('/booking/hold', createBookingHold);
router.post('/booking/release-hold', releaseBookingHold);

// Coupons, Support Tickets & Notifications
router.post('/apply-coupon', applyCoupon);
router.post('/support/ticket', createSupportTicket);
router.get('/support/tickets', getUserSupportTickets);
router.post('/support/ticket/:ticketId/reply', replySupportTicket);

router.get('/notifications', getUserNotifications);
router.patch('/notifications/:id', markNotificationRead);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/:propertyId', toggleWishlist);

// Host Management & Analytics
router.get('/host/stats', getHostStats);
router.patch('/host/inquiries/:id', resolveInquiryAdmin);

// Admin Data & Control Center APIs
router.get('/admin/stats', getAdminStats);
router.get('/admin/audit-logs', getAdminAuditLogs);
router.delete('/admin/user/:id', deleteUserAdmin);
router.delete('/admin/users/:id', deleteUserAdmin);
router.patch('/admin/user/:id/toggle-role', toggleUserRoleAdmin);
router.patch('/admin/user/:id/role', toggleUserRoleAdmin);
router.patch('/admin/users/:id/role', toggleUserRoleAdmin);

// Admin Inquiries
router.get('/admin/inquiries', getAdminInquiries);
router.patch('/admin/inquiries/:id', resolveInquiryAdmin);
router.delete('/admin/inquiries/:id', deleteInquiryAdmin);

// Properties & Listings
router.post('/createProperty', createProperty);
router.get('/myProperties', getUsersProperties);

export { router };