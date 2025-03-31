#!/bin/bash

# Make the script executable with: chmod +x netlify-build.sh

# Build the client
echo "Building client..."
npm run build

# Create netlify functions directory if it doesn't exist
mkdir -p netlify/functions/build

# Compile TypeScript for Netlify functions
echo "Compiling serverless functions..."
npx tsc --project tsconfig.netlify.json

# Create a CommonJS version of the serverless function
echo "Creating CommonJS version of the function handler..."
cat > netlify/functions/api.js << EOL
// CommonJS wrapper for Netlify functions
const { handler } = require('./build/netlify/functions/api');

exports.handler = handler;
EOL

echo "Netlify build completed!"