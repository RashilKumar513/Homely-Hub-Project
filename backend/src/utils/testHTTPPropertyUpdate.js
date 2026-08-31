import axios from 'axios';

async function testHTTPPropertyUpdate() {
  try {
    console.log('1. Logging in as Admin...');
    const loginRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/portal-login', {
      email: 'admin@homelyhub.com',
      password: 'Rashil2006@1',
    });

    const token = loginRes.data.token;
    console.log('✅ Admin Logged in. Token received:', token ? 'YES' : 'NO');

    const samplePropertyId = '65b79a6cb2598ba2c46874b3'; // Olive Inn

    console.log('\n2. Sending PUT request to update property...');
    const updateRes = await axios.put(
      `http://127.0.0.1:8080/api/v1/rent/listing/${samplePropertyId}`,
      {
        propertyName: 'Olive Inn Luxury Stay',
        price: 3200,
        maximumGuest: 4,
        checkInTime: '11:00',
        checkOutTime: '13:00',
        propertyType: 'House',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Update Status:', updateRes.status);
    console.log('✅ Updated Property Name in Response:', updateRes.data.data?.propertyName);
    console.log('✅ Updated Property Price in Response:', updateRes.data.data?.price);
    console.log('🎉 HTTP PROPERTY UPDATE TEST PASSED WITH 200 OK!');
    process.exit(0);
  } catch (err) {
    console.error('❌ HTTP Property Update Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testHTTPPropertyUpdate();
