import axios from 'axios';

async function testAuronexLogin() {
  try {
    const email = 'auronexcommunity@gmail.com';
    const password = 'AuronexPassword123!';

    console.log('1. Sending OTP to auronexcommunity@gmail.com...');
    const otpRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/send-email-otp', { email });
    const demoOtp = otpRes.data.demoOtp;
    console.log('✅ OTP Code Received:', demoOtp);

    console.log('\n2. Registering auronexcommunity@gmail.com with custom password and OTP...');
    const signupRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/signup', {
      name: 'AURONEX COMMUNITY',
      email,
      phoneNumber: '7010678797',
      password,
      passwordConfirm: password,
      otp: demoOtp,
    });
    console.log('✅ Signup Response Status:', signupRes.status);
    console.log('✅ Registered User Name in DB:', signupRes.data.user?.name);

    console.log('\n3. Logging in on /login with email & custom password...');
    const loginRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/login', {
      email,
      password,
    });
    console.log('✅ User Login Status:', loginRes.status);
    console.log('✅ Token Received:', loginRes.data.token ? 'YES' : 'NO');
    console.log('🎉 AURONEX USER REGISTRATION & LOGIN TEST PASSED CLEANLY (200 OK)!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testAuronexLogin();
