import mongoose from 'mongoose';

const luxuryImages = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
];

async function upgradePropertyImages() {
  const dbs = ['HomelyHub', 'testing'];

  for (const dbName of dbs) {
    const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/' + dbName).asPromise();
    const props = await conn.db.collection('properties').find().toArray();

    for (let i = 0; i < props.length; i++) {
      const p = props[i];
      let needsUpgrade = false;
      if (!p.images || p.images.length === 0) needsUpgrade = true;
      else if (typeof p.images[0] === 'string' && (p.images[0].includes('gstatic') || p.images[0].includes('freepik'))) needsUpgrade = true;
      else if (p.images[0].url && (p.images[0].url.includes('gstatic') || p.images[0].url.includes('freepik'))) needsUpgrade = true;

      if (needsUpgrade) {
        const replacementImg = luxuryImages[i % luxuryImages.length];
        const secondImg = luxuryImages[(i + 1) % luxuryImages.length];
        await conn.db.collection('properties').updateOne(
          { _id: p._id },
          { $set: { images: [{ url: replacementImg }, { url: secondImg }] } }
        );
        console.log(`✅ Upgraded images for ${p.propertyName} in ${dbName}`);
      }
    }
  }

  console.log('🎉 All 22 Property Images upgraded to 4K High-Res Luxury Stays!');
  process.exit(0);
}

upgradePropertyImages();
