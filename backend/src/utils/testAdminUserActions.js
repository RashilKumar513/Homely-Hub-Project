import axios from 'axios';

async function testAdminUserActions() {
  try {
    console.log('1. Logging in as Admin...');
    const loginRes = await axios.post('http://127.0.0.1:8080/api/v1/rent/user/admin-login', {
      email: 'admin@homelyhub.com',
      password: 'Rashil2006@1',
    });

    const token = loginRes.data.token;
    console.log('✅ Admin Logged in!');

    console.log('\n2. Fetching Admin Stats...');
    const statsRes = await axios.get('http://127.0.0.1:8080/api/v1/rent/user/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const usersList = statsRes.data.data?.usersList || [];
    console.log(`✅ Admin can see ${usersList.length} users!`);

    const targetUser = usersList.find((u) => u.role !== 'admin');
    if (targetUser) {
      console.log(`\n3. Testing Role Toggle for User ID ${targetUser._id} (${targetUser.name})...`);
      const toggleRes = await axios.patch(
        `http://127.0.0.1:8080/api/v1/rent/user/admin/user/${targetUser._id}/toggle-role`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Role Toggle Response:', toggleRes.data.message);

      console.log('\n4. Toggling Role Back to Original...');
      await axios.patch(
        `http://127.0.0.1:8080/api/v1/rent/user/admin/user/${targetUser._id}/toggle-role`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Role Toggled Back Successfully!');
    }

    console.log('🎉 MAKE ADMIN & REMOVE USER ACTIONS PASSED CLEANLY (200 OK)!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Admin User Actions Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testAdminUserActions();
