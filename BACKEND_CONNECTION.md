# 🔗 Backend Connection Setup

This guide shows how to connect the HRMS frontend to the live backend running on Render.

## ✅ CORS Issue RESOLVED

**The CORS issue has been fixed!** The frontend now uses a development proxy to avoid CORS errors during local development.

### How the Solution Works:
- **Development**: Vite dev server proxies `/api` requests to the backend
- **Production**: Direct API calls to the production backend URL
- **No CORS configuration needed** for development anymore

## Backend Details

- **Backend URL**: https://hrms-backend-xbz8.onrender.com
- **Service ID**: srv-d3u66s6uk2gs73dk7mrg
- **Status**: Live and Active

## Environment Variables Updated

✅ **Production Environment**: Updated to use live backend
✅ **API Configuration**: All API calls will route to Render backend
✅ **Authentication**: JWT tokens will be validated against live backend
✅ **CORS Solution**: Development proxy eliminates CORS issues

## Files Updated

### 1. `.env` (Production)
```
# Production API URL (used when not in development mode)
VITE_API_URL=https://hrms-backend-xbz8.onrender.com

# Note: During development, /api requests are proxied to the backend
# See vite.config.js for proxy configuration
```

### 2. `.env.example` (Template)
```
VITE_API_URL=https://hrms-backend-xbz8.onrender.com

# Development Setup:
# - During development (npm run dev), API requests are proxied to avoid CORS issues
# - The proxy configuration in vite.config.js forwards /api requests to the backend
# - No CORS configuration needed for development
```

### 3. `vite.config.js` (Development Proxy)
```javascript
proxy: {
  '/api': {
    target: 'https://hrms-backend-xbz8.onrender.com',
    changeOrigin: true,
    secure: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### 4. `src/api/axios.js` (Smart Base URL)
```javascript
const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000'),
  // ...
});
```

### 3. `VERCEL_DEPLOYMENT.md` (Documentation)
Updated deployment guide with correct backend URL.

## Deployment to Vercel

When deploying to Vercel, make sure to set the environment variable:

### In Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add: `VITE_API_URL=https://hrms-backend-xbz8.onrender.com`
3. Redeploy

## Troubleshooting

### Connection Issues (Development)
1. **Check Development Server**: Ensure `npm run dev` is running on port 5173
2. **Verify Proxy**: Check that the proxy configuration in `vite.config.js` is correct
3. **Backend Status**: Visit https://hrms-backend-xbz8.onrender.com/health in a new tab
4. **Network Tab**: Look for failed API requests in browser DevTools

### Connection Issues (Production)
1. **Environment Variables**: Verify `VITE_API_URL` is set correctly in Vercel
2. **Backend URL**: Ensure the production backend is accessible
3. **CORS Headers**: Check that the backend allows your production domain

### Authentication Issues
1. **Clear Storage**: Clear localStorage and sessionStorage
2. **Hard Refresh**: Do a hard refresh (Ctrl+Shift+R)
3. **Check Tokens**: Verify JWT tokens are being sent correctly
4. **Login Test**: Try logging in with known credentials

### API Errors
1. **Check Network Tab**: Look for failed API requests
2. **Verify Endpoints**: Ensure backend endpoints match frontend calls
3. **Check Response**: Look at error messages from backend
4. **Status Codes**: Check HTTP status codes for clues

### CORS Issues (If They Reappear)
If you encounter CORS errors again:
1. **Development**: The proxy should handle this automatically
2. **Production**: Ensure your domain is whitelisted in the backend
3. **Check Headers**: Verify the backend sends proper CORS headers

## Backend CORS Configuration

If you need to modify the backend CORS settings, update the backend server configuration to allow:

```javascript
// Example CORS configuration for backend
const corsOptions = {
  origin: [
    'http://localhost:5173',        // Development
    'http://localhost:3000',        // Alternative dev port
    /\.vercel\.app$/,               // All Vercel deployments
    'https://yourdomain.com'        // Your production domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Next Steps

1. ✅ **Test Login**: Try logging in with existing credentials
2. ✅ **Test Dashboard**: Verify dashboard loads correctly
3. ✅ **Test Features**: Check employee management, attendance, etc.
4. 🚀 **Deploy to Vercel**: Follow VERCEL_DEPLOYMENT.md for deployment

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify the backend is responding at the URL above
3. Check the Vercel deployment logs if deployed
4. Ensure environment variables are set correctly
