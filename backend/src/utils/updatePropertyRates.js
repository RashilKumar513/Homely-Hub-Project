import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Property } from '../Models/PropertyModel.js';

dotenv.config();

const DB = process.env.DATABASE || 'mongodb://127.0.0.1:27017/HomelyHub';

const ratesMapping = [
  { namePattern: /munnar|farmhouse/i, price: 3200, checkInTime: '12:00', checkOutTime: '11:00' },
  { namePattern: /villa|luxury|ecr/i, price: 5800, checkInTime: '14:00', checkOutTime: '11:00' },
  { namePattern: /flat|apartment|carnival/i, price: 2800, checkInTime: '12:00', checkOutTime: '11:00' },
  { namePattern: /inn|olive|guest/i, price: 2400, checkInTime: '12:00', checkOutTime: '11:00' },
  { namePattern: /cottage|bamboo|hut/i, price: 1900, checkInTime: '12:00', checkOutTime: '11:00' },
];

async function updateProperties() {
  try {
    await mongoose.connect(DB);
    console.log('Connected to MongoDB');

    const properties = await Property.find();
    console.log(`Found ${properties.length} properties to inspect.`);

    for (const prop of properties) {
      // Fix legacy enum mismatches
      if (prop.propertyType) {
        const pt = prop.propertyType.toLowerCase();
        if (pt.includes('guest')) prop.propertyType = 'Guest House';
        else if (pt.includes('flat')) prop.propertyType = 'Flat';
        else if (pt.includes('villa')) prop.propertyType = 'Villa';
        else if (pt.includes('hotel')) prop.propertyType = 'Hotel';
        else prop.propertyType = 'House';
      }

      if (prop.roomType) {
        const rt = prop.roomType.toLowerCase();
        if (rt.includes('entire')) prop.roomType = 'Entire Home';
        else if (rt.includes('room')) prop.roomType = 'Room';
        else prop.roomType = 'Anytype';
      }

      let matched = false;
      for (const rule of ratesMapping) {
        if (rule.namePattern.test(prop.propertyName)) {
          prop.price = rule.price;
          prop.checkInTime = rule.checkInTime;
          prop.checkOutTime = rule.checkOutTime;
          matched = true;
          break;
        }
      }

      if (!matched) {
        prop.price = 2800;
        prop.checkInTime = '12:00';
        prop.checkOutTime = '11:00';
      }

      await prop.save();
      console.log(`Updated property: ${prop.propertyName} -> Price: ₹${prop.price}, Check-in: ${prop.checkInTime}, Check-out: ${prop.checkOutTime}`);
    }

    console.log('✅ All property prices and check-in/out times updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating properties:', error);
    process.exit(1);
  }
}

updateProperties();
