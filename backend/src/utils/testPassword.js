import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function testPassword() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB HomelyHub...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const hostUser = await usersCollection.findOne({ email: 'rashidrashil2006@gmail.com' });
    console.log('\n--- HOST ACCOUNT ---');
    console.log('Email:', hostUser?.email);
    console.log('Role:', hostUser?.role);
    console.log('Password Hash in DB:', hostUser?.password);

    const testPassword = 'Rashil2006@1';
    const match = await bcrypt.compare(testPassword, hostUser?.password || '');
    console.log(`Bcrypt Compare '${testPassword}' with DB Hash: ${match ? '✅ MATCH!' : '❌ DOES NOT MATCH!'}`);

    const adminUser = await usersCollection.findOne({ email: 'admin@homelyhub.com' });
    console.log('\n--- ADMIN ACCOUNT ---');
    console.log('Email:', adminUser?.email);
    console.log('Role:', adminUser?.role);
    console.log('Password Hash in DB:', adminUser?.password);

    const adminMatch = await bcrypt.compare(testPassword, adminUser?.password || '');
    console.log(`Bcrypt Compare '${testPassword}' with Admin DB Hash: ${adminMatch ? '✅ MATCH!' : '❌ DOES NOT MATCH!'}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error testing password:', err);
    process.exit(1);
  }
}

testPassword();
