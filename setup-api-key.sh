#!/bin/bash

# Charge@Last - Automated API Key Setup
# This script helps you set up your Gemini API key automatically

set -e

echo "⚡ Charge@Last - API Key Setup ⚡"
echo ""
echo "This script will help you configure your Gemini API key."
echo ""

# Check if .env.local already exists with a real key
if [ -f ".env.local" ]; then
    EXISTING_KEY=$(grep "GEMINI_API_KEY=" .env.local | cut -d'=' -f2)
    if [ "$EXISTING_KEY" != "your_gemini_api_key_here" ] && [ ! -z "$EXISTING_KEY" ]; then
        echo "✅ API key already configured!"
        echo ""
        read -p "Do you want to update it? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Keeping existing configuration."
            exit 0
        fi
    fi
fi

echo "📋 To get your FREE Gemini API key:"
echo "1. Visit: https://aistudio.google.com/app/apikey"
echo "2. Sign in with your Google account"
echo "3. Click 'Get API Key' or 'Create API Key'"
echo "4. Copy the key"
echo ""
echo "Opening browser..."
sleep 2

# Try to open the browser
if command -v xdg-open &> /dev/null; then
    xdg-open "https://aistudio.google.com/app/apikey" 2>/dev/null || true
elif command -v open &> /dev/null; then
    open "https://aistudio.google.com/app/apikey" 2>/dev/null || true
fi

echo ""
echo "📝 Paste your API key here (or press Enter to use demo mode):"
read -r API_KEY

if [ -z "$API_KEY" ]; then
    echo ""
    echo "⚠️  No API key provided. Using DEMO MODE."
    echo "   AI features will show sample responses."
    echo ""
    API_KEY="demo_mode_no_real_key"
fi

# Create or update .env.local
cat > .env.local << EOF
# Gemini API Key for AI features
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=$API_KEY
EOF

echo ""
echo "✅ Configuration saved to .env.local"
echo ""

if [ "$API_KEY" != "demo_mode_no_real_key" ]; then
    echo "🎉 All set! Your app is ready with full AI features."
else
    echo "ℹ️  Running in demo mode. Add a real API key later to enable AI features."
fi

echo ""
echo "🚀 Next steps:"
echo "   npm install    # Install dependencies"
echo "   npm run dev    # Start development server"
echo "   npm run build  # Build for production"
echo ""
