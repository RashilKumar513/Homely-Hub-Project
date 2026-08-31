import express from 'express';
import {
  getUserBookings,
  getBookingDetails,
  createOrder,
  verifyPayment,
} from '../controllers/bookingController.js';
import { protect } from '../controllers/authController.js';

const bookingRouter = express.Router();

bookingRouter.use(protect);

bookingRouter.get('/', getUserBookings);
bookingRouter.get('/:bookingId', getBookingDetails);
bookingRouter.post('/create-order', createOrder);
bookingRouter.post('/verify-payment', verifyPayment);

export { bookingRouter };