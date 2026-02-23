const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing admin login...');
    console.log('📡 Making request to: http://localhost:5000/api/auth/login');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('No response received. Server might not be running.');
      console.log('Error details:', error.message);
    } else {
      console.log('Request setup error:', error.message);
    }
  }
}

// Run the test
testLogin();
