# Public API 404 Error Fix

## Issue
The careers page was getting 404 errors when trying to fetch public job listings:
- `GET https://hrms-backend-xbz8.onrender.com/public/jobs` → 404
- `GET https://hrms-backend-xbz8.onrender.com/public/jobs/stats` → 404

## Root Cause
The `CareersPage.jsx` and `ResumeSubmissionModal.jsx` were directly using `import.meta.env.VITE_API_URL` which resulted in:
- Production URL: `https://hrms-backend-xbz8.onrender.com/public/jobs` ❌ (missing `/api` prefix)
- Expected URL: `https://hrms-backend-xbz8.onrender.com/api/public/jobs` ✅

The backend routes are registered at `/api/public/jobs` (see `app.js` line 64), but the frontend was calling `/public/jobs` directly.

## Solution
Updated both files to use the centralized `api.config.js` which properly handles the `/api` prefix:

### Files Modified:
1. **`frontend/src/pages/Public/CareersPage.jsx`**
   - Changed: `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';`
   - To: `const API_BASE_URL = config.apiBaseUrl;`
   - Added import: `import { config } from '../../config/api.config';`

2. **`frontend/src/components/ResumeSubmissionModal.jsx`**
   - Changed: `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';`
   - To: `const API_BASE_URL = config.apiBaseUrl;`
   - Added import: `import { config } from '../config/api.config';`

## How It Works Now

### Development Mode (`npm run dev`):
- `config.apiBaseUrl` = `/api`
- Requests go to `/api/public/jobs`
- Vite proxy forwards to `http://localhost:5000/api/public/jobs`

### Production Mode (deployed):
- `config.apiBaseUrl` = `https://hrms-backend-xbz8.onrender.com/api`
- Requests go to `https://hrms-backend-xbz8.onrender.com/api/public/jobs`
- Direct connection to backend

## Backend Routes (Reference)
Located in `hrms-backend/src/app.js`:
```javascript
// Public API Routes (no authentication required)
app.use('/api/public/jobs', publicJobRoutes);
```

Public job routes in `hrms-backend/src/routes/publicJobRoutes.js`:
- `GET /api/public/jobs` - Get all active jobs
- `GET /api/public/jobs/stats` - Get job statistics
- `GET /api/public/jobs/:id` - Get single job details
- `POST /api/public/jobs/:id/apply` - Submit job application
- `POST /api/public/jobs/talent-pool/submit` - Submit resume to talent pool

## Testing
After this fix, the careers page should:
1. ✅ Load job listings successfully
2. ✅ Display job statistics (total jobs, departments, locations)
3. ✅ Allow job applications
4. ✅ Allow resume submissions to talent pool

## Best Practice
Always use the centralized `config.apiBaseUrl` from `src/config/api.config.js` instead of directly accessing `import.meta.env.VITE_API_URL` to ensure proper API prefix handling across all environments.
