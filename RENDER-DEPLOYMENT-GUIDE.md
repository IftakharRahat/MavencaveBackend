# Render Deployment Guide

This guide will help you deploy your Express API to Render.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. MongoDB database (MongoDB Atlas or Render's MongoDB service)

## Deployment Steps

### 1. Prepare Your Repository

Your code is already configured for Render! The following files are set up:
- ✅ `server.js` - Main server file
- ✅ `package.json` - Dependencies and start script
- ✅ `render.yaml` - Render configuration (optional but recommended)

### 2. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Select your repository and branch

### 3. Configure the Service

**Basic Settings:**
- **Name**: `mavencave-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (or `./` if your files are in a subdirectory)

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes` (deploys on every push)

### 4. Set Environment Variables

Go to **Environment** tab and add:

**Required Variables:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d
NODE_ENV=production
```

**Optional Variables:**
```
PORT=10000
```

> **Note**: Render automatically sets `PORT`, but you can override it if needed.

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build your application
   - Start the server
3. Wait for deployment to complete (usually 2-5 minutes)

### 6. Get Your API URL

After deployment, Render will provide a URL like:
```
https://mavencave-backend.onrender.com
```

## Testing Your Deployment

### Quick Test

Test the root endpoint:
```bash
curl https://your-app.onrender.com/
```

Test the health endpoint:
```bash
curl https://your-app.onrender.com/health
```

Test an API endpoint:
```bash
curl https://your-app.onrender.com/api/v1/blogs
```

### Using the Test Script

Update the test script to use your Render URL:
```bash
$env:API_URL="https://your-app.onrender.com"; node test-apis.js
```

Or edit `test-apis.js` and change:
```javascript
const BASE_URL = process.env.API_URL || 'https://your-app.onrender.com';
```

## Environment Variables Setup

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Go to **Database Access** → Create database user
4. Go to **Network Access** → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
5. Click **Connect** → **Connect your application**
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Add to Render environment variables as `MONGO_URI`

### JWT Secret

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add the output to Render as `JWT_SECRET`.

## Render-Specific Features

### Health Checks

Your app includes a health check endpoint at `/health` that Render will use to monitor your service.

### Auto-Deploy

Render automatically deploys when you push to your connected branch. You can disable this in settings.

### Custom Domain

1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Follow DNS configuration instructions

### Logs

View real-time logs:
- Go to your service dashboard
- Click **"Logs"** tab
- See build logs, runtime logs, and errors

## Troubleshooting

### Service Won't Start

1. **Check Logs**: Go to Logs tab and look for errors
2. **Check Environment Variables**: Ensure all required variables are set
3. **Check Build Command**: Verify `npm install` completes successfully
4. **Check Start Command**: Verify `npm start` works locally

### Database Connection Issues

1. **Verify MONGO_URI**: Check the connection string is correct
2. **Check MongoDB Atlas**: Ensure IP whitelist includes Render IPs (or `0.0.0.0/0`)
3. **Check Database User**: Verify username and password are correct
4. **Check Network**: Ensure MongoDB cluster is accessible

### Timeout Issues

1. **Health Check**: Ensure `/health` endpoint returns 200
2. **Cold Starts**: Free tier services spin down after 15 minutes of inactivity
3. **Upgrade Plan**: Consider upgrading to paid plan for always-on service

### Common Errors

**"Cannot find module"**
- Solution: Check `package.json` includes all dependencies

**"Port already in use"**
- Solution: Use `process.env.PORT` (already configured)

**"MongoDB connection failed"**
- Solution: Check `MONGO_URI` and network access

## Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds (cold start)
- 750 hours/month free (enough for one always-on service)
- Limited to 512MB RAM

## Upgrading to Paid Plan

For production use, consider upgrading:
- Always-on service (no spin-down)
- More resources
- Better performance
- Custom domains included

## API Endpoints

Once deployed, all your API endpoints will be available:

**Public:**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/v1/blogs` - Get all blogs
- `GET /api/v1/events` - Get all events
- `GET /api/v1/exams` - List exams
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user

**Protected (require JWT token):**
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/courses` - Create course
- And all other protected routes...

## Next Steps

1. ✅ Deploy to Render
2. ✅ Set environment variables
3. ✅ Test all endpoints
4. ✅ Set up custom domain (optional)
5. ✅ Monitor logs and performance

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check your service logs for specific errors

