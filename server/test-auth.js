const API_URL = 'http://localhost:5000/api';
const AUTH_URL = 'http://localhost:5000/api/auth';

async function post(url, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

async function testAuthFlow() {
  try {
    // 1. Login as default admin
    console.log('1. Logging in as admin...');
    const loginRes = await post(`${AUTH_URL}/login`, {
      username: 'admin',
      password: '123456'
    });
    const token = loginRes.token;
    console.log('   Success! Token received.');

    // 2. Change Username
    console.log('2. Changing username to "newadmin"...');
    await post(`${API_URL}/change-username`, {
      newUsername: 'newadmin',
      password: '123456'
    }, token);
    console.log('   Username changed successfully.');

    // 3. Login with NEW username
    console.log('3. Logging in as "newadmin"...');
    await post(`${AUTH_URL}/login`, {
      username: 'newadmin',
      password: '123456'
    });
    console.log('   Login with new username successful.');

    // 4. Change Password
    console.log('4. Changing password to "654321"...');
    await post(`${API_URL}/change-password`, {
      oldPassword: '123456',
      newPassword: '654321'
    }, token);
    console.log('   Password changed successfully.');

    // 5. Login with NEW password
    console.log('5. Logging in as "newadmin" with "654321"...');
    await post(`${AUTH_URL}/login`, {
      username: 'newadmin',
      password: '654321'
    });
    console.log('   Login with new password successful.');
    
    // Revert changes for next run or user sanity
    console.log('6. Reverting to default admin/123456...');
    await post(`${API_URL}/change-password`, {
      oldPassword: '654321',
      newPassword: '123456'
    }, token);
     await post(`${API_URL}/change-username`, {
      newUsername: 'admin',
      password: '123456'
    }, token);
    console.log('   Reverted successfully.');

    console.log('ALL TESTS PASSED.');

  } catch (error) {
    console.error('TEST FAILED:', error.message);
  }
}

testAuthFlow();