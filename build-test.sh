#!/bin/bash

# Make this script executable with: chmod +x build-test.sh

echo "Running build test for Netlify deployment..."

# Test Vite build 
echo "Testing Vite build..."
npm run build

if [ $? -ne 0 ]; then
  echo "Vite build failed."
  exit 1
fi
echo "Vite build successful."

# Test Netlify functions build
echo "Testing Netlify functions build..."
mkdir -p netlify/functions/build
npx tsc --project tsconfig.netlify.json

if [ $? -ne 0 ]; then
  echo "Netlify functions build failed."
  exit 1
fi
echo "Netlify functions build successful."

echo "Build test completed successfully!"