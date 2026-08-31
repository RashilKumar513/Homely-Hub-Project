import axios from 'axios';

async function testPortalAPI() {
  try {
    console.log('1. Testing Unified Portal Login with Host account...');
    const hostRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/portal-login', {
      email: 'rashidrashil2006@gmail.com',
      password: 'Rashil2006@1',
    });
    console.log('   Status:', hostRes.status, '| Role:', hostRes.data.user?.role);

    console.log('\n2. Testing Unified Portal Login with Admin account...');
    const adminRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/portal-login', {
      email: 'admin@homelyhub.com',
      password: 'Rashil2006@1',
    });
    console.log('   Status:', adminRes.status, '| Role:', adminRes.data.user?.role);

    console.log('\n🎉 ALL PORTAL LOGIN TESTS PASSED CLEANLY (HTTP 200)!');
    process.exit(0);
  } catch (err) {
    console.error('Portal Login test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPortalAPI();
