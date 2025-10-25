# 🔗 Backend Connection Setup

This guide shows how to connect the HRMS frontend to the live backend running on Render.

## Backend Details

- **Backend URL**: https://hrms-backend-xbz8.onrender.com
- **Service ID**: srv-d3u66s6uk2gs73dk7mrg
- **Status**: Live and Active

## Environment Variables Updated

✅ **Production Environment**: Updated to use live backend
✅ **API Configuration**: All API calls will route to Render backend
✅ **Authentication**: JWT tokens will be validated against live backend

## Files Updated

### 1. `.env` (Production)
```
VITE_API_URL=https://hrms-backend-xbz8.onrender.com
```

### 2. `.env.example` (Template)
```
VITE_API_URL=https://hrms-backend-xbz8.onrender.com
```

### 3. `VERCEL_DEPLOYMENT.md` (Documentation)
Updated deployment guide with correct backend URL.

## API Endpoints Available

The backend provides these main API endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/employees` - Employee management
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/leave` - Leave management
- `POST /api/attendance` - Attendance tracking
- `GET /api/payroll` - Payroll operations

## Testing the Connection

### 1. Start Development Server
```bash
npm run dev
```

### 2. Verify API Connection
The frontend will automatically connect to the live backend when you:
- Visit the login page
- Try to authenticate
- Access any protected routes

### 3. Check Network Tab
Open browser DevTools > Network tab to verify API calls are going to:
```
https://hrms-backend-xbz8.onrender.com/api/auth/login
https://hrms-backend-xbz8.onrender.com/api/dashboard/stats
```

## CORS Configuration

The backend is configured to accept requests from:
- Local development (http://localhost:5173)
- Vercel deployments (*.vercel.app)
- Custom domains

## Deployment to Vercel

When deploying to Vercel, make sure to set the environment variable:

### In Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add: `VITE_API_URL=https://hrms-backend-xbz8.onrender.com`
3. Redeploy

## Troubleshooting

### Connection Issues
1. **Check Backend Status**: Visit https://hrms-backend-xbz8.onrender.com/health
2. **Verify API URL**: Ensure no trailing slashes or /api prefixes
3. **Check CORS**: Verify the domain is allowed by the backend

### Authentication Issues
1. **Clear Storage**: Clear localStorage and sessionStorage
2. **Hard Refresh**: Do a hard refresh (Ctrl+Shift+R)
3. **Check Tokens**: Verify JWT tokens are being sent correctly

### API Errors
1. **Check Network Tab**: Look for failed API requests
2. **Verify Endpoints**: Ensure backend endpoints match frontend calls
3. **Check Response**: Look at error messages from backend

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
