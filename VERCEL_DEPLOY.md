# 🚀 Quick Start: Deploy LeboLink to Vercel

This guide will help you deploy LeboLink to Vercel in under 10 minutes.

## 📋 Prerequisites

- GitHub account with LeboLink repository
- Vercel account (sign up at https://vercel.com)
-- API backend deployed (see DEPLOYMENT.md for hosting options)

---

## 🎯 Step-by-Step: Deploy to Vercel

### Step 1: Prepare API Backend

Vercel is ideal for the frontend. For the API you have two options:

1. Deploy the API as a Vercel Serverless project (requires converting the NestJS app to a serverless-compatible handler).
   - Use a serverless adapter for NestJS (e.g., `@vendia/serverless-express` or `@nestjs/platform-serverless`) and export a handler.
   - Configure a Vercel project that builds the API and exposes serverless endpoints.
   - Set `NEXT_PUBLIC_API_BASE_URL` to the Vercel API URL.

2. Keep the existing NestJS server and deploy it to a Node-friendly host (Render, Fly, etc.), then point `NEXT_PUBLIC_API_BASE_URL` to that URL.

If you prefer minimal refactor, choose option 2. If you want everything under Vercel and can refactor, choose option 1.

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
   | `NEXT_PUBLIC_API_BASE_URL` | The API URL from Step 1 |
   
   Example: `https://api.yourdomain.com`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build
   - 🎉 Your app is live!

---

## 🔗 Access Your App

After successful deployment:

- **Frontend URL**: Check Vercel dashboard (e.g., `https://lebolink.vercel.app`)
 - **API URL**: The API host URL from Step 1
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
   - Should see calls to your API host URL

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
 - **Fix**: Check your API host is running (visit API URL in browser)
 - **Fix**: Ensure your API has CORS enabled for the Vercel domain

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

### API Host Dashboard
 - Monitor API logs on your chosen platform
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

1. **Set up MongoDB Atlas** for production database (Vercel / API host free tier has limits)
2. **Configure Monitoring** with Sentry or LogRocket
3. **Add Analytics** with Vercel Analytics
4. **Set up Backups** for MongoDB
5. **Configure CDN** for static assets

---

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT.md) - All deployment options
- [Vercel Documentation](https://vercel.com/docs)
- [API Hosting Docs](https://vercel.com/docs)
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
