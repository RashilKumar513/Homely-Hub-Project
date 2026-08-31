import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function syncAllPasswords() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB HomelyHub...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const passwordRaw = 'Rashil2006@1';
    const hashedPassword = await bcrypt.hash(passwordRaw, 12);

    // 1. Update Admin Account
    const adminRes = await usersCollection.updateOne(
      { email: 'admin@homelyhub.com' },
      {
        $set: {
          password: hashedPassword,
          role: 'admin',
          isEmailVerified: true,
          isSuspended: false,
        },
      }
    );
    console.log(`✅ Admin Account (admin@homelyhub.com) password updated & hashed to: ${passwordRaw}`);

    // 2. Update Host Account
    const hostRes = await usersCollection.updateOne(
      { email: 'rashidrashil2006@gmail.com' },
      {
        $set: {
          password: hashedPassword,
          role: 'host',
          isEmailVerified: true,
          isSuspended: false,
        },
      }
    );
    console.log(`✅ Host Account (rashidrashil2006@gmail.com) password updated & hashed to: ${passwordRaw}`);

    // Verify bcrypt comparison for both accounts
    const adminUser = await usersCollection.findOne({ email: 'admin@homelyhub.com' });
    const hostUser = await usersCollection.findOne({ email: 'rashidrashil2006@gmail.com' });

    const adminCheck = await bcrypt.compare(passwordRaw, adminUser.password);
    const hostCheck = await bcrypt.compare(passwordRaw, hostUser.password);

    console.log(`\n🔒 BCRYPT VERIFICATION RESULTS:`);
    console.log(`  └─ Admin (admin@homelyhub.com): ${adminCheck ? '✅ MATCH SUCCESS!' : '❌ FAIL'}`);
    console.log(`  └─ Host (rashidrashil2006@gmail.com): ${hostCheck ? '✅ MATCH SUCCESS!' : '❌ FAIL'}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error syncing passwords:', err);
    process.exit(1);
  }
}

syncAllPasswords();
