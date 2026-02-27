# 🚀 Quick Start: Deploy LeboLink to Vercel

This guide will help you deploy LeboLink to Vercel in under 10 minutes.

## 📋 Prerequisites

- GitHub account with LeboLink repository
- Vercel account (sign up at https://vercel.com)
- API backend deployed (Railway/Render recommended - see DEPLOYMENT.md)

---

## 🎯 Step-by-Step: Deploy to Vercel

### Step 1: Deploy the API Backend First

**⚠️ IMPORTANT**: Vercel only hosts the frontend. You need to deploy the API separately.

**Quick Option - Railway (Recommended)**:
1. Go to https://railway.app and sign in with GitHub
2. Create new project → Deploy from GitHub repo → Select LeboLink
3. Add MongoDB database (Railway provides this automatically)
4. Add service from repo:
   - Root Directory: `apps/api`
   - Build Command: `npm install && npm run build`
   - Start Command: `node apps/api/dist/src/main.js`
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<generate-a-long-random-string>
   MONGODB_URI=<railway-provides-this>
   ```
6. Deploy and copy the API URL (e.g., `https://lebolink-api-production.up.railway.app`)

**Alternative - Render**: See full instructions in DEPLOYMENT.md

---

### Step 2: Deploy Frontend to Vercel

1. **Visit Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository**
   - Select "Import Git Repository"
   - Choose "LeboLink" from your GitHub repositories
   - Click "Import"

3. **Configure Build Settings**
   
   Vercel should auto-detect the monorepo configuration from `vercel.json`. Verify:
   
   - ✅ **Framework Preset**: Next.js
   - ✅ **Root Directory**: `.` (leave as root)
   - ✅ **Build Command**: Auto-detected
   - ✅ **Output Directory**: `apps/web/.next`
   - ✅ **Install Command**: `npm install`

4. **Add Environment Variables**
   
   In the Environment Variables section, add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_BASE_URL` | The Railway API URL from Step 1 |
   
   Example: `https://lebolink-api-production.up.railway.app`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build
   - 🎉 Your app is live!

---

## 🔗 Access Your App

After successful deployment:

- **Frontend URL**: Check Vercel dashboard (e.g., `https://lebolink.vercel.app`)
- **API URL**: The Railway URL from Step 1
- **Admin Login**: Use the credentials from your seeded admin account

---

## 🔄 Auto-Deployment

Once connected:
- ✅ Push to `main` branch → Auto-deploy to production
- ✅ Create PR → Get preview URL automatically
- ✅ Zero downtime deployments

---

## 🌐 Add Custom Domain (Optional)

1. Go to Vercel Project Settings → "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `www.lebolink.com`)
4. Update DNS at your domain provider:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
5. Wait for DNS propagation (can take up to 48 hours)

---

## ✅ Verify Deployment

1. **Test Frontend**: Open your Vercel URL in browser
2. **Test API Connection**: 
   - Open browser DevTools → Console
   - Login to the app
   - Check Network tab for API calls
   - Should see calls to your Railway API URL

3. **Test Login Flow**:
   - Go to `/admin-login`
   - Use admin credentials
   - Should redirect to admin dashboard

---

## 🐛 Troubleshooting

### Build Failed on Vercel

**Error**: "Cannot find module..."
- **Fix**: Make sure all dependencies are in `apps/web/package.json`

**Error**: "Build timeout"
- **Fix**: Check build logs, might be a memory issue

### API Connection Failed

**Error**: "Network error" or "Failed to fetch"
- **Fix**: Verify `NEXT_PUBLIC_API_BASE_URL` environment variable is set correctly
- **Fix**: Check Railway API is running (visit API URL in browser)
- **Fix**: Ensure Railway API has CORS enabled for Vercel domain

### Environment Variables Not Working

- Redeploy after adding environment variables
- Make sure variable names start with `NEXT_PUBLIC_` for client-side access
- Check for typos in variable names

---

## 📊 Monitor Your Deployment

### Vercel Dashboard
- View deployment logs
- Check analytics
- Monitor performance

### Railway Dashboard
- Monitor API logs
- Check resource usage
- View database metrics

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change default JWT_SECRET
- [ ] Update admin passwords
- [ ] Configure CORS to only allow Vercel domain
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Review and set up proper environment variables
- [ ] Test authentication flows
- [ ] Set up monitoring and alerts

---

## 💡 Next Steps

1. **Set up MongoDB Atlas** for production database (Railway free tier has limits)
2. **Configure Monitoring** with Sentry or LogRocket
3. **Add Analytics** with Vercel Analytics
4. **Set up Backups** for MongoDB
5. **Configure CDN** for static assets

---

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT.md) - All deployment options
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 🆘 Need Help?

- Create an issue: https://github.com/manikantmani2/LeboLink/issues
- Check discussions: https://github.com/manikantmani2/LeboLink/discussions

---

<div align="center">

**Happy Deploying! 🚀**

Made with ❤️ by [@manikantmani2](https://github.com/manikantmani2)

</div>
