# ⚡ LeboLink - Quick Start (30 seconds)

## 🚀 Local Development
```bash
npm install
npm run dev
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

## 🌐 Deploy to Vercel (3 Steps)

**Step 1:** Get token from https://vercel.com/account/tokens

**Step 2:** Add to GitHub Secrets:
```
VERCEL_TOKEN = your-token
```

**Step 3:** Push to main
```bash
git push origin main
# Auto-deploys in 2-3 minutes
```

## 🎯 Then Configure API

Choose one: **Render** (recommended) | Fly.io | AWS  
→ Deploy API  
→ Get API URL  
→ Add to Vercel env: `NEXT_PUBLIC_API_BASE_URL=https://your-api.com`

---

**📚 For details:** See `SETUP_AND_DEPLOY_GUIDE.md` | `PROJECT_READY.md`
