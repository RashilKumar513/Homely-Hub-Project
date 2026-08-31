import axios from 'axios';

async function testHostReply() {
  try {
    console.log('1. Logging in as Host...');
    const loginRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/portal-login', {
      email: 'rashidrashil2006@gmail.com',
      password: 'Rashil2006@1',
    });

    const token = loginRes.data.token;
    console.log('✅ Host Logged in! Token received:', token ? 'YES' : 'NO');

    console.log('\n2. Fetching Host Stats & Inquiries...');
    const statsRes = await axios.get('http://127.0.0.1:8080/api/v1/rent/user/host/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const inquiries = statsRes.data.data?.hostInquiries || [];
    console.log(`✅ Found ${inquiries.length} Host Inquiries.`);

    if (inquiries.length > 0) {
      const targetInquiry = inquiries[0];
      console.log(`\n3. Replying to Inquiry ID ${targetInquiry._id}...`);
      const replyRes = await axios.patch(
        `http://127.0.0.1:8080/api/v1/rent/user/host/inquiries/${targetInquiry._id}`,
        { replyMessage: 'Yes, sure! Late check-in is accommodated smoothly.' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Host Reply Status:', replyRes.status);
      console.log('✅ Updated Inquiry Reply in DB:', replyRes.data.data?.replyMessage);
      console.log('🎉 HOST INQUIRY REPLY TEST PASSED CLEANLY (200 OK)!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Host Reply Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testHostReply();
