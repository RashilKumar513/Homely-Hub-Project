import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Booking must belong to a Property!'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User!'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay Gateway',
    },
    paymentId: {
      type: String,
    },
    fromDate: { type: Date },
    toDate: { type: Date },
    guests: { type: Number },
    numberOfnights: { type: Number },
  },
  { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'property',
    select: 'maximumGuest location images propertyName address price ratings',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export { Booking };