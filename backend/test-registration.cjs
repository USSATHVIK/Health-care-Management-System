const axios = require('axios');

// Test registration data
const testUser = {
  name: "Test User",
  email: "test@gmail.com",
  password: "password123",
  confirmPassword: "password123",
  role: "user",
  blockchainWallet: "123456789012"
};

async function testRegistration() {
  try {
    console.log('Attempting to register user...');
    console.log('Registration data:', testUser);
    
    const response = await axios.post('http://localhost:5001/api/auth/register', testUser);
    console.log('Registration response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error during registration:', error.response.data);
      console.error('Status code:', error.response.status);
    } else {
      console.error('Error during registration:', error.message);
    }
  }
}

testRegistration();