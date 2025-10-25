# 🚀 Vercel Deployment Guide

This HRMS frontend is configured for deployment on Vercel. Follow these steps to deploy:

## Pre-deployment Checklist

✅ **Build Configuration**: Vite build optimized for production
✅ **Routing**: SPA routing configured for React Router
✅ **Environment Variables**: Template provided
✅ **Security Headers**: Basic security headers configured

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Set Environment Variables
In your Vercel dashboard, go to Project Settings > Environment Variables and add:

```
VITE_API_URL=https://hrms-backend-xbz8.onrender.com
```

## Files Created/Modified for Vercel

- **`vercel.json`** - Vercel configuration with SPA routing
- **`vite.config.js`** - Production build optimizations
- **`.env.example`** - Environment variables template
- **`public/_redirects`** - Backup SPA routing configuration
- **`public/_headers`** - Security headers

## Production Optimizations

✅ **Code Splitting**: Vendor libraries separated into chunks
✅ **Minification**: Enabled by default with Vite
✅ **Source Maps**: Disabled for production
✅ **Security Headers**: Basic security headers configured

## Troubleshooting

### 404 on Direct URLs
The SPA routing should handle this automatically, but if you get 404s:
1. Check that `vercel.json` rewrites are working
2. Verify React Router configuration

### Build Failures
1. Ensure all dependencies are compatible
2. Check Node.js version (16+ required)
3. Verify environment variables are set correctly

### Environment Variables Not Working
1. Make sure variables are prefixed with `VITE_`
2. Redeploy after adding/changing variables
3. Check Vercel function logs for errors

## Post-deployment

1. Test all routes work correctly
2. Verify API calls are going to the correct backend
3. Check that authentication flow works
4. Test on mobile devices

## Support

For issues specific to this deployment:
- Check Vercel deployment logs
- Verify build output in `dist/` folder
- Test with `npm run preview` locally
