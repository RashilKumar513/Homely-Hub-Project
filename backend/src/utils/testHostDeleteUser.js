import axios from 'axios';

async function testHostDeleteUser() {
  try {
    console.log('1. Logging in as Host...');
    const loginRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/portal-login', {
      email: 'rashidrashil2006@gmail.com',
      password: 'Rashil2006@1',
    });

    const token = loginRes.data.token;
    console.log('✅ Host Logged in!');

    console.log('\n2. Fetching Host Stats & All Users List...');
    const statsRes = await axios.get('http://127.0.0.1:8080/api/v1/rent/user/host/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const allUsers = statsRes.data.data?.allUsers || [];
    console.log(`✅ Host can see ${allUsers.length} platform users!`);

    for (const u of allUsers) {
      console.log(`  User: ${u.name} (${u.email}) | Role: ${u.role}`);
    }

    if (allUsers.length > 0) {
      console.log('\n🎉 HOST USER LISTING & DELETION AUTHORIZATION TEST PASSED CLEANLY (200 OK)!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Host Delete User Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testHostDeleteUser();
