# ⚡ Charge@Last - Quick Setup Guide

## 🚀 Automatic Deployment (Recommended)

Your app is configured to automatically deploy to **GitHub Pages** on every push to the `main` branch!

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/FranckToh/Charge-at-last
2. Click on **Settings** tab
3. Navigate to **Pages** (in the left sidebar)
4. Under "Build and deployment":
   - Source: Select **GitHub Actions**
5. Click **Save**

### Step 2: Add AI API Keys (Optional but Recommended)

The app supports **both Groq and Gemini APIs** for AI features:

**Option A: Use Groq (Faster, great for chat)**
1. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
2. If you already have Groq integration, check if `GROQ_API_KEY` exists
3. If not, get a free key from https://console.groq.com/keys
4. Add as secret: `GROQ_API_KEY`

**Option B: Use Gemini (Better for vision/maps)**
1. Get API key from https://aistudio.google.com/app/apikey
2. Add as secret: `GEMINI_API_KEY`

**Best: Add both!** The app will use Groq for fast text chat and Gemini for images/maps.

### Step 3: Trigger Deployment

The app will automatically deploy when you:
- Push to the `main` branch
- Merge a pull request to `main`
- Or manually trigger from the **Actions** tab

**Your app will be available at:**
```
https://francktoh.github.io/Charge-at-last/
```

---

## 🎯 Alternative: Deploy to Cloudflare Pages

### Prerequisites
- Cloudflare account (free): https://dash.cloudflare.com/sign-up
- Cloudflare API Token

### Quick Deploy

1. **Get Cloudflare API Token:**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Copy the token

2. **Set the token:**
   ```bash
   export CLOUDFLARE_API_TOKEN="your_token_here"
   ```

3. **Deploy:**
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name charge-at-last
   ```

4. **Add environment variables in Cloudflare:**
   - Go to: Pages → charge-at-last → Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key
   - Redeploy

**Your app will be at:** `https://charge-at-last.pages.dev`

---

## 🔑 Getting Your Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the key
5. Add it to your deployment platform (GitHub Secrets or Cloudflare Environment Variables)

**Note:** The app works in demo mode without an API key, but AI features will be limited.

---

## 🧪 Testing Locally

### Run development server:
```bash
npm install
npm run dev
```
Visit: http://localhost:3000

### Build and preview:
```bash
npm run build
npm run preview
```
Visit: http://localhost:4173

---

## 📱 App Features

✅ **On-Demand EV Charging** - Request mobile charging services  
✅ **Live Tracking** - Track technician location in real-time  
✅ **AI Assistant** - Powered by Google Gemini (requires API key)  
✅ **Voice Agent** - Voice-enabled customer service  
✅ **Car Mode** - Distraction-free interface for drivers  
✅ **PWA Support** - Install as native app  
✅ **Admin Dashboard** - Manage fleet and dispatching  

---

## 🆘 Troubleshooting

### GitHub Pages not deploying?
- Make sure GitHub Actions is enabled in Settings → Actions → General
- Check the **Actions** tab for build errors
- Ensure "Source" is set to "GitHub Actions" in Pages settings

### AI features not working?
- Confirm `GEMINI_API_KEY` secret is added
- Check the API key is valid at https://aistudio.google.com
- Redeploy after adding the secret

### Build failing?
- Check Node.js version (requires v16+)
- Delete `node_modules` and run `npm install` again
- Check for error messages in Actions logs

---

## 🎉 Next Steps

Once deployed:

1. ✅ Test the app on mobile and desktop
2. ✅ Try installing as PWA (Add to Home Screen)
3. ✅ Test all features (Request, Tracking, AI Assistant)
4. ✅ Switch to Admin mode to see dashboard
5. ✅ Try Car Mode for driver experience
6. ✅ Configure custom domain (optional)

---

## 📚 More Documentation

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Project README: [README.md](./README.md)
- Source code: https://github.com/FranckToh/Charge-at-last

---

**Need help?** Open an issue on GitHub or check the documentation.

🔋 Happy charging! ⚡
