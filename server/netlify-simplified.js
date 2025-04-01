#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Working directory: ${process.cwd()}`);

// Create dist and functions directories
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

if (!fs.existsSync('dist/netlify/functions')) {
  fs.mkdirSync('dist/netlify/functions', { recursive: true });
}

// Create a minimal function file directly
const functionCode = `
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

// Initialize the Express app
const app = express();

// Setup middleware
app.use(express.json());

// Configure CORS for cross-origin requests
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGIN || '*',
  credentials: true,
}));

// Basic routes
app.get('/.netlify/functions/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

app.get('/.netlify/functions/api/welcome', (_req, res) => {
  res.json({
    message: 'Welcome to the Nicokick Chatbot API',
    endpoints: [
      { path: '/health', description: 'Health check endpoint' },
      { path: '/welcome', description: 'This welcome message' },
    ]
  });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: err.message
  });
});

// Export handler for Netlify Functions
export const handler = serverless(app);
`;

console.log('Creating simplified function file...');
fs.writeFileSync('dist/netlify/functions/api.js', functionCode);

console.log('Build completed successfully!');