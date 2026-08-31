import { Hold } from '../Models/HoldModel.js';
import { Property } from '../Models/PropertyModel.js';

// Check Database Level Date Availability (Bookings + Holds)
export const checkDateAvailability = async (req, res) => {
  try {
    const { propertyId, fromDate, toDate } = req.query;
    if (!propertyId || !fromDate || !toDate) {
      return res.status(400).json({ status: 'fail', message: 'Missing propertyId, fromDate, or toDate' });
    }

    const checkIn = new Date(fromDate);
    const checkOut = new Date(toDate);

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    // Check confirmed bookings conflict
    const hasBookingConflict = property.currentBookings?.some((b) => {
      const bIn = new Date(b.fromDate);
      const bOut = new Date(b.toDate);
      return checkIn < bOut && checkOut > bIn;
    });

    if (hasBookingConflict) {
      return res.status(200).json({
        status: 'success',
        available: false,
        reason: 'Selected dates are already booked by another guest.',
      });
    }

    // Check active 10-minute holds conflict
    const activeHolds = await Hold.find({
      property: propertyId,
      status: { $in: ['HELD', 'PAYMENT_PENDING'] },
      expiresAt: { $gt: new Date() },
      $or: [
        { fromDate: { $lt: checkOut }, toDate: { $gt: checkIn } },
      ],
    });

    if (activeHolds.length > 0) {
      return res.status(200).json({
        status: 'success',
        available: false,
        reason: 'Selected dates are currently held for 10 minutes by another guest completing payment.',
      });
    }

    res.status(200).json({
      status: 'success',
      available: true,
      message: 'Dates are available for reservation!',
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Create 10-Minute Temporary Booking Hold
export const createBookingHold = async (req, res) => {
  try {
    const { propertyId, fromDate, toDate, guests } = req.body;
    if (!propertyId || !fromDate || !toDate) {
      return res.status(400).json({ status: 'fail', message: 'Missing propertyId or dates' });
    }

    const checkIn = new Date(fromDate);
    const checkOut = new Date(toDate);

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    // Double-booking check
    const hasBookingConflict = property.currentBookings?.some((b) => {
      const bIn = new Date(b.fromDate);
      const bOut = new Date(b.toDate);
      return checkIn < bOut && checkOut > bIn;
    });

    if (hasBookingConflict) {
      return res.status(400).json({ status: 'fail', message: 'Selected dates are already booked!' });
    }

    // Create 10-minute hold lock
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newHold = await Hold.create({
      property: propertyId,
      user: req.user._id,
      fromDate: checkIn,
      toDate: checkOut,
      guests: guests || 1,
      status: 'HELD',
      expiresAt,
    });

    res.status(201).json({
      status: 'success',
      message: '10-Minute Temporary Hold Created',
      holdId: newHold._id,
      expiresAt: newHold.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Release Temporary Hold
export const releaseBookingHold = async (req, res) => {
  try {
    const { holdId } = req.body;
    if (holdId) {
      await Hold.findByIdAndUpdate(holdId, { status: 'RELEASED' });
    }
    res.status(200).json({ status: 'success', message: 'Hold released' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};
