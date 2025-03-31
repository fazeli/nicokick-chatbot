// Test script for the Netlify function
const { handler } = require('./api');

// Mock a request
const mockRequest = {
  httpMethod: 'GET',
  path: '/api/faq/topics',
  headers: {
    'content-type': 'application/json'
  },
  body: null
};

// Test the function
(async () => {
  try {
    console.log('Testing Netlify function...');
    const response = await handler(mockRequest);
    console.log('Response status code:', response.statusCode);
    console.log('Response body:', response.body);
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
})();