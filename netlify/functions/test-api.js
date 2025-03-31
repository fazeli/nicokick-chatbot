// Simple Netlify test function
exports.handler = async function(event, context) {
  // Parse the incoming request
  const path = event.path;
  const method = event.httpMethod;
  
  console.log(`Received ${method} request to ${path}`);
  
  // Return mock data based on the endpoint
  if (path.includes('/api/faq/topics')) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        "Shipping Policy",
        "Return Policy",
        "Product Information",
        "Account & Orders"
      ])
    };
  }
  
  if (path.includes('/api/chat/init')) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          id: 1,
          sessionId: "test-session",
          content: "Welcome to Nicokick customer support! How can I help you today?",
          isUser: false,
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          sessionId: "test-session",
          content: "You can ask about: Order status, Product information, Shipping, or Returns",
          isUser: false,
          timestamp: new Date().toISOString()
        }
      ])
    };
  }
  
  // Default response for unhandled endpoints
  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Endpoint not found" })
  };
};