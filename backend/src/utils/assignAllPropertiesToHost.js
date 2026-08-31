import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function assignAllPropertiesToHost() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB HomelyHub...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const propertiesCollection = db.collection('properties');

    const hostUser = await usersCollection.findOne({ email: 'rashidrashil2006@gmail.com' });
    if (!hostUser) {
      console.error('Host account rashidrashil2006@gmail.com not found!');
      process.exit(1);
    }

    const totalProps = await propertiesCollection.countDocuments();
    console.log(`Total properties found in MongoDB: ${totalProps}`);

    // Assign ALL properties unconditionally to primary host (rashidrashil2006@gmail.com)
    const result = await propertiesCollection.updateMany(
      {},
      { $set: { userId: hostUser._id, isApproved: true, status: 'Active' } }
    );

    console.log(`✅ Successfully assigned ALL ${result.modifiedCount} / ${totalProps} properties to Host (${hostUser.email})!`);

    const hostProps = await propertiesCollection.find({ userId: hostUser._id }).toArray();
    console.log(`✅ Host now owns ${hostProps.length} properties in MongoDB!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error assigning properties:', err);
    process.exit(1);
  }
}

assignAllPropertiesToHost();
