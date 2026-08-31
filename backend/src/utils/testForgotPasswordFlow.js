import axios from 'axios';

async function testForgotPasswordFlow() {
  try {
    console.log('1. Requesting password reset email for rashidrashil2006@gmail.com...');
    const res = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/forgotPassword', {
      email: 'rashidrashil2006@gmail.com',
    });

    console.log('✅ Response Status:', res.status);
    console.log('✅ Response Message:', res.data.message);
    if (res.data.message === 'reset link has been sent to email') {
      console.log('🎉 FORGOT PASSWORD TEST PASSED CLEANLY WITH EXACT POPUP MESSAGE!');
    } else {
      console.log('Received message:', res.data);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Forgot Password Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testForgotPasswordFlow();
