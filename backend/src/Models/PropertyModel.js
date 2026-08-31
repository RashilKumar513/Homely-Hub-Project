import mongoose from 'mongoose';
import slugify from 'slugify';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const propertySchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: [true, 'Please enter your property name'],
    },
    description: {
      type: String,
      required: [true, 'Please add information about your property'],
    },
    extraInfo: {
      type: String,
      default:
        'Nestled in a tranquil neighborhood, the house exudes an aura of charm and elegance. The exterior is adorned with a harmonious blend of classic and contemporary architectural elements, featuring a beautiful brick facade and a welcoming front porch. As you step inside, you are greeted by a spacious, sunlit living room with high ceilings and large windows that invite an abundance of natural light.',
    },
    propertyType: {
      type: String,
      enum: ['House', 'Flat', 'Guest House', 'Hotel', 'Villa'],
      default: 'House',
    },
    roomType: {
      type: String,
      enum: ['Anytype', 'Room', 'Entire Home'],
      default: 'Anytype',
    },
    maximumGuest: {
      type: Number,
      required: [true, 'Please give the maximum number of guests that can occupy'],
    },
    amenities: [
      {
        name: {
          type: String,
          required: true,
        },
        icon: {
          type: String,
          required: true,
        },
      },
    ],
    images: [
      {
        public_id: { type: String },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    price: {
      type: Number,
      required: [true, 'Please enter the price per night value'],
      default: 500,
    },
    ratings: {
      type: Number,
      default: 4.8,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    address: {
      area: String,
      city: String,
      state: String,
      pincode: Number,
    },
    currentBookings: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
        },
        fromDate: Date,
        toDate: Date,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    slug: String,
    checkInTime: {
      type: String,
      default: '11:00',
    },
    checkOutTime: {
      type: String,
      default: '13:00',
    },
  },
  { timestamps: true }
);

propertySchema.pre('save', function (next) {
  if (this.propertyName) {
    this.slug = slugify(this.propertyName, { lower: true });
  }
  if (this.address && this.address.city) {
    this.address.city = this.address.city.toLowerCase().trim();
  }
  next();
});

const Property = mongoose.model('Property', propertySchema);
export { Property };