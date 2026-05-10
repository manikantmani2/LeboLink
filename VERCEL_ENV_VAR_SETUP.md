# 🚀 Vercel Environment Variable Setup - CRITICAL

## The Problem
Your deployed app is receiving `Unexpected token '<', '<!DOCTYPE'` errors during signup/login because:
- Frontend is calling the backend API
- But `NEXT_PUBLIC_API_BASE_URL` is not set in Vercel
- So the frontend hits the wrong host and gets HTML 404 instead of JSON

## The Solution
Set one environment variable in Vercel and redeploy.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Verify Backend API is Running
Check your deployed backend is working:
```bash
curl https://your-api-host.onrender.com/api/v1/health
```
Should return something like:
```json
{"status":"ok"}
```

**Get your API host from:**
- Render Dashboard → Your API service → Copy the service URL
- Example: `https://lebolink-api-xxxxx.onrender.com`

### Step 2: Go to Vercel Settings
1. Visit: https://vercel.com/dashboard
2. Select your `lebolink` project
3. Go to **Settings** → **Environment Variables**

### Step 3: Add the Environment Variable
**Name:** `NEXT_PUBLIC_API_BASE_URL`

**Value:** `https://your-api-host.onrender.com` (replace with actual Render API URL)

**Environment:** Production

Click **Save**

### Step 4: Redeploy
Either:
- **Option A:** Push a commit to GitHub → Vercel auto-redeploys
- **Option B:** Go to Vercel Deployments tab → Click "Redeploy"

---

## ✅ Verify It Works

Once redeployed, test:

1. Visit your Vercel app: `https://lebolink.vercel.app`
2. Try **Signup** or **Login**
3. If successful → Problem solved! 🎉

If still failing:
- Check Vercel build logs for errors
- Verify `NEXT_PUBLIC_API_BASE_URL` was saved correctly
- Confirm backend API is responding to requests

---

## 📋 What Changed in Code

The frontend now:
- **Requires** `NEXT_PUBLIC_API_BASE_URL` in production (fails fast if missing)
- **Parses responses safely** (handles HTML errors gracefully)
- **Shows clear error messages** (not cryptic `Unexpected token` errors)

All auth pages (`login`, `signup`, `register`, `admin-login`) updated.

---

## 🔧 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| Build fails during Vercel deploy | Missing `NEXT_PUBLIC_API_BASE_URL` | Set env var and redeploy |
| Still getting "Unexpected token" | Wrong API URL | Verify Render API is running |
| API shows 404 | Backend not deployed | Deploy to Render/Fly/AWS first |

---

## 📚 Related Docs
- [API_DEPLOYMENT.md](API_DEPLOYMENT.md) - Backend deployment guide
- [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md) - Full setup walkthrough
- [MANUAL_SETUP_VERCEL_RENDER.md](MANUAL_SETUP_VERCEL_RENDER.md) - Step-by-step Vercel + Render setup

---

**Status:** ✅ Code fixed and deployed to main branch

**Next Action:** Set `NEXT_PUBLIC_API_BASE_URL` in Vercel and redeploy
