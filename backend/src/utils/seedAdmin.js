import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/HomelyHub');
    const existingAdmin = await mongoose.connection.db.collection('users').findOne({ email: 'admin@homelyhub.com' });
    const hashedPassword = await bcrypt.hash('admin123', 12);

    if (!existingAdmin) {
      await mongoose.connection.db.collection('users').insertOne({
        name: 'System Administrator',
        email: 'admin@homelyhub.com',
        password: hashedPassword,
        phoneNumber: '9999999999',
        role: 'admin',
        avatar: { url: 'https://i.pravatar.cc/150?img=68' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Created admin account: admin@homelyhub.com / admin123');
    } else {
      await mongoose.connection.db.collection('users').updateOne(
        { email: 'admin@homelyhub.com' },
        { $set: { role: 'admin', password: hashedPassword } }
      );
      console.log('Updated admin account: admin@homelyhub.com / admin123');
    }

    const connTesting = await mongoose.createConnection('mongodb://127.0.0.1:27017/testing').asPromise();
    await connTesting.db.collection('users').updateOne(
      { email: 'admin@homelyhub.com' },
      {
        $set: {
          name: 'System Administrator',
          email: 'admin@homelyhub.com',
          password: hashedPassword,
          phoneNumber: '9999999999',
          role: 'admin',
          avatar: { url: 'https://i.pravatar.cc/150?img=68' },
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    await connTesting.close();
    console.log('Synced Admin to testing database!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
