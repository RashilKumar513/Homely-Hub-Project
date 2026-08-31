import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function inspectCompassDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected successfully to MongoDB Compass Database: HomelyHub`);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\n📁 COLLECTIONS IN MONGO DB COMPASS (Database: HomelyHub):');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  └─ Collection: '${col.name}' -> ${count} document(s)`);
    }

    const properties = await db.collection('properties').find({}).toArray();
    console.log('\n🏡 PROPERTY LISTINGS IN COMPASS:');
    properties.slice(0, 5).forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.propertyName} — ₹${p.price?.toLocaleString('en-IN')}/night (ID: ${p._id})`);
    });
    if (properties.length > 5) {
      console.log(`  ... and ${properties.length - 5} more luxury staycation properties!`);
    }

    const users = await db.collection('users').find({}).toArray();
    console.log('\n👥 REGISTERED USERS IN COMPASS:');
    users.forEach((u, idx) => {
      console.log(`  ${idx + 1}. ${u.name} (${u.email}) — Role: ${u.role}`);
    });

    const bookings = await db.collection('bookings').find({}).toArray();
    console.log(`\n🎟️ CONFIRMED BOOKINGS IN COMPASS: ${bookings.length}`);

    await mongoose.disconnect();
    console.log('\n🎉 MongoDB Compass Status Audit Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting MongoDB Compass database:', err);
    process.exit(1);
  }
}

inspectCompassDatabase();
