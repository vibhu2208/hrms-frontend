/**
 * Centralized API Configuration
 * Automatically detects environment and sets appropriate API base URL
 */

const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
};

// Detect current environment
const getCurrentEnvironment = () => {
  // Check if we're in Vite dev mode
  if (import.meta.env.DEV) {
    return ENV.DEVELOPMENT;
  }
  
  // Check if we're in production
  if (import.meta.env.PROD) {
    return ENV.PRODUCTION;
  }
  
  return ENV.PRODUCTION;
};

// API Base URLs for different environments
const API_BASE_URLS = {
  [ENV.DEVELOPMENT]: '/api', // Proxied through Vite dev server
  [ENV.PRODUCTION]: import.meta.env.VITE_API_URL || 'https://hrms-backend-xbz8.onrender.com',
  [ENV.STAGING]: import.meta.env.VITE_API_URL || 'https://hrms-backend-xbz8.onrender.com'
};

// Frontend URLs for different environments
const FRONTEND_URLS = {
  [ENV.DEVELOPMENT]: 'http://localhost:5173',
  [ENV.PRODUCTION]: import.meta.env.VITE_FRONTEND_URL || 'https://hrms-frontend-blush.vercel.app',
  [ENV.STAGING]: import.meta.env.VITE_FRONTEND_URL || 'https://hrms-frontend-blush.vercel.app'
};

// Get current environment
const currentEnv = getCurrentEnvironment();

// Export configuration
export const config = {
  env: currentEnv,
  isDevelopment: currentEnv === ENV.DEVELOPMENT,
  isProduction: currentEnv === ENV.PRODUCTION,
  isStaging: currentEnv === ENV.STAGING,
  
  // API Configuration
  apiBaseUrl: API_BASE_URLS[currentEnv],
  frontendUrl: FRONTEND_URLS[currentEnv],
  
  // Timeout settings
  apiTimeout: 30000, // 30 seconds
  
  // Feature flags (can be controlled via env variables)
  features: {
    aiAnalysis: import.meta.env.VITE_ENABLE_AI_ANALYSIS !== 'false',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  }
};

// Log configuration in development
if (config.isDevelopment) {
  console.log('🔧 API Configuration:', {
    environment: config.env,
    apiBaseUrl: config.apiBaseUrl,
    frontendUrl: config.frontendUrl
  });
}

export default config;
