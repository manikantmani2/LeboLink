# Deployment Setup Guide

This guide will help you complete the LeboLink application deployment. The application is a monorepo with:
- **Backend API**: NestJS application deployed to Render
- **Frontend Web**: Next.js application deployed to Vercel

## Quick Start

### Step 1: Deploy Backend API to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Select your GitHub repository `manikantmani2/LeboLink`
4. Configure:
   - **Name**: `lebolink-api` (or similar)
   - **Region**: Ohio (free tier region)
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

5. **Add Environment Variables**:
   - `MONGODB_URI`: MongoDB Atlas connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/lebolink?retryWrites=true&w=majority`)
   - `JWT_SECRET`: Generate a secure secret (Render will auto-generate if you leave it)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (optional for now)
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret (optional for now)
   - Other environment variables are already configured in `render.yaml`

6. Click **Create Web Service** and wait for deployment
7. Copy the deployed URL (e.g., `https://lebolink-api-xxxxx.onrender.com`)

### Step 2: Deploy Frontend to Vercel

**Option A: Manual Vercel Dashboard (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Select your GitHub repository `manikantmani2/LeboLink`
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `apps/web`
5. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: Set to your Render API URL from Step 1 (e.g., `https://lebolink-api-xxxxx.onrender.com`)
6. Click **Deploy**

**Option B: GitHub Actions (if secrets are configured)**
If you have Vercel secrets configured in GitHub:
1. Push a commit to trigger the workflow
2. Monitor the `Deploy to Vercel` workflow in GitHub Actions

### Step 3: Verify Deployment

After both deployments are complete:

1. **Test API Health**:
   ```bash
   curl https://lebolink-api-xxxxx.onrender.com/api/v1/health
   ```
   Should return: `{"status":"ok","mongo":"connected","dbName":"lebolink"}`

2. **Test Web Frontend**:
   - Visit your Vercel deployment URL
   - Try the signup/login flows
   - Should successfully call the Render API

## Environment Variables

### API (Render)
- `MONGODB_URI`: MongoDB connection string (required)
- `JWT_SECRET`: JWT signing secret (required, auto-generated if empty)
- `STRIPE_SECRET_KEY`: Stripe API key (optional)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret (optional)
- `NODE_ENV`: production
- `PORT`: 3001
- `BOOKING_FLAT_FEE`: 499
- `BOOKING_CURRENCY`: INR

### Web (Vercel)
- `NEXT_PUBLIC_API_BASE_URL`: Your Render API URL (required)

## Troubleshooting

### API Build Fails on Render
- Check that `MONGODB_URI` is correctly set
- Verify Node.js version is 18+ (Render uses latest by default)
- Check Render build logs for specific errors

### Frontend Can't Connect to API
- Ensure `NEXT_PUBLIC_API_BASE_URL` is set correctly in Vercel
- Verify the Render API is healthy: `curl {API_URL}/api/v1/health`
- Check browser console for CORS errors (Render API should allow requests from Vercel domain)

### MongoDB Connection Issues
- Verify connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- Check MongoDB Atlas IP whitelist includes Render IP ranges
- Ensure database `lebolink` exists in MongoDB Atlas

## CI/CD Workflows

The repository includes GitHub Actions workflows:
- **CI Pipeline** (`ci.yml`): Verifies build passes on push
- **Deploy to Vercel** (`deploy-vercel.yml`): Auto-deploys to Vercel on main branch push
- **Docker Push** (`docker-push.yml`): Builds and pushes Docker images (optional)

To enable Vercel auto-deployment:
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add `VERCEL_TOKEN`: Get from [Vercel Settings → Tokens](https://vercel.com/account/tokens)

## Project Structure
```
├── apps/api/          # NestJS backend API
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── apps/web/          # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── Dockerfile
│   └── package.json
├── packages/shared/   # Shared utilities
├── render.yaml        # Render deployment config
└── vercel.json        # Vercel deployment config
```

## Getting Help

- Check Render logs: Render Dashboard → your app → Logs tab
- Check Vercel logs: Vercel Dashboard → your project → Deployments tab
- Check GitHub Actions logs: Repository → Actions tab

---

**Last Updated**: May 10, 2026
**Status**: Ready for deployment
