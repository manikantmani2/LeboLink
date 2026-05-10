# Vercel & Render Configuration Guide

## 🔴 CRITICAL: Vercel Environment Variable Setup

**This is blocking signup/login from working in production!**

### Steps:

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Click on "lebolink" project

2. **Navigate to Settings**
   - Click "Settings" (top menu)
   - Click "Environment Variables" (left sidebar)

3. **Add the API URL Variable**
   - Click "Add New"
   - Fill in:
     ```
     Name: NEXT_PUBLIC_API_BASE_URL
     Value: (see below for what to use)
     ```
   - Select all environments (Production, Preview, Development)
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots on latest deployment
   - Select "Redeploy"
   - Wait for deployment to complete

### What Value Should You Use?

**Option A: Test with Local API** (for immediate testing)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
Then run API locally: `npm run start:api`

**Option B: Use Production Render API** (after Render is working)
```
NEXT_PUBLIC_API_BASE_URL=https://your-render-api-url.onrender.com
```
Get the URL from your Render service.

---

## 🔴 CRITICAL: Render API Service Setup

The current Render service shows **"Docker" runtime** which is outdated. You need to either:

### Option A: Delete and Recreate (Recommended - 5 minutes)

1. **Delete Old Service**
   - Go to https://dashboard.render.com
   - Click "LeboLink" service
   - Scroll down to "Danger Zone"
   - Click "Delete Service"
   - Type service name to confirm

2. **Create New Service**
   - Click "New" → "Web Service"
   - Select "GitHub" and choose "manikantmani2/LeboLink"
   - Configure:
     ```
     Name: lebolink-api
     Region: Ohio (free tier)
     Branch: main
     Runtime: Should auto-detect as Node
     Build Command: npm ci && npm run build:api
     Start Command: npm run start:api
     Health Check Path: /api/v1/health
     Plan: Free
     ```

3. **Add Environment Variables**
   - Click "Add Environment Variable" for each:
     ```
     NODE_ENV = production
     PORT = 3001
     MONGODB_URI = <your MongoDB Atlas connection string>
     JWT_SECRET = <leave empty - Render will auto-generate>
     BOOKING_FLAT_FEE = 499
     BOOKING_CURRENCY = INR
     ```
   - **Critical**: You MUST provide `MONGODB_URI`
     - Get it from MongoDB Atlas: https://cloud.mongodb.com
     - Format: `mongodb+srv://username:password@cluster.mongodb.net/lebolink?retryWrites=true&w=majority`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (3-5 minutes)
   - Once deployed, copy the service URL (e.g., `https://lebolink-api-xxxxx.onrender.com`)
   - Update Vercel's `NEXT_PUBLIC_API_BASE_URL` with this URL

### Option B: Wait for Current Service to Recover

If you prefer not to delete, you can wait and see if the service auto-retries. But it will likely keep failing with Docker config.

---

## 🟢 Verification Checklist

After setup, verify everything works:

### Test 1: API Health Check
```bash
curl https://your-render-url/api/v1/health
```
Should return:
```json
{
  "status": "ok",
  "mongo": "connected",
  "dbName": "lebolink"
}
```

### Test 2: Frontend Signup
- Visit: https://lebolink.vercel.app/signup
- Fill form and submit
- Should NOT see "Unexpected token" error
- Should either succeed or show validation error from API

### Test 3: Local Testing (if using localhost)
```bash
# Terminal 1
npm run start:api

# Terminal 2
npm run start:web

# Browser
http://localhost:3003/signup
```

---

## 🆘 Troubleshooting

### Vercel shows "Unexpected token" error
- **Cause**: `NEXT_PUBLIC_API_BASE_URL` not set
- **Fix**: Set env var and redeploy (see above)

### Render build fails
- **Cause**: `MONGODB_URI` not set or invalid
- **Fix**: Add valid MongoDB Atlas connection string

### API responds with HTML instead of JSON
- **Cause**: API not deployed or wrong URL
- **Fix**: Verify Render service is running and check URL

### "address already in use" on localhost:3001
- **Cause**: Another process using port 3001
- **Fix**: `lsof -i :3001` and kill the process, or use different port

---

## 📝 Environment Variables Summary

### Render (API)
- **Required**:
  - `MONGODB_URI`: MongoDB connection string
  - `NODE_ENV`: `production`
  - `PORT`: `3001`
- **Optional**:
  - `JWT_SECRET`: Auto-generated if empty
  - `STRIPE_SECRET_KEY`: Stripe API key
  - `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
  - `BOOKING_FLAT_FEE`: 499
  - `BOOKING_CURRENCY`: INR

### Vercel (Frontend)  
- **Required**:
  - `NEXT_PUBLIC_API_BASE_URL`: Your Render API URL or `http://localhost:3001`

---

**Last Updated**: May 10, 2026  
**Status**: Awaiting manual configuration on Vercel & Render dashboards
