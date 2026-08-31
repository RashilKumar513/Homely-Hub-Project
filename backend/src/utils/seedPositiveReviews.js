import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Property } from '../Models/PropertyModel.js';
import { User } from '../Models/UserModel.js';

dotenv.config();

const DB = process.env.DATABASE || 'mongodb://127.0.0.1:27017/HomelyHub';

const positiveReviewsPool = [
  {
    name: 'Aarav Sharma',
    rating: 5,
    comment: 'Absolutely loved our stay! The location was breathtaking and the host went above and beyond to make us feel at home. Super clean and highly recommended! 🌟',
  },
  {
    name: 'Priya Patel',
    rating: 5,
    comment: 'Exceptional property! The amenities were top-notch, check-in was seamless, and the ambiance was peaceful yet accessible to all main attractions. ✨',
  },
  {
    name: 'Rohan Gupta',
    rating: 5,
    comment: 'Top-tier stay! Perfect for a relaxing weekend getaway with family. Cozy interiors, comfortable beds, and super fast Wi-Fi. Will definitely book again!',
  },
  {
    name: 'Ananya Verma',
    rating: 5,
    comment: 'Five stars all the way! Stunning design, spotless hygiene, and very responsive host communication. Worth every rupee! 🙌',
  },
  {
    name: 'Vikram Sengupta',
    rating: 5,
    comment: 'Highly recommended accommodation! Spotless clean rooms, high-speed internet, and wonderful hospitality. Exceeded all our expectations.',
  },
  {
    name: 'Sneha Reddy',
    rating: 5,
    comment: 'Fabulous experience from start to finish! Beautiful views, lovely decor, and peaceful surroundings. 10/10 staycation! ❤️',
  },
  {
    name: 'Kavya Nair',
    rating: 5,
    comment: 'One of the best stays we have ever booked! Great value for money, quiet neighborhood, and very well-maintained property.',
  },
  {
    name: 'Devansh Malhotra',
    rating: 5,
    comment: 'Extremely clean, modern, and comfortable stay! The check-in process was smooth and the host provided fantastic local recommendations.',
  },
];

async function seedReviews() {
  try {
    await mongoose.connect(DB);
    console.log('Connected to MongoDB');

    let defaultUser = await User.findOne();
    if (!defaultUser) {
      console.log('No user found in database. Creating a placeholder guest user...');
      defaultUser = await User.create({
        name: 'Guest User',
        email: 'guest@homelyhub.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
      });
    }

    const properties = await Property.find();
    console.log(`Found ${properties.length} properties to add positive reviews.`);

    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];

      // Select 3 unique positive reviews from the pool based on property index
      const rev1 = positiveReviewsPool[i % positiveReviewsPool.length];
      const rev2 = positiveReviewsPool[(i + 2) % positiveReviewsPool.length];
      const rev3 = positiveReviewsPool[(i + 4) % positiveReviewsPool.length];

      prop.reviews = [
        {
          user: defaultUser._id,
          name: rev1.name,
          rating: rev1.rating,
          comment: rev1.comment,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          user: defaultUser._id,
          name: rev2.name,
          rating: rev2.rating,
          comment: rev2.comment,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          user: defaultUser._id,
          name: rev3.name,
          rating: rev3.rating,
          comment: rev3.comment,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      ];

      // Calculate average rating & number of reviews
      const totalRating = prop.reviews.reduce((acc, item) => acc + item.rating, 0);
      prop.ratings = Number((totalRating / prop.reviews.length).toFixed(1));
      prop.numOfReviews = prop.reviews.length;

      await prop.save();
      console.log(`✅ Added 3 positive reviews to "${prop.propertyName}" (Rating: ${prop.ratings} ⭐)`);
    }

    console.log('🎉 Successfully seeded positive guest reviews with user names across all properties!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
}

seedReviews();
