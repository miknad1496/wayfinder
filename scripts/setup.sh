#!/bin/bash
# Wayfinder Setup Script
# Run this once after cloning the repo

set -e

echo "╔══════════════════════════════════════════╗"
echo "║  Wayfinder Setup                         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. You have $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Edit .env and add your ANTHROPIC_API_KEY"
    echo "   Get yours at: https://console.anthropic.com/"
else
    echo "✅ .env file exists"
fi

# Create data directories
echo ""
echo "📁 Creating data directories..."
mkdir -p backend/data/sessions
mkdir -p backend/data/feedback
mkdir -p backend/data/scraped
mkdir -p backend/knowledge-base

# Generate starter knowledge base
echo ""
echo "📚 Generating starter knowledge base..."
cd backend && node services/ingest.js
cd ..

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Setup Complete!                         ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Edit .env and add your ANTHROPIC_API_KEY"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "Optional:"
echo "  • Run scrapers: npm run scrape"
echo "  • Then ingest:  npm run ingest"
echo ""
