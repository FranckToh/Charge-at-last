#!/bin/bash

# Charge@Last Deployment Script
# This script builds and deploys the app to Cloudflare Pages

set -e

echo "🚀 Starting Charge@Last Deployment..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler not found globally. Using npx..."
    WRANGLER="npx wrangler"
else
    WRANGLER="wrangler"
fi

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "Creating .env.local template..."
    cat > .env.local << 'ENVEOF'
# Gemini API Key for AI features
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
ENVEOF
    echo "✅ Created .env.local - Please add your GEMINI_API_KEY before deploying"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building production bundle..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not found."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Ask for deployment confirmation
echo "Ready to deploy to Cloudflare Pages?"
echo "Project: charge-at-last"
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Deploying to Cloudflare Pages..."
    $WRANGLER pages deploy dist --project-name charge-at-last
    echo ""
    echo "✨ Deployment complete!"
    echo ""
    echo "📝 Don't forget to:"
    echo "  1. Set GEMINI_API_KEY in Cloudflare Pages environment variables"
    echo "  2. Redeploy after setting the environment variable"
    echo ""
    echo "🔗 Access your dashboard: https://dash.cloudflare.com"
else
    echo "❌ Deployment cancelled"
    exit 1
fi
