import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.DB_LOCAL_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully to ${mongoUri.replace(/:[^:@]+@/, ':****@')}...`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;