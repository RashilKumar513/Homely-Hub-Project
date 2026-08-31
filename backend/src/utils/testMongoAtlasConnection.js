import mongoose from 'mongoose';

async function testMongoAtlas() {
  const uri = 'mongodb+srv://homelyadmin:Rashil2006%401@homelyhubcluster.ospsa7f.mongodb.net/HomelyHub?retryWrites=true&w=majority';
  console.log('Connecting to MongoDB Atlas Cluster...');

  try {
    await mongoose.connect(uri);
    console.log('🎉 SUCCESS! Connected to MongoDB Atlas Cloud Database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

testMongoAtlas();
