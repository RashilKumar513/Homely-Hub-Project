import mongoose from 'mongoose';

async function fixDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/HomelyHub');

    // Fix Xavier's Guest House image URL
    await mongoose.connection.db.collection('properties').updateOne(
      { propertyName: "Xavier's Guest House" },
      {
        $set: {
          images: [
            { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' },
            { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
            { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
            { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80' },
            { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80' },
            { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80' },
          ],
        },
      }
    );

    // Remove empty/incomplete test property records
    const res = await mongoose.connection.db.collection('properties').deleteMany({
      $or: [
        { propertyName: 'undefined' },
        { propertyName: null },
        { address: null },
        { 'address.city': null },
      ],
    });
    console.log('Cleaned up incomplete test records, deleted:', res.deletedCount);

    // Sync cleaned dataset to testing database
    const connTesting = await mongoose.createConnection('mongodb://127.0.0.1:27017/testing').asPromise();
    const cleanProperties = await mongoose.connection.db.collection('properties').find({}).toArray();
    await connTesting.db.collection('properties').deleteMany({});
    await connTesting.db.collection('properties').insertMany(cleanProperties);
    console.log('Synced cleaned properties to testing database!');
    await connTesting.close();

    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

fixDB();
