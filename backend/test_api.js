const axios = require('axios');

async function testApi() {
  try {
    // We don't have an auth token easily available, but let's see if we can get anything
    // or if the dev server allows local requests
    const url = 'http://localhost:5000/api/workouts/exercises';
    console.log(`Fetching from ${url}...`);
    
    // Note: This will likely fail due to lack of auth token if 'auth' middleware is strict.
    // However, I can check the backend logs if I could see them.
    // Since I can't see the backend logs directly, I'll try to bypass auth for testing if possible.
    
    const response = await axios.get(url).catch(err => err.response);
    if (response) {
      console.log('Status:', response.status);
      console.log('Data sample:', JSON.stringify(response.data).substring(0, 500));
    } else {
      console.log('No response');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testApi();
