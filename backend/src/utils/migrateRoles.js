import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function migrateUserRoles() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB database HomelyHub for role migration...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. Admin Account Audit
    const adminAccount = await usersCollection.findOne({ email: 'admin@homelyhub.com' });
    if (adminAccount) {
      await usersCollection.updateOne(
        { email: 'admin@homelyhub.com' },
        { $set: { role: 'admin', isEmailVerified: true, otp: null } }
      );
      console.log(`✅ Admin Account (admin@homelyhub.com) confirmed as ADMIN with OTP bypass.`);
    }

    // 2. Primary Host Account Migration (rashidrashil2006@gmail.com)
    const hostAccount = await usersCollection.findOne({ email: 'rashidrashil2006@gmail.com' });
    if (hostAccount) {
      await usersCollection.updateOne(
        { email: 'rashidrashil2006@gmail.com' },
        { $set: { role: 'host', isEmailVerified: true, otp: null } }
      );
      console.log(`✅ Host Account (rashidrashil2006@gmail.com) successfully migrated to HOST with OTP bypass.`);
    }

    // 3. Update 22 properties to assign host (userId = rashidrashil2006@gmail.com _id)
    if (hostAccount) {
      const updateResult = await db.collection('properties').updateMany(
        { $or: [{ userId: { $exists: false } }, { userId: null }] },
        { $set: { userId: hostAccount._id, isApproved: true, status: 'Active' } }
      );
      console.log(`✅ Assigned ${updateResult.modifiedCount} staycation properties to primary Host (rashidrashil2006@gmail.com).`);
    }

    const allUsers = await usersCollection.find({}).toArray();
    console.log('\n👥 DATABASE USER ACCOUNTS AFTER MIGRATION:');
    allUsers.forEach((u) => {
      console.log(`  └─ ${u.name} (${u.email}) -> Role: [${u.role.toUpperCase()}]`);
    });

    await mongoose.disconnect();
    console.log('\n🎉 Role Migration Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during role migration:', err);
    process.exit(1);
  }
}

migrateUserRoles();
