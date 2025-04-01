# Nicokick Chatbot

An AI-powered customer service chatbot that provides intelligent, context-aware support through a comprehensive FAQ knowledge base.

## Project Structure

This project is a full-stack application with:

- React frontend with TypeScript
- Node.js/Express backend with TypeScript
- AI-powered embedding search using Hugging Face transformers
- Responsive web design

## Deployment Instructions for Netlify

This project needs to be deployed as two separate applications on Netlify:

### Frontend Deployment

1. Create a new Netlify site from the GitHub repository
2. Set the base directory to `client`
3. Set the build command to:
   ```
   npm install && npm run build
   ```
4. Set the publish directory to `dist`
5. Set environment variables:
   - `VITE_API_URL`: URL of your deployed backend (e.g., `https://your-backend.netlify.app/.netlify/functions/api`)

### Backend Deployment

1. Create a new Netlify site from the same GitHub repository
2. Set the base directory to `server`
3. Set the build command to:
   ```
   npm install && npm run build
   ```
4. Set the publish directory to `dist`
5. Make sure to add the Netlify Functions configuration:
   - The function directory should be set to `netlify/functions`
6. Set environment variables:
   - `CORS_ALLOWED_ORIGIN`: URL of your deployed frontend (e.g., `https://your-frontend.netlify.app`)

### Pre-deployment Steps

Before deploying, make sure to set up the repository correctly:

1. Install the required dependencies in the client and server directories:
   ```
   # Navigate to client directory
   cd client
   npm install
   
   # Navigate to server directory
   cd server
   npm install
   ```

2. Test the build process locally:
   ```
   # Build the client
   cd client
   npm run build
   
   # Build the server
   cd server
   npm run build
   ```

3. Commit all changes to your GitHub repository and push to the branch you'll be deploying from.

## Development Setup

To run the project locally:

1. Install dependencies in both the client and server directories:
   ```
   # In the client directory
   npm install
   
   # In the server directory
   npm install
   ```

2. Start the development server:
   ```
   # In the root directory
   npm run dev
   ```

3. The application will be available at http://localhost:5000

## Features

- Intelligent chatbot with vector embedding search
- FAQ management admin interface
- Text-to-speech accessibility features
- Order status tracking and product information
- Human support request handling