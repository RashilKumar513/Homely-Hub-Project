import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/HomelyHub';

async function setPlainTextPasswords() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB HomelyHub...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const plainPassword = 'Rashil2006@1';

    // 1. Update Host
    await usersCollection.updateOne(
      { email: 'rashidrashil2006@gmail.com' },
      {
        $set: {
          password: plainPassword,
          role: 'host',
          isEmailVerified: true,
          isSuspended: false,
        },
      }
    );
    console.log(`✅ Host rashidrashil2006@gmail.com password set to plain text: ${plainPassword}`);

    // 2. Update Admin
    await usersCollection.updateOne(
      { email: 'admin@homelyhub.com' },
      {
        $set: {
          password: plainPassword,
          role: 'admin',
          isEmailVerified: true,
          isSuspended: false,
        },
      }
    );
    console.log(`✅ Admin admin@homelyhub.com password set to plain text: ${plainPassword}`);

    // 3. Update all other users to have plain text passwords
    await usersCollection.updateMany(
      { email: { $nin: ['admin@homelyhub.com', 'rashidrashil2006@gmail.com'] } },
      {
        $set: {
          password: plainPassword,
          isEmailVerified: true,
          isSuspended: false,
        },
      }
    );

    const allUsers = await usersCollection.find().project({ name: 1, email: 1, role: 1, password: 1 }).toArray();
    console.log('\n--- ALL USERS IN MONGODB HomelyHub ---');
    console.table(allUsers);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating plain text passwords:', err);
    process.exit(1);
  }
}

setPlainTextPasswords();
