# Quick Start - Render Deployment

## ✅ Changes Made

1. ✅ Updated `server.js` - Added health endpoint, configured for Render
2. ✅ Updated `package.json` - Added Node.js version specification
3. ✅ Created `render.yaml` - Render configuration file
4. ✅ Created deployment guide

## 🚀 Deploy Now (3 Steps)

### 1. Push to Git
```bash
git add .
git commit -m "Configure for Render deployment"
git push
```

### 2. Create Render Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Use these settings:
   - **Name**: `mavencave-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

### 3. Add Environment Variables
In Render dashboard → Environment tab, add:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
NODE_ENV=production
```

## ✅ Done!

Your API will be available at: `https://your-app.onrender.com`

## 🧪 Test After Deployment

```bash
# Update test script URL
$env:API_URL="https://your-app.onrender.com"; node test-apis.js
```

