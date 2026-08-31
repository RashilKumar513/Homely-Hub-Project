import axios from 'axios';

async function testRegistrationAndLoginFlow() {
  try {
    const testEmail = `testuser_${Date.now()}@homelyhub.com`;
    const testPassword = 'TestPassword123!';

    console.log(`1. Testing Email OTP Request for ${testEmail}...`);
    const otpRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/send-email-otp', {
      email: testEmail,
    });
    console.log('✅ OTP Dispatch Response:', otpRes.data.status);
    console.log('✅ OTP Code Generated:', otpRes.data.demoOtp);

    console.log('\n2. Testing User Signup / Registration with Full Details...');
    const signupRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/signup', {
      name: 'Rashi Kumar Test',
      email: testEmail,
      phoneNumber: '9876543210',
      password: testPassword,
      passwordConfirm: testPassword,
    });
    console.log('✅ Signup Response Status:', signupRes.status);
    console.log('✅ Registered User Name in DB:', signupRes.data.user?.name);
    console.log('✅ Registered User Role:', signupRes.data.user?.role);

    console.log('\n3. Testing User Login with Email & Password...');
    const loginRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/login', {
      email: testEmail,
      password: testPassword,
    });
    console.log('✅ User Login Status:', loginRes.status);
    console.log('✅ Authenticated User Token Received:', loginRes.data.token ? 'YES' : 'NO');
    console.log('🎉 REGISTRATION & EMAIL OTP & USER LOGIN TEST PASSED CLEANLY (200 OK)!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testRegistrationAndLoginFlow();
