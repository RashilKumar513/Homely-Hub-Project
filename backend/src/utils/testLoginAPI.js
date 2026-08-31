import axios from 'axios';

async function testHostLoginAPI() {
  try {
    console.log('Testing Host Login API on 127.0.0.1:8080...');
    const response = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/host-login', {
      email: 'rashidrashil2006@gmail.com',
      password: 'Rashil2006@1',
    });

    console.log('✅ Host Login HTTP Response Status:', response.status);
    console.log('✅ User Role:', response.data.user?.role);
    console.log('✅ User Email:', response.data.user?.email);
    console.log('🎉 Host Login API test PASSED SUCCESSFULLY!');

    console.log('\nTesting Admin Login API on 127.0.0.1:8080...');
    const adminRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/admin-login', {
      email: 'admin@homelyhub.com',
      password: 'Rashil2006@1',
    });

    console.log('✅ Admin Login HTTP Response Status:', adminRes.status);
    console.log('✅ User Role:', adminRes.data.user?.role);
    console.log('🎉 Admin Login API test PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Login API Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testHostLoginAPI();
