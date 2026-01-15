# Centralized API Configuration

## Overview

The HRMS frontend uses a **centralized API configuration** that automatically switches between local development and production environments. No manual configuration changes are needed when switching between environments.

## How It Works

### 🔧 Development Mode (`npm run dev`)

- **Frontend URL**: `http://localhost:5173`
- **API Calls**: `/api` → proxied to `http://localhost:5001`
- **Configuration**: Automatic via Vite proxy
- **CORS**: No issues (handled by proxy)
- **Environment Variables**: Not required for local development

### 🚀 Production Mode (`npm run build`)

- **Frontend URL**: Your deployment URL (e.g., Vercel)
- **API Calls**: Uses `VITE_API_URL` environment variable
- **Configuration**: Set in deployment platform
- **Default Fallback**: `https://hrms-backend-xbz8.onrender.com`

## File Structure

```
hrms-frontend/
├── src/
│   ├── config/
│   │   └── api.config.js          # Centralized configuration
│   └── api/
│       ├── axios.js                # Axios instance with interceptors
│       ├── employeeDashboard.js    # Employee APIs
│       ├── documentUpload.js       # Document APIs
│       ├── tenantRoles.js          # Tenant role APIs
│       ├── billing.js              # Billing APIs
│       ├── hr.js                   # HR APIs
│       ├── superAdmin.js           # Super admin APIs
│       └── user.js                 # User APIs
├── vite.config.js                  # Vite proxy configuration
├── .env                            # Local development config
└── .env.example                    # Production template
```

## Configuration Files

### 1. `src/config/api.config.js`

**Purpose**: Centralized configuration that detects environment and sets appropriate API URLs.

**Key Features**:
- Automatic environment detection
- Environment-specific API URLs
- Timeout settings
- Feature flags
- Development logging

**Exports**:
```javascript
export const config = {
  env: 'development' | 'production' | 'staging',
  isDevelopment: boolean,
  isProduction: boolean,
  isStaging: boolean,
  apiBaseUrl: string,
  frontendUrl: string,
  apiTimeout: number,
  features: {
    aiAnalysis: boolean,
    notifications: boolean
  }
}
```

### 2. `src/api/axios.js`

**Purpose**: Configured axios instance with interceptors.

**Features**:
- Automatic token injection
- Request/response interceptors
- Automatic logout on 401 errors
- Uses centralized config

**Usage**:
```javascript
import api from './axios';

// All API calls use this instance
const response = await api.get('/endpoint');
```

### 3. `vite.config.js`

**Purpose**: Development proxy configuration.

**Proxy Setup**:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
    secure: false
  }
}
```

## Environment Variables

### Local Development (`.env`)

```bash
# Google OAuth (required)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# DO NOT set VITE_API_URL for local development
# The proxy handles it automatically
```

### Production (`.env.example` / Deployment Platform)

```bash
# Required for production
VITE_API_URL=https://hrms-backend-xbz8.onrender.com

# Optional
VITE_FRONTEND_URL=https://hrms-frontend-blush.vercel.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Feature flags (optional)
VITE_ENABLE_AI_ANALYSIS=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Usage Examples

### Creating API Functions

All API files should import and use the centralized `api` instance:

```javascript
import api from './axios';

// ✅ Correct - Uses centralized config
export const getEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

// ❌ Wrong - Don't create new axios instances
import axios from 'axios';
const response = await axios.get('http://localhost:5001/api/employees');
```

### API Call Patterns

```javascript
// GET request
const data = await api.get('/endpoint', { params: { id: 1 } });

// POST request
const data = await api.post('/endpoint', { name: 'John' });

// PUT request
const data = await api.put('/endpoint/1', { name: 'Jane' });

// DELETE request
const data = await api.delete('/endpoint/1');

// File upload
const formData = new FormData();
formData.append('file', file);
const data = await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// File download
const blob = await api.get('/download/1', { responseType: 'blob' });
```

## Deployment Guide

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel

2. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     VITE_API_URL = https://hrms-backend-xbz8.onrender.com
     VITE_GOOGLE_CLIENT_ID = your-google-client-id
     ```

3. **Deploy**: Push to main branch or click "Deploy"

4. **Verify**: Check browser console for API configuration log

### Netlify Deployment

1. **Connect Repository**: Link your GitHub repository to Netlify

2. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add the same variables as Vercel

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Deploy**: Push to main branch or click "Deploy"

## Troubleshooting

### Issue: API calls fail in development

**Solution**: 
- Ensure backend is running on `http://localhost:5001`
- Check `vite.config.js` proxy configuration
- Restart dev server: `npm run dev`

### Issue: API calls fail in production

**Solution**:
- Verify `VITE_API_URL` is set in deployment platform
- Check browser console for actual API URL being used
- Ensure backend URL is accessible

### Issue: CORS errors

**Solution**:
- **Development**: Should not happen (proxy handles it)
- **Production**: Backend must allow your frontend URL in CORS settings

### Issue: 401 Unauthorized errors

**Solution**:
- Check if token is stored in localStorage
- Verify token is not expired
- Check axios interceptor is adding Authorization header

## Best Practices

1. **Never hardcode URLs**: Always use the centralized config
2. **Use the shared axios instance**: Import from `./axios.js`
3. **Handle errors properly**: Use try-catch blocks
4. **Keep API files organized**: Group related endpoints
5. **Document API functions**: Add JSDoc comments
6. **Use TypeScript types**: If using TypeScript, define response types

## Environment Detection

The system automatically detects the environment:

```javascript
// Development
import.meta.env.DEV === true
→ Uses '/api' (proxied to localhost:5001)

// Production
import.meta.env.PROD === true
→ Uses VITE_API_URL or default production URL

// Staging
import.meta.env.MODE === 'staging'
→ Uses staging URL
```

## Security Notes

1. **Tokens**: Stored in localStorage, automatically added to requests
2. **Auto-logout**: 401 responses trigger automatic logout
3. **HTTPS**: Production always uses HTTPS
4. **Environment Variables**: Never commit `.env` to git
5. **API Keys**: Use environment variables, never hardcode

## Summary

✅ **Automatic environment switching**  
✅ **No manual configuration needed**  
✅ **Centralized API management**  
✅ **Consistent error handling**  
✅ **Development proxy for CORS-free development**  
✅ **Production-ready with environment variables**

---

**Last Updated**: January 2026  
**Maintained By**: HRMS Development Team
