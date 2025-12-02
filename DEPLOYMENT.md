# Charge@Last - Deployment Guide

## 🚀 Quick Start

This guide explains how to deploy the Charge@Last EV charging service app to Cloudflare Pages.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Cloudflare Account** - Sign up at [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
3. **Gemini API Key** - Get from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

## 🔧 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## ☁️ Deploying to Cloudflare Pages

### Method 1: Using Wrangler CLI (Recommended)

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```
   This will open a browser window to authenticate.

3. **Deploy**:
   ```bash
   npx wrangler pages deploy dist --project-name charge-at-last
   ```

4. **Configure Environment Variables in Cloudflare**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to: Pages → charge-at-last → Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `your_actual_api_key`
   - Save and redeploy

### Method 2: Using Cloudflare Dashboard (Git Integration)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Charge@Last app"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to: Workers & Pages → Create application → Pages → Connect to Git
   - Select your repository: `Charge-at-last`
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `/`

3. **Add Environment Variables**:
   - In the build settings, add:
     - Variable name: `GEMINI_API_KEY`
     - Value: Your Gemini API key
   - Click "Save and Deploy"

4. **Access Your App**:
   - Your app will be deployed to: `https://charge-at-last.pages.dev`
   - Custom domains can be configured in Settings → Custom domains

## 🔐 Environment Variables

The following environment variables are required:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |

### Setting Environment Variables in Cloudflare

1. Go to your project in Cloudflare Pages
2. Navigate to **Settings** → **Environment Variables**
3. Add variables for both **Production** and **Preview** environments
4. Click **Save**
5. Trigger a new deployment for changes to take effect

## 🌐 Custom Domain Setup

To use a custom domain:

1. Go to your Cloudflare Pages project
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Follow the instructions to add DNS records

## 📱 PWA Features

The app includes Progressive Web App (PWA) features:

- **Offline Support**: Service worker caching
- **Install Prompt**: Add to home screen on mobile
- **App Manifest**: Native app-like experience

The PWA will work automatically once deployed. Users can install it from their browser.

## 🔄 Continuous Deployment

When using Git integration with Cloudflare Pages:

- Every push to `main` branch triggers a production deployment
- Pull requests create preview deployments
- Preview deployments are available at unique URLs

## 📊 Monitoring & Logs

- **Deployment Logs**: Available in Cloudflare Pages dashboard
- **Analytics**: Enable in Pages → Analytics
- **Real-time Logs**: Use `wrangler pages deployment tail` for live logs

## 🐛 Troubleshooting

### Build Fails

- Ensure `package.json` scripts are correct
- Check Node.js version compatibility
- Verify all dependencies are installed

### API Key Issues

- Confirm `GEMINI_API_KEY` is set correctly in Cloudflare
- Check API key is valid at [Google AI Studio](https://aistudio.google.com)
- Ensure environment variables are set for the correct environment (Production/Preview)

### App Not Loading

- Check browser console for errors
- Verify `dist` folder contains built files
- Ensure build output directory is set to `dist`

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Google Gemini API Docs](https://ai.google.dev/docs)

## 🚀 Post-Deployment

After successful deployment:

1. Test all features in production
2. Verify AI assistant works with Gemini API
3. Test PWA installation on mobile devices
4. Check voice agent functionality
5. Verify geolocation and mapping features

## 💡 Tips

- Use preview deployments to test changes before production
- Set up branch deployments for staging environments
- Enable Web Analytics in Cloudflare for insights
- Configure caching rules for optimal performance
- Set up alerts for deployment failures

## 🎉 Success!

Your Charge@Last app should now be live! Share the URL with users to start providing mobile EV charging services.

For issues or questions, refer to the project README or Cloudflare support documentation.
