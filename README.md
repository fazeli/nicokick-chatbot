# Nicokick AI Chatbot

An AI-powered customer service chatbot for Nicokick that provides intelligent, context-aware support through a comprehensive FAQ knowledge base.

## Features

- AI-enhanced customer support chatbot
- Semantic search using embeddings from Hugging Face transformers
- Order tracking capabilities 
- Product information lookup
- Admin interface for managing FAQ content
- Accessibility features with text-to-speech functionality

## Tech Stack

- React/TypeScript frontend
- Express.js backend
- Hugging Face transformers for AI capabilities
- In-memory database with persistence
- Tailwind CSS and Shadcn/UI for styling

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open http://localhost:5000 in your browser

## Deployment to Netlify

### Option 1: Automatic Deployment (GitHub Integration)

1. Push your code to a GitHub repository
2. Connect your repository to Netlify
3. Configure the build settings in Netlify:
   - Build command: `./netlify-build.sh`
   - Publish directory: `client/dist`
4. Deploy your site

### Option 2: Manual Deployment (Netlify CLI)

1. Install Netlify CLI:
   ```
   npm install -g netlify-cli
   ```
2. Login to Netlify:
   ```
   netlify login
   ```
3. Build the project:
   ```
   ./netlify-build.sh
   ```
4. Deploy to Netlify:
   ```
   netlify deploy --prod
   ```

## Important Notes

- The application uses Hugging Face's Transformers.js for the embedding model
- All FAQ content is stored in-memory but persisted to files
- The chatbot provides intelligent responses using both keyword matching and semantic similarity
- Admin interface allows non-technical staff to manage FAQ content

## Environment Variables

No environment variables are required for basic functionality. All services run locally without external dependencies.

## License

MIT