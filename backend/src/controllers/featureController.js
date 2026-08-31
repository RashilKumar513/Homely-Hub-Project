import { Coupon } from '../Models/CouponModel.js';
import { SupportTicket } from '../Models/SupportTicketModel.js';
import { Notification } from '../Models/NotificationModel.js';
import { AuditLog } from '../Models/AuditLogModel.js';

// 1. COUPON CONTROLLER
export const applyCoupon = async (req, res) => {
  try {
    const { code, bookingValue } = req.body;
    if (!code) {
      return res.status(400).json({ status: 'fail', message: 'Please enter a promo coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Default Seed Coupons if none exist in database yet
    let coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    if (!coupon) {
      if (cleanCode === 'WELCOME10') {
        coupon = { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10, maxDiscountAmount: 1500, minBookingValue: 2000 };
      } else if (cleanCode === 'LUXURY500') {
        coupon = { code: 'LUXURY500', discountType: 'FIXED', discountValue: 500, maxDiscountAmount: 500, minBookingValue: 3000 };
      } else if (cleanCode === 'HOMELY2026') {
        coupon = { code: 'HOMELY2026', discountType: 'PERCENTAGE', discountValue: 15, maxDiscountAmount: 2500, minBookingValue: 4000 };
      } else {
        return res.status(404).json({ status: 'fail', message: 'Invalid or expired promo code' });
      }
    }

    const valueNum = Number(bookingValue || 1000);
    if (coupon.minBookingValue && valueNum < coupon.minBookingValue) {
      return res.status(400).json({
        status: 'fail',
        message: `Coupon '${cleanCode}' requires a minimum booking value of ₹${coupon.minBookingValue.toLocaleString('en-IN')}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((valueNum * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.status(200).json({
      status: 'success',
      message: `Coupon '${cleanCode}' applied successfully!`,
      discountAmount,
      finalAmount: Math.max(valueNum - discountAmount, 0),
      couponCode: cleanCode,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// 2. SUPPORT TICKET CONTROLLERS
export const createSupportTicket = async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ status: 'fail', message: 'Please provide subject and message' });
    }

    const ticketId = `HH${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await SupportTicket.create({
      ticketId,
      user: req.user._id,
      subject,
      category: category || 'General',
      status: 'OPEN',
      messages: [
        {
          sender: req.user._id,
          senderRole: req.user.role || 'user',
          text: message,
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      message: `Support Ticket #${ticketId} created successfully!`,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

export const getUserSupportTickets = async (req, res) => {
  try {
    let tickets = [];
    if (req.user.role === 'admin') {
      tickets = await SupportTicket.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    } else {
      tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      status: 'success',
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

export const replySupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text, status } = req.body;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Support ticket not found' });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderRole: req.user.role || 'user',
      text,
    });

    if (status) {
      ticket.status = status;
    } else if (req.user.role === 'admin') {
      ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();

    res.status(200).json({
      status: 'success',
      message: 'Reply submitted successfully',
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// 3. NOTIFICATION CENTER CONTROLLERS
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      unreadCount: notifications.filter((n) => !n.read).length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ status: 'success', message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// 4. ADMIN AUDIT LOGS CONTROLLER
export const getAdminAuditLogs = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied: Admin only' });
    }

    const logs = await AuditLog.find({}).populate('admin', 'name email').sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      status: 'success',
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};
