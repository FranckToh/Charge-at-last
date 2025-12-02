# 🚀 Enable GitHub Pages - Quick Guide

## ✅ Complete These 3 Steps to Deploy Your App

### Step 1: Merge the Pull Request

1. Go to: https://github.com/FranckToh/Charge-at-last/pull/1
2. Click the green **"Merge pull request"** button
3. Confirm the merge
4. Delete the `genspark_ai_developer` branch (optional)

### Step 2: Enable GitHub Pages

1. Go to your repository: https://github.com/FranckToh/Charge-at-last
2. Click **Settings** tab (top right)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"** (not "Deploy from a branch")
5. Click **Save**

### Step 3: Add the Workflow File

Since GitHub blocked the workflow file in the PR (security restriction), you need to add it manually:

1. Go to your repository: https://github.com/FranckToh/Charge-at-last
2. Click **Add file** → **Create new file**
3. Name it: `.github/workflows/deploy.yml`
4. Paste this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. Click **Commit changes...**
6. Select **"Commit directly to the main branch"**
7. Click **Commit changes**

### Step 4: Trigger Deployment (Optional)

The app will auto-deploy, but you can trigger it manually:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

---

## 🎉 Your App Will Be Live At:

```
https://francktoh.github.io/Charge-at-last/
```

Wait 2-3 minutes for the first deployment to complete.

---

## 🔑 Optional: Add Groq API Key (If Not Auto-Detected)

If your Groq integration isn't automatically available:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GROQ_API_KEY`
4. Value: Your Groq API key from https://console.groq.com/keys
5. Click **Add secret**
6. Redeploy by going to Actions → Re-run workflow

---

## 📱 After Deployment

1. ✅ Visit your app URL
2. ✅ Test the AI chat (powered by your Groq integration!)
3. ✅ Try the PWA install (Add to Home Screen)
4. ✅ Test all features
5. ✅ Share with users!

---

## 🆘 Troubleshooting

### Deployment fails?
- Check **Actions** tab for error logs
- Ensure GitHub Pages is set to "GitHub Actions" (not branch)
- Verify workflow file is in `.github/workflows/deploy.yml`

### App not loading?
- Wait 2-3 minutes for DNS propagation
- Try clearing browser cache
- Check if deployment completed successfully in Actions

### AI not working?
- Verify `GROQ_API_KEY` secret exists in Settings → Secrets
- Check the secret name is exactly `GROQ_API_KEY` (case-sensitive)
- Redeploy after adding secrets

---

## 📚 Documentation

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Quick setup: [QUICK_SETUP.md](./QUICK_SETUP.md)
- Project README: [README.md](./README.md)

---

**Need help?** Comment on the PR or open an issue!

⚡ Powered by Groq + Gemini AI ⚡
