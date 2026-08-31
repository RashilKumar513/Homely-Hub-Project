import axios from 'axios';

async function testDuplicateReplyLock() {
  try {
    console.log('1. Logging in as Host...');
    const loginRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/portal-login', {
      email: 'rashidrashil2006@gmail.com',
      password: 'Rashil2006@1',
    });

    const token = loginRes.data.token;
    const statsRes = await axios.get('http://127.0.0.1:8080/api/v1/rent/user/host/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const inquiries = statsRes.data.data?.hostInquiries || [];
    console.log('Found inquiries:', inquiries.length);

    for (const inq of inquiries) {
      console.log(`Inquiry ID: ${inq._id} | Status: ${inq.status} | Reply: "${inq.replyMessage}"`);
    }

    const resolvedInquiry = inquiries.find((i) => i.status === 'Resolved' || (i.replyMessage && i.replyMessage.length > 0));

    if (resolvedInquiry) {
      console.log(`\n2. Attempting second reply to already resolved Inquiry ID ${resolvedInquiry._id}...`);
      try {
        await axios.patch(
          `http://127.0.0.1:8080/api/v1/rent/user/host/inquiries/${resolvedInquiry._id}`,
          { replyMessage: 'Second duplicate reply attempt...' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.error('❌ FAILED: Duplicate reply was allowed!');
        process.exit(1);
      } catch (err) {
        console.log('✅ PASS: Duplicate reply blocked cleanly with error message:');
        console.log('  ', err.response?.data?.message || err.message);
      }
    } else {
      console.log('No resolved inquiry found to test.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
}

testDuplicateReplyLock();
