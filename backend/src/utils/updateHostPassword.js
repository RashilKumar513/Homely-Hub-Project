import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function updateHostPassword() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB HomelyHub...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const newPasswordRaw = 'Rashil2006@1';
    const hashedPassword = await bcrypt.hash(newPasswordRaw, 12);

    const result = await usersCollection.updateOne(
      { email: 'rashidrashil2006@gmail.com' },
      {
        $set: {
          password: hashedPassword,
          role: 'host',
          isEmailVerified: true,
        },
      }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Successfully updated Host password for rashidrashil2006@gmail.com to: ${newPasswordRaw}`);
    } else {
      console.log(`⚠️ Account rashidrashil2006@gmail.com not found.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating Host password:', err);
    process.exit(1);
  }
}

updateHostPassword();
