# 🎯 QUICK FIX - 15 Minutes to Working Deployment

## DO THIS NOW (5 minutes)

### 1. Open Vercel Dashboard
```
https://vercel.com/dashboard → lebolink → Settings → Environment Variables
```

**Add:**
```
Name: NEXT_PUBLIC_API_BASE_URL
Value: http://localhost:3001
```
Click Save → Redeploy

### 2. Test Locally (10 minutes)
```bash
# Terminal 1 - API
npm run start:api

# Terminal 2 - Web
npm run start:web

# Browser
http://localhost:3003/signup
```

✅ If signup page loads WITHOUT "Unexpected token" error → **YOU'RE GOOD!**

---

## THEN DO THIS (10 minutes)

### For Production: Set Up Render API

**Go to:** https://dashboard.render.com

**Delete Old Service:**
- Click "LeboLink" 
- Scroll → Danger Zone → Delete

**Create New Service:**
- Click "New" → "Web Service"
- Select GitHub repo
- Fill form:
  ```
  Name: lebolink-api
  Branch: main
  Build: npm ci && npm run build:api
  Start: npm run start:api
  ```
- Add env vars:
  ```
  MONGODB_URI=<your MongoDB Atlas URL>
  NODE_ENV=production
  PORT=3001
  ```
- Deploy

**Copy Render URL when done, update Vercel:**
```
NEXT_PUBLIC_API_BASE_URL=https://your-render-api-xxxxx.onrender.com
```

---

## ✅ YOU'RE DONE WHEN

- [ ] Vercel has `NEXT_PUBLIC_API_BASE_URL` set
- [ ] Signup page loads at https://lebolink.vercel.app/signup
- [ ] No "Unexpected token" error
- [ ] Can submit form

---

## 📚 Full Docs

- **FIX_DEPLOYMENT_NOW.md** - 2-min read
- **MANUAL_SETUP_VERCEL_RENDER.md** - Step-by-step
- **DEPLOYMENT_STATUS_REPORT.md** - Full status
- **test-deployment.bat** - Run to verify

---

**Status**: Code ✅ | Setup ⏳ | Production ❌
