import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    guestEmail: {
      type: String,
      required: [true, 'Please provide your email address'],
    },
    guestPhone: {
      type: String,
      default: '',
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
    propertyName: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: 'General Inquiry',
    },
    checkInDate: String,
    checkOutDate: String,
    message: {
      type: String,
      required: [true, 'Please enter your inquiry message'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending',
    },
    replyMessage: {
      type: String,
      default: '',
    },
    repliedBy: {
      type: String,
      default: '',
    },
    repliedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export { Inquiry };
