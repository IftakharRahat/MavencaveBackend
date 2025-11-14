# Vercel Deployment Guide - API Status

## Current Status

✅ **Root Endpoint Working**: `https://mavencave-backend.vercel.app/` returns "MAVENCAVE API is running"

❌ **API Routes Not Working**: All `/api/v1/*` routes return 404 errors

## Problem

Vercel is not routing API requests through your Express app. The serverless function is deployed, but Vercel needs a configuration file to route all requests to it.

## Solution

I've created a `vercel.json` file for you. After deploying this file, all routes should work.

### Steps to Fix:

1. **Commit and push the `vercel.json` file** to your repository:
   ```bash
   git add vercel.json
   git commit -m "Add Vercel configuration for API routing"
   git push
   ```

2. **Vercel will automatically redeploy** when you push the changes.

3. **Wait for deployment to complete** (usually 1-2 minutes).

4. **Test the API again** using the test script:
   ```bash
   node test-apis.js
   ```

## Alternative: Manual Vercel Configuration

If the `vercel.json` file doesn't work automatically, you can configure it in the Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **General**
3. Under **Build & Development Settings**, ensure:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty or `npm install`)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

4. Go to **Settings** → **Functions**
5. Ensure the function is set to handle all routes

## Testing Your Deployed API

### Quick Test Commands:

**Test Root Endpoint:**
```powershell
Invoke-WebRequest -Uri "https://mavencave-backend.vercel.app/" -Method GET
```

**Test API Endpoint (after fix):**
```powershell
Invoke-WebRequest -Uri "https://mavencave-backend.vercel.app/api/v1/blogs" -Method GET
```

**Test with Authentication:**
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN_HERE" }
Invoke-WebRequest -Uri "https://mavencave-backend.vercel.app/api/v1/auth/me" -Method GET -Headers $headers
```

### Using the Test Script:

The `test-apis.js` script is already configured to test your deployed API:

```bash
node test-apis.js
```

To test localhost instead:
```bash
$env:API_URL="http://localhost:5000"; node test-apis.js
```

## Expected API Endpoints

Once fixed, these endpoints should work:

### Public Endpoints:
- `GET /api/v1/blogs` - Get all blogs
- `GET /api/v1/events` - Get all events  
- `GET /api/v1/exams` - List exams
- `GET /api/v1/about-us` - Get about us
- `GET /api/v1/banners` - Get ad banners
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user

### Protected Endpoints (require authentication):
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/courses` - Create course
- `POST /api/v1/blogs` - Create blog
- `POST /api/v1/events` - Create event
- `POST /api/v1/exams` - Create exam
- `POST /api/v1/sessions/start` - Start exam session
- `GET /api/v1/chat/sessions` - Get chat sessions
- `POST /api/v1/event-bookings` - Create event booking
- `GET /api/v1/admin-panel` - Get admin panel data

## Troubleshooting

### If routes still return 404 after deploying vercel.json:

1. **Check Vercel deployment logs** for errors
2. **Verify environment variables** are set in Vercel dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `NODE_ENV`
3. **Check function logs** in Vercel dashboard for runtime errors
4. **Ensure database connection** is working (check MongoDB connection string)

### Common Issues:

- **Database connection errors**: Check `MONGO_URI` environment variable
- **CORS errors**: Already configured in `server.js`
- **Timeout errors**: Vercel functions have a 10s timeout (Hobby plan) or 60s (Pro plan)

## Next Steps

1. ✅ Deploy `vercel.json` file
2. ✅ Wait for deployment
3. ✅ Run test script to verify all endpoints
4. ✅ Check Vercel function logs if any issues persist

