/**
 * Quick test script to verify Google Maps API is working
 * Run: node test-api.js
 */

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

console.log('🔍 Testing Google Maps API Setup...\n');

if (!API_KEY || API_KEY === 'your_key_here') {
  console.log('❌ API Key not found or not set in .env file');
  console.log('   Please add: GOOGLE_MAPS_API_KEY=your_actual_key');
  process.exit(1);
}

console.log('✅ API Key found in .env file');
console.log(`   Key: ${API_KEY.substring(0, 20)}...\n`);

// Test Directions API
console.log('🧪 Testing Directions API...');
axios.get('https://maps.googleapis.com/maps/api/directions/json', {
  params: {
    origin: '40.7128,-74.0060', // New York
    destination: '40.7580,-73.9855', // Nearby location
    mode: 'driving',
    key: API_KEY
  }
})
.then(response => {
  if (response.data.status === 'OK') {
    console.log('✅ Directions API: Working!');
    console.log(`   Distance: ${response.data.routes[0].legs[0].distance.text}`);
    console.log(`   Duration: ${response.data.routes[0].legs[0].duration.text}\n`);
  } else {
    console.log(`❌ Directions API Error: ${response.data.status}`);
    console.log(`   Message: ${response.data.error_message || 'Unknown error'}\n`);
  }
  
  // Test Places API
  console.log('🧪 Testing Places API...');
  return axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
    params: {
      location: '40.7128,-74.0060',
      radius: 100,
      type: 'parking',
      key: API_KEY
    }
  });
})
.then(response => {
  if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
    console.log('✅ Places API: Working!');
    if (response.data.results.length > 0) {
      console.log(`   Found ${response.data.results.length} parking locations\n`);
    } else {
      console.log('   No parking found (this is OK - depends on location)\n');
    }
  } else {
    console.log(`❌ Places API Error: ${response.data.status}`);
    console.log(`   Message: ${response.data.error_message || 'Unknown error'}\n`);
  }
  
  console.log('🎉 API Setup Complete!');
  console.log('   Your server is ready to use Google Maps features.\n');
})
.catch(error => {
  console.log('❌ API Test Failed:');
  console.log(`   ${error.message}\n`);
  if (error.response) {
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
  }
});

