import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Property } from '../Models/PropertyModel.js';
import { User } from '../Models/userModel.js';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function testPropertyUpdate() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB HomelyHub...');

    const sampleProperty = await Property.findOne();
    console.log('Found Property to test:', sampleProperty.propertyName, sampleProperty._id);

    const updatePayload = {
      propertyName: sampleProperty.propertyName,
      price: Number(sampleProperty.price) || 2500,
      maximumGuest: Number(sampleProperty.maximumGuest) || 3,
      checkInTime: '11:00',
      checkOutTime: '13:00',
      propertyType: 'House',
    };

    const updated = await Property.findByIdAndUpdate(
      sampleProperty._id,
      { $set: updatePayload },
      { new: true, runValidators: false }
    );

    console.log('✅ Property updated successfully:', updated.propertyName, 'Price:', updated.price);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Property update test failed:', err);
    process.exit(1);
  }
}

testPropertyUpdate();
