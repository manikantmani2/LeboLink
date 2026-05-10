# 🚀 LeboLink - Deployment Guide

Complete guide for deploying LeboLink on various platforms using GitHub.

## Table of Contents

1. [Local Deployment (Docker)](#local-deployment-docker)
2. [GitHub Actions CI/CD](#github-actions-cicd)
3. [Vercel (Frontend)](#vercel-frontend)
4. [API Hosting Options](#api-hosting-options)
5. [Render (Full Stack)](#render-full-stack)
6. [Docker Hub Registry](#docker-hub-registry)
7. [Environment Variables](#environment-variables)
8. [Monitoring & Logs](#monitoring--logs)

---

## Local Deployment (Docker)

### Prerequisites

- Docker and Docker Compose installed
- Git installed
- GitHub account with the repository cloned

### Steps

1. **Clone and Navigate to Project**

```bash
git clone https://github.com/manikantmani2/LeboLink.git
cd LeboLink
```

2. **Create Environment File**

```bash
# Create .env file at project root
cat > .env << EOF
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
EOF
```

3. **Start Services with Docker Compose**

```bash
# Start all services (MongoDB, API, Web, Redis, Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

4. **Access Applications**

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **MongoDB Express**: http://localhost:8081
- **Redis**: localhost:6379

5. **Stop Services**

```bash
docker-compose down

# Remove volumes (data) as well
docker-compose down -v
```

### Docker Commands Reference

```bash
# Build specific service
docker-compose build api
docker-compose build web

# Restart a service
docker-compose restart api

# View logs of specific service
docker-compose logs api

# Run command in container
docker-compose exec api npm run build
```

---

## GitHub Actions CI/CD

The project includes automated CI/CD workflows triggered on push/PR to `main` and `develop` branches.

### Workflow Features

✅ **Automated Testing**
- Runs on every push and pull request
- Tests API and Web builds
- Linting checks

✅ **Artifact Storage**
- API build artifacts stored for 5 days
- Web build artifacts stored for 5 days
- Download via GitHub Actions tab

✅ **Docker Image Building**
- Builds Docker images for API and Web
- Uses GitHub Actions cache for faster builds

### View CI/CD Status

1. Go to GitHub repository
2. Click **Actions** tab
3. See workflow runs and their status
4. Click a run to view detailed logs

### Manual Workflow Trigger

```bash
# Push to main to trigger CI/CD
git push origin main

# Or use GitHub CLI
gh workflow run ci.yml
```

---

## Vercel (Frontend)

Vercel is the best platform for Next.js applications. 

**Note**: Vercel is ideal for hosting the **frontend (Web)**. You can also host the API on Vercel by converting it to serverless functions (recommended for smaller APIs) or by deploying the API as a separate service. Below are two recommended approaches:

- **Option A — Frontend on Vercel, API as Vercel Serverless**: Convert the NestJS API to a serverless-compatible build (use `@nestjs/platform-serverless` or a serverless adapter) and expose endpoints under `/api` or as separate serverless functions. This keeps both frontend and API within Vercel projects.
- **Option B — Frontend on Vercel, API on a Node host**: Deploy the API to a Node-friendly host (Render, Fly, or a VPS) and point `NEXT_PUBLIC_API_BASE_URL` to that service. This is the simplest option if you want to keep the existing NestJS server without significant refactor.

Choose the option that matches your tolerance for refactor vs. simplicity.

### Quick Deploy Steps

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select "LeboLink" repository from GitHub
   - Vercel will auto-detect it as a monorepo

3. **Configure Project Settings**
   
   Vercel should automatically use the `vercel.json` configuration, but verify:
   
   - **Framework Preset**: Next.js
   - **Root Directory**: Leave as root (/) - vercel.json handles the rest
   - **Build Command**: Auto-detected from vercel.json
   - **Output Directory**: Auto-detected from vercel.json
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url.example.com
   ```
   
   ⚠️ You'll need to deploy the API first (see "API Hosting Options" above) and use that URL here.

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Get your Vercel URL: `https://lebolink.vercel.app` (or similar)

### Auto-Deploy on Push

Once connected to GitHub:
- ✅ Changes to `apps/web` on `main` branch auto-deploy to production
- ✅ Pull requests get preview URLs automatically
- ✅ Zero-downtime deployments

### Custom Domain Setup

1. Go to Project Settings → "Domains"
2. Add your custom domain (e.g., `www.lebolink.com`)
3. Update DNS records at your domain provider:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
4. Wait for DNS propagation (1-48 hours)

### Deployment Order

For full stack deployment:

1. **First**: Deploy API on Vercel / API host (Render or similar) (see sections below)
2. **Second**: Copy the API URL from your Vercel / API host
3. **Third**: Deploy Web on Vercel using the API URL
4. **Fourth**: Test the complete flow

---

---

## Render (Full Stack)

Render is a great alternative with GitHub integration.

### Deployment Steps

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Connect GitHub Repository**
   - Click your account icon → "Dashboard"
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select LeboLink

3. **Create API Service**
   - **Name**: `lebolink-api`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build:api`
   - **Start Command**: `npm run start:api`
   - **Instance Type**: Free (adjust as needed)
   - Set environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=<your-mongodb-atlas-uri>
     JWT_SECRET=<your-secret>
     ```
   - Click "Create Web Service"

4. **Create Web Service**
   - **Name**: `lebolink-web`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build:web`
   - **Start Command**: `npm run start:web`
   - **Instance Type**: Free
   - Set environment variables:
     ```
     NEXT_PUBLIC_API_BASE_URL=<API_SERVICE_URL>
     ```
   - Click "Create Web Service"

5. **Create MongoDB Service** (if not using MongoDB Atlas)
   - Click "New +" → "MongoDB"
   - Follow Render instructions
   - Copy MongoDB URI to both API and Web services

6. **Deploy**
   - Render auto-deploys on GitHub push
   - Monitor progress in Render dashboard

---

## Docker Hub Registry

Push Docker images to Docker Hub for easy access and deployment.

### Setup

1. **Create Docker Hub Account**
   - Visit https://hub.docker.com
   - Sign up and create repository

2. **Create GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Create secrets:
     - `DOCKER_HUB_USERNAME`: Your Docker Hub username
     - `DOCKER_HUB_TOKEN`: Your Docker Hub access token (generate in Hub settings)

3. **Create Push Workflow**
   - File: `.github/workflows/docker-push.yml`
   - Pushes Docker images on push to `main`

4. **Deploy from Docker Hub**
   - Pull image: `docker pull yourusername/lebolink-api:latest`
   - Run: `docker run -p 3001:3001 yourusername/lebolink-api:latest`

---

## Environment Variables

### Required Variables

**For API (NestJS)**
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://user:pass@host:27017/lebolink
JWT_SECRET=your-very-secure-random-secret-key
```

**For Web (Next.js)**
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Optional Variables

```env
# API
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com

# Web
NEXT_PUBLIC_APP_NAME=LeboLink
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### How to Set Environment Variables

**GitHub Actions:** Add to repository secrets
**Vercel:** Project Settings → Environment Variables
**Vercel / API host:** Variables section in service settings
**Render:** Environment → Native Environment Variables
**Docker Compose:** Create `.env` file at project root

---

## Monitoring & Logs

### GitHub Actions Logs

1. Go to repository "Actions" tab
2. Click on a workflow run
3. Expand job steps to see detailed logs
4. Look for build errors, test failures, etc.

### Application Logs

**Docker:**
```bash
docker-compose logs -f api    # API logs
docker-compose logs -f web    # Web logs
docker-compose logs -f mongodb # MongoDB logs
```

**Vercel:**
- Dashboard → Deployments → Select deployment → Logs
- Real-time logs show runtime errors

**Vercel / Render:**
- Dashboard → Service → Logs tab
- Monitor for application errors

### Common Issues & Solutions

**Error: EADDRINUSE: address already in use :::3001**
```bash
# Kill process on port 3001
# Windows: netstat -ano | findstr :3001 → taskkill /PID <PID> /F
# Linux: lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill
```

**MongoDB Connection Error**
- Verify `MONGODB_URI` environment variable is set
- Check MongoDB service is running: `docker-compose ps`
- Verify network connectivity

**Build Fails**
- Check logs in GitHub Actions
- Ensure all dependencies are in `package.json`
- Check Node version compatibility (18+)

**Deployment Takes Too Long**
- Monitor resource usage
- Check for large dependencies
- Consider upgrading instance size

---

## Security Checklist

✅ **Before Production Deployment**

- [ ] Change all default passwords
- [ ] Generate secure JWT_SECRET key
- [ ] Set up HTTPS certificates
- [ ] Configure CORS origins properly
- [ ] Enable authentication on all admin endpoints
- [ ] Review environment variables for sensitive data
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Test authentication flows
- [ ] Review API rate limiting
- [ ] Enable security headers (CORS, CSP, etc.)

---

## Support & Documentation

- **Repository**: https://github.com/manikantmani2/LeboLink
- **Issues**: Create GitHub Issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Author**: [@manikantmani2](https://github.com/manikantmani2)

---

<div align="center">

**Deployed with ❤️ using GitHub**

[GitHub](https://github.com/manikantmani2/LeboLink) • [Issues](https://github.com/manikantmani2/LeboLink/issues) • [Discussions](https://github.com/manikantmani2/LeboLink/discussions)

</div>
