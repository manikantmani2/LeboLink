# Fix Deployment Issues - Step by Step

## URGENT: Fix Vercel Environment Variable

**Go to Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `http://localhost:3001` (for testing locally)
   - Click Save and Redeploy

This is the CRITICAL missing piece causing the "Unexpected token" errors.

---

## URGENT: Fix Render API Deployment

**The current Render service shows "Docker" runtime but the deployment failed.**

You have TWO options:

### Option A: Delete and Recreate (Recommended)
1. Go to Render Dashboard
2. Click on "LeboLink" service
3. Settings → Delete Service (scroll to bottom)
4. Confirm deletion
5. Create NEW Web Service:
   - Select GitHub repo
   - Framework: Node
   - Region: Ohio (free)
   - Build: `npm ci && npm run build:api`
   - Start: `npm run start:api`
   - Health Check: `/api/v1/health`
6. Add env vars:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Auto-generate or provide custom
   - `NODE_ENV`: `production`
   - `PORT`: `3001`

### Option B: Use Local API for Testing
For immediate testing:
1. Run API locally: `npm run start:api`
2. Set Vercel `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:3001`
3. Test signup/login locally

---

## Quick Local Test

```bash
# Terminal 1: Start API
npm run start:api

# Terminal 2: Start Frontend
npm run start:web
```

Then visit: http://localhost:3003/signup

---

## Why It Failed

1. **Render** - Old Docker config still active, new Node config wasn't deployed
2. **Vercel** - Missing `NEXT_PUBLIC_API_BASE_URL` env var, frontend couldn't call API
3. **Result** - Frontend gets HTML 404 errors instead of JSON, causing JSON parse error

---

## Status Check

✅ Code builds successfully  
✅ API works on localhost  
✅ Frontend works on localhost  
❌ Render API needs proper deployment (Node runtime)  
❌ Vercel needs API URL configured  

Once you set the Vercel env var, even the old Render deployment will work better. But for stable production, recreate the Render service with Node runtime.
