/**
 * Utility functions for Netlify deployment
 */

/**
 * Determine the base URL for API requests based on the current environment
 * @returns The base URL for API requests
 */
export function getApiBaseUrl(): string {
  // Check if we're in a Netlify production environment
  const isNetlifyProduction = import.meta.env.VITE_NETLIFY_PRODUCTION === 'true';
  
  if (isNetlifyProduction) {
    // In Netlify production, use the Netlify function path
    return '/.netlify/functions/api';
  } else {
    // In development or local Netlify dev, use the standard API path
    return '/api';
  }
}

/**
 * Transform an API endpoint to use the correct base URL
 * @param endpoint The API endpoint path (e.g., '/chat/init')
 * @returns The full API URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  
  // Ensure endpoint starts with '/'
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // For Netlify production, we're using the function path directly
  if (baseUrl === '/.netlify/functions/api') {
    return `${baseUrl}${normalizedEndpoint}`;
  }
  
  // For normal API paths, just combine them
  return `${baseUrl}${normalizedEndpoint}`;
}