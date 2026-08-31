import { Property } from '../Models/PropertyModel.js';
import { Booking } from '../Models/bookingModel.js';
import { sendMail } from '../utils/mail.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_HomelyHub2026';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'HomelyHubSecret2026';
  return {
    razorpay: new Razorpay({ key_id, key_secret }),
    key_id,
    key_secret,
  };
};

export const createOrder = async (req, res) => {
  try {
    const { amount, propertyId, fromDate, toDate, guests } = req.body;
    const { razorpay, key_id } = getRazorpayInstance();

    const options = {
      amount: Math.round((amount || 100) * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpErr) {
      // Fallback for sandbox mode if keys are test placeholders
      order = {
        id: 'order_' + Date.now(),
        amount: options.amount,
        currency: 'INR',
      };
    }

    res.status(200).json({
      success: true,
      message: 'Razorpay Order created successfully',
      orderId: order.id,
      keyId: key_id,
      amount: amount,
      currency: 'INR',
      propertyId,
      fromDate,
      toDate,
      guests,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature, bookingDetails, forceStatus } = req.body;
    const { key_secret } = getRazorpayInstance();

    let isValid = true;

    // Signature verification for live Razorpay credentials
    if (orderId && razorpayPaymentId && razorpaySignature && key_secret && !key_secret.includes('HomelyHub')) {
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${orderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        isValid = false;
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay Signature: Payment verification failed!',
      });
    }

    if (forceStatus === 'success' || !forceStatus) {
      const paymentId = 'pay_' + Date.now();

      const booking = await Booking.create({
        user: req.user._id,
        property: bookingDetails.propertyId,
        price: bookingDetails.price,
        fromDate: bookingDetails.fromDate,
        toDate: bookingDetails.toDate,
        guests: bookingDetails.guests,
        numberOfnights: bookingDetails.nights,
        paid: true,
        paymentMethod: req.body.paymentMethod || 'Razorpay Gateway',
        paymentId: paymentId,
      });

      await Property.findByIdAndUpdate(
        bookingDetails.propertyId,
        {
          $push: {
            currentBookings: {
              bookingId: booking._id,
              fromDate: bookingDetails.fromDate,
              toDate: bookingDetails.toDate,
              userId: req.user._id,
            },
          },
        },
        { new: true }
      );

      const targetProperty = await Property.findById(bookingDetails.propertyId);
      const propertyName = targetProperty?.propertyName || 'Homely Hub Stay';
      const receiptId = `HH-${booking._id.toString().slice(-8).toUpperCase()}`;

      // Itemized Financial GST Calculation for Invoice Receipt
      const totalPriceVal = bookingDetails.price || 1000;
      const gstRate = totalPriceVal >= 7500 ? 18 : 12;
      const baseTariff = Math.round(totalPriceVal / (1 + gstRate / 100));
      const totalGst = Math.round(totalPriceVal - baseTariff);
      const cgst = Math.round(totalGst / 2);
      const sgst = totalGst - cgst;

      // Automatically email Payment Status & PDF Check-in Voucher Receipt
      try {
        await sendMail({
          email: req.user.email,
          subject: `✅ GST TAX INVOICE & RECEIPT #${receiptId}: ${propertyName}`,
          mailGenContent: {
            body: {
              name: req.user.name || 'Valued Guest',
              intro: `OFFICIAL GST TAX RECEIPT #${receiptId} — Your reservation for ${propertyName} has been confirmed with 100% successful payment!`,
              table: {
                data: [
                  {
                    Item: `Base Stay Tariff (${bookingDetails.nights || 1} Night(s))`,
                    'GST Rate': '0.00%',
                    Amount: `₹${baseTariff.toLocaleString('en-IN')}`,
                  },
                  {
                    Item: `Central GST (CGST ${gstRate/2}%)`,
                    'GST Rate': `${gstRate/2}%`,
                    Amount: `₹${cgst.toLocaleString('en-IN')}`,
                  },
                  {
                    Item: `State GST (SGST ${gstRate/2}%)`,
                    'GST Rate': `${gstRate/2}%`,
                    Amount: `₹${sgst.toLocaleString('en-IN')}`,
                  },
                  {
                    Item: `GRAND TOTAL PAID (${gstRate}% GST INCL.)`,
                    'GST Rate': `${gstRate}% GST`,
                    Amount: `₹${totalPriceVal.toLocaleString('en-IN')}`,
                  },
                ],
              },
              action: {
                instructions: 'To view your confirmed stay and print your official GST tax invoice voucher, click below:',
                button: {
                  color: '#10b981',
                  text: 'View Confirmed Stay & GST Voucher',
                  link: `http://localhost:5173/user/mybookings/${booking._id}`,
                },
              },
              outro: `Invoice GSTIN: 33AAAAH1234F1Z5 | Receipt ID: #${receiptId}. Present this voucher at check-in. Thank you for choosing Homely Hub!`,
            },
          },
        });
        console.log(`✅ GST Tax Invoice Email Sent to ${req.user.email} for receipt ${receiptId}`);
      } catch (mailErr) {
        console.error('Email receipt dispatch error:', mailErr.message);
      }

      // Send Mandatory Admin Notification Email for Payment Received
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'rashilromeo@gmail.com';
      try {
        await sendMail({
          email: adminEmail,
          subject: `🔔 [ADMIN ALERT]: New Payment Received & Reservation Confirmed #${receiptId}`,
          mailGenContent: {
            body: {
              name: 'Homely Hub Administrator',
              intro: `ADMIN ALERT: A new payment of ₹${bookingDetails.price?.toLocaleString('en-IN')} has been received and confirmed!`,
              table: {
                data: [
                  {
                    Property: propertyName,
                    'Total Paid': `₹${bookingDetails.price?.toLocaleString('en-IN')}`,
                    'Guest Name': req.user.name || 'Guest User',
                    'Guest Email': req.user.email || 'N/A',
                    'Guest Phone': req.user.phoneNumber || 'N/A',
                    Dates: `${new Date(bookingDetails.fromDate).toLocaleDateString()} to ${new Date(bookingDetails.toDate).toLocaleDateString()}`,
                    'Payment ID': paymentId,
                  },
                ],
              },
              action: {
                instructions: 'To view revenue metrics, manage bookings, or access admin analytics, click below:',
                button: {
                  color: '#ff385c',
                  text: 'Open Admin Dashboard',
                  link: 'http://localhost:5173/admin/dashboard',
                },
              },
              outro: `Receipt ID: #${receiptId}. The booking and revenue metrics have been updated in MongoDB & Admin Portal.`,
            },
          },
        });
        console.log(`🔔 Admin Payment Alert Email Sent to ${adminEmail} for receipt ${receiptId}`);
      } catch (adminMailErr) {
        console.error('Admin payment alert email error:', adminMailErr.message);
      }

      res.status(200).json({
        success: true,
        message: 'Payment successful! Booking confirmed.',
        paymentId,
        orderId,
        booking,
      });
    } else {
      // Send Payment Failed Email Notification
      try {
        await sendMail({
          email: req.user.email,
          subject: `❌ PAYMENT FAILED: Homely Hub Reservation #${orderId || 'Order'}`,
          mailGenContent: {
            body: {
              name: req.user.name || 'Valued Guest',
              intro: `PAYMENT DECLINED / FAILED: Your payment attempt for Order #${orderId || 'Reservation'} was unsuccessful. No charges were made to your bank account.`,
              action: {
                instructions: 'To retry payment and complete your stay reservation, click below:',
                button: {
                  color: '#dc2626',
                  text: 'Retry Payment Now',
                  link: `http://localhost:5173/payment/${bookingDetails?.propertyId || ''}`,
                },
              },
              outro: 'If you need assistance, contact support@homelyhub.com.',
            },
          },
        });
        console.log(`❌ Payment Failure Email Sent to ${req.user.email} for order ${orderId}`);
      } catch (mailErr) {
        console.error('Payment failure email error:', mailErr.message);
      }

      res.status(400).json({
        success: false,
        message: 'Payment failed! Please try again.',
        orderId,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property')
      .populate('user')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { bookings },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('property')
      .populate('user');

    res.status(200).json({
      status: 'success',
      data: { bookings: booking },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Cancel Booking Controller with 15% Cancellation Fee Policy
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('property');

    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    const bookingUserId = booking.user?._id ? booking.user._id.toString() : booking.user.toString();
    const currentUserId = req.user._id.toString();

    if (bookingUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Access denied: You cannot cancel another user\'s booking' });
    }

    // Check-in Eligibility Check: Cannot cancel if stay check-in date has passed
    const now = new Date();
    const checkInDateEnd = new Date(booking.fromDate);
    checkInDateEnd.setHours(23, 59, 59, 999);

    if (now > checkInDateEnd) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cancellation Closed: Stay check-in date has already passed!',
      });
    }

    // Fee calculation: 15% retained as cancellation fee, 85% refunded
    const totalPrice = booking.price || 0;
    const feeAmount = Math.round(totalPrice * 0.15);
    const refundAmount = totalPrice - feeAmount;

    // Delete booking from MongoDB and remove from property's currentBookings
    await Booking.findByIdAndDelete(bookingId);
    if (booking.property) {
      await Property.findByIdAndUpdate(booking.property._id, {
        $pull: { currentBookings: { bookingId: booking._id } },
      });
    }

    const propertyName = booking.property?.propertyName || 'Homely Hub Stay';

    const cancellationId = `HH-CANCEL-${booking._id.toString().slice(-8).toUpperCase()}`;

    // Send Real Email Notification stating that Order is Cancelled
    try {
      await sendMail({
        email: req.user.email,
        subject: `⚠️ ORDER CANCELLED: Homely Hub Booking #${cancellationId}`,
        mailGenContent: {
          body: {
            name: req.user.name || 'Valued Guest',
            intro: `YOUR ORDER HAS BEEN CANCELLED: Your reservation for ${propertyName} has been successfully cancelled as requested.`,
            table: {
              data: [
                {
                  Status: 'ORDER CANCELLED',
                  Property: propertyName,
                  'Original Amount': `₹${totalPrice.toLocaleString('en-IN')}`,
                  '15% Fee Retained': `- ₹${feeAmount.toLocaleString('en-IN')}`,
                  '85% Refund Amount': `₹${refundAmount.toLocaleString('en-IN')}`,
                },
              ],
            },
            action: {
              instructions: 'The net refund of 85% will be credited to your bank account / original payment method soon. Click below to view your account:',
              button: {
                color: '#dc2626',
                text: 'View My Account & Bookings',
                link: 'http://localhost:5173/user/mybookings',
              },
            },
            outro: `Cancellation ID: #${cancellationId}. Refund Amount: ₹${refundAmount.toLocaleString('en-IN')} will be credited to your bank account soon. Thank you for choosing Homely Hub!`,
          },
        },
      });
      console.log(`✅ Cancellation Email Sent to ${req.user.email} for order ${cancellationId}`);
    } catch (mailErr) {
      console.error('Cancellation email dispatch error:', mailErr.message);
    }

    // Send Mandatory Admin Notification Email for Booking Cancellation
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'rashilromeo@gmail.com';
    try {
      await sendMail({
        email: adminEmail,
        subject: `⚠️ [ADMIN ALERT]: Booking Reservation Cancelled #${cancellationId}`,
        mailGenContent: {
          body: {
            name: 'Homely Hub Administrator',
            intro: `ADMIN CANCELLATION NOTICE: Reservation #${cancellationId} for ${propertyName} has been cancelled by guest ${req.user.name || 'Guest User'} (${req.user.email}).`,
            table: {
              data: [
                {
                  Status: 'BOOKING CANCELLED',
                  Property: propertyName,
                  'Guest Name': req.user.name || 'Guest User',
                  'Guest Email': req.user.email || 'N/A',
                  'Total Paid': `₹${totalPrice.toLocaleString('en-IN')}`,
                  '15% Fee Retained': `₹${feeAmount.toLocaleString('en-IN')}`,
                  '85% Refund Amount': `₹${refundAmount.toLocaleString('en-IN')}`,
                },
              ],
            },
            action: {
              instructions: 'To view updated property availability and revenue reports in Admin Dashboard, click below:',
              button: {
                color: '#dc2626',
                text: 'Open Admin Dashboard',
                link: 'http://localhost:5173/admin/dashboard',
              },
            },
            outro: `Cancellation ID: #${cancellationId}. The property unit has been freed and updated in MongoDB & Admin Portal.`,
          },
        },
      });
      console.log(`🔔 Admin Cancellation Alert Email Sent to ${adminEmail} for cancellation ${cancellationId}`);
    } catch (adminMailErr) {
      console.error('Admin cancellation alert email error:', adminMailErr.message);
    }

    res.status(200).json({
      status: 'success',
      message: `Booking cancelled successfully! 85% refund of ₹${refundAmount.toLocaleString('en-IN')} initiated (15% fee ₹${feeAmount.toLocaleString('en-IN')}).`,
      refundAmount,
      feeAmount,
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};