# 🚀 Deploy LeboLink to Vercel (Frontend Only)

**Quick Setup:** Frontend on Vercel, API hosted separately (Render/Fly/AWS recommended).

---

## ⚡ 3-Step Deploy

### Step 1: Add GitHub Secret
Go to repo → **Settings → Secrets → Actions** → Add:
```
VERCEL_TOKEN = your-vercel-token
```
Get token: https://vercel.com/account/tokens

### Step 2: Push to GitHub
```bash
git push origin main
```
GitHub Action auto-deploys to Vercel (2-3 min).

### Step 3: Set Environment in Vercel
Vercel dashboard → Project Settings → Environment Variables:
```
NEXT_PUBLIC_API_BASE_URL = https://your-api-url.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_xxx
```

---

## ✅ Done!
- Frontend URL: Check Vercel dashboard
- API: Must be hosted separately (see SETUP_AND_DEPLOY_GUIDE.md)
- Auto-deploy: Every push to `main` triggers deployment

---

## ✅ Verify
- [ ] GitHub Action builds and deploys successfully
- [ ] Vercel URL loads in browser
- [ ] API `/api/v1/health` endpoint responds
- [ ] Frontend can call API

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Build fails: "Module not found" | Run `npm install` locally first |
| Shows 404 | Verify `NEXT_PUBLIC_API_BASE_URL` in Vercel env vars |
| API unreachable | Check API host is running, CORS enabled |
| Env vars not working | Redeploy after setting in Vercel |

---

## 📚 Next Steps

1. See [SETUP_AND_DEPLOY_GUIDE.md](./SETUP_AND_DEPLOY_GUIDE.md) for complete guide
2. See [PROJECT_READY.md](./PROJECT_READY.md) for quick reference
3. Deploy API to Render/Fly/AWS (not Vercel)
4. Add `NEXT_PUBLIC_API_BASE_URL` to Vercel env vars

---

**✨ Project deployed!** 🚀
