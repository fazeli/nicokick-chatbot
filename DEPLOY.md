# Netlify Deployment Guide

This guide provides step-by-step instructions for deploying the Nicokick Chatbot application to Netlify.

## Prerequisites

- A GitHub account with this repository pushed to it
- A Netlify account
- Basic familiarity with Netlify deployment process

## Step 1: Deploy the Backend

1. Log in to your Netlify dashboard
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure the deployment with the following settings:
   - **Base directory**: `server`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Configure environment variables:
   - Click "Advanced build settings"
   - Add the following environment variables:
     - `NODE_VERSION`: `18`
6. Click "Deploy site"
7. Once deployed, rename the site to something like "nicokick-chatbot-api" in site settings
8. Note the URL of your deployed API (e.g., `https://nicokick-chatbot-api.netlify.app/.netlify/functions/api`)

## Step 2: Deploy the Frontend

1. Go back to your Netlify dashboard
2. Click "Add new site" → "Import an existing project"
3. Connect to the same GitHub repository
4. Configure the deployment with the following settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. Configure environment variables:
   - Click "Advanced build settings"
   - Add the following environment variables:
     - `VITE_API_URL`: `https://nicokick-chatbot-api.netlify.app/.netlify/functions/api` (Use your actual backend URL)
     - `NODE_VERSION`: `18`
6. Click "Deploy site"
7. Once deployed, rename the site to something like "nicokick-chatbot" in site settings

## Step 3: Configure CORS for the Backend

1. Go back to your backend site in Netlify
2. Go to "Site settings" → "Environment variables"
3. Add a new environment variable:
   - Key: `CORS_ALLOWED_ORIGIN`
   - Value: Your frontend URL (e.g., `https://nicokick-chatbot.netlify.app`)
4. Trigger a new deploy from the "Deploys" tab

## Step 4: Test Your Deployment

1. Visit your frontend URL (e.g., `https://nicokick-chatbot.netlify.app`)
2. Test the chat functionality to ensure it's communicating with the backend
3. Try the admin interface to verify that FAQ management works correctly

## Troubleshooting

If you encounter issues with your deployment:

1. **CORS errors**: Make sure the `CORS_ALLOWED_ORIGIN` variable is set correctly on the backend
2. **API connection errors**: Verify that the `VITE_API_URL` is set correctly on the frontend
3. **Server errors**: Check the function logs in your Netlify backend site

For more detailed logs, go to the "Functions" tab in your Netlify backend site dashboard.