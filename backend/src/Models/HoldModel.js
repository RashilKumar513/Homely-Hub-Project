import mongoose from 'mongoose';

const holdSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['HELD', 'PAYMENT_PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED'],
      default: 'HELD',
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10-minute hold lock
    },
  },
  { timestamps: true }
);

holdSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatic MongoDB expiration cleanup

const Hold = mongoose.model('Hold', holdSchema);
export { Hold };
