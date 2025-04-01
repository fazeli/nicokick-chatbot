import express, { Request, Response } from 'express';
// @ts-ignore - Netlify Function types not available
import serverless from 'serverless-http';
// @ts-ignore - Using local types
import cors from 'cors';
import { registerRoutes } from '../../routes';

// Initialize the Express app
const app = express();

// Setup middleware
app.use(express.json());

// Configure CORS for cross-origin requests
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGIN || '*',
  credentials: true,
}));

// Log requests
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register API routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: err.message
  });
});

// Export handler for Netlify Functions
export const handler = serverless(app);