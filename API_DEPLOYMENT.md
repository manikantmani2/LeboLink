# 🚀 LeboLink - Backend API Deployment Guide

## Quick Summary

Your **frontend** is now deployed on Vercel at: **https://lebolink.vercel.app**

Now you need to deploy the **backend API** to make the application fully functional.

---

## 🔧 Step 1: Prepare Your API

### Option A: Deploy to Render.com (Recommended - Free Tier Available)

1. **Go to [render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Select your LeboLink GitHub repository
   - Click "Connect"

4. **Configure the service:**
   - **Name:** `lebolink-api`
   - **Environment:** `Node`
   - **Region:** Choose closest to your location
   - **Branch:** `main`
   - **Build Command:** `npm run build:api`
   - **Start Command:** `npm run start:api`
   - **Instance Type:** `Free` (or upgrade as needed)

5. **Add Environment Variables:**
   Click "Advanced" and add these:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/lebolink
   JWT_SECRET=your-very-secure-random-secret-key-here
   CORS_ORIGIN=https://lebolink.vercel.app
   ```

6. **Deploy:** Click "Create Web Service"
   - Render will build and deploy automatically
   - Get your API URL from the dashboard (e.g., `https://lebolink-api.onrender.com`)

---

### Option B: Deploy to Fly.io (Fastest Deployments)

1. **Install Fly CLI:**
   ```bash
   npm install -g flyctl
   fly auth login
   ```

2. **From project root:**
   ```bash
   fly launch --builder dockerfile
   fly deploy
   ```

3. **Set secrets:**
   ```bash
   fly secrets set MONGODB_URI="your-mongodb-url"
   fly secrets set JWT_SECRET="your-secret"
   fly secrets set CORS_ORIGIN="https://lebolink.vercel.app"
   ```

---

### Option C: Deploy to Railway.app (Simple & Fast)

1. **Go to [railway.app](https://railway.app)**
2. **Create new project → Deploy from GitHub**
3. **Select LeboLink repository**
4. **Configure:**
   - Build command: `npm run build:api`
   - Start command: `npm run start:api`
5. **Add environment variables** (same as above)

---

## 📊 Step 2: Set Up MongoDB Atlas

1. **Create MongoDB Atlas account:** https://www.mongodb.com/cloud/atlas
2. **Create a free cluster**
3. **Create database user** (username & password)
4. **Get connection string:** `mongodb+srv://user:password@cluster.mongodb.net/lebolink`
5. **Copy this URL** - you'll need it in your API environment variables

---

## ⚙️ Step 3: Update Vercel Environment Variables

Once your API is deployed and you have its URL:

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click on `lebolink` project**
3. **Settings → Environment Variables**
4. **Update/Add:**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
   ```
5. **Save and Redeploy:**
   - Click "Deployments"
   - Click the latest deployment
   - Click "Redeploy"

---

## 🔐 Step 4: Verify Deployment

### Test API Connectivity:
1. Go to https://lebolink.vercel.app
2. Open DevTools (F12) → Console
3. Try to log in - check Network tab for API calls
4. Should see requests to your deployed API URL

### Test Login Flow:
- **Admin Login:**
  - Email: `admin@lebolink.com`
  - Password: `Hello@&1234`
  - Should redirect to admin dashboard

---

## 📋 Complete Deployment Checklist

- [ ] Backend deployed to Render/Fly/Railway
- [ ] MongoDB Atlas connection string working
- [ ] Environment variables set on API host
- [ ] CORS enabled for `https://lebolink.vercel.app`
- [ ] API URL added to Vercel environment variables
- [ ] Vercel redeployed with new API URL
- [ ] Test login successful on deployed frontend
- [ ] Admin dashboard loads without errors
- [ ] API Swagger docs accessible at `/docs`

---

## 🆘 Troubleshooting

### "Failed to fetch API"
- Check API URL in Vercel env vars matches deployed URL
- Verify CORS_ORIGIN is set correctly in API
- Check API is running: visit `https://your-api-url/docs`

### "502 Bad Gateway"
- API server crashed - check logs on hosting platform
- Out of memory - upgrade to paid tier
- Check database connection string is correct

### "CORS Error"
- Update CORS_ORIGIN in API environment variables
- Redeploy API after updating
- Wait a few minutes for DNS to propagate

### Database Connection Failed
- Verify MONGODB_URI in environment variables
- Check MongoDB Atlas IP whitelist includes API host IP
- Test connection locally first

---

## 🚀 Next Steps

1. **Deploy Backend** (choose one platform above)
2. **Configure Environment Variables**
3. **Update Vercel with API URL**
4. **Test End-to-End Flow**
5. **Set up Custom Domain** (optional)
6. **Monitor & Scale** as needed

---

## 📚 Useful Links

- **Render Documentation:** https://render.com/docs
- **Fly.io Documentation:** https://fly.io/docs
- **Railway Documentation:** https://docs.railway.app
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Vercel Documentation:** https://vercel.com/docs

---

## 💡 Production Tips

1. **Monitor API Logs:** Check logs on your hosting platform regularly
2. **Set Up Alerts:** Enable notifications for deployment failures
3. **Database Backups:** Enable automatic backups in MongoDB Atlas
4. **Security:** Change all default passwords before production
5. **Performance:** Use CDN for static assets (Vercel handles this)
6. **Analytics:** Enable Vercel Analytics for insights

---

Made with ❤️ by [@manikantmani2](https://github.com/manikantmani2)
