#!/bin/bash
# ══════════════════════════════════════════
#  Wayfinder — One-Click Setup (Mac/Linux)
# ══════════════════════════════════════════

set -e

echo ""
echo "  ===================================="
echo "   Wayfinder Setup"
echo "  ===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found."
    echo "  Mac:   brew install node"
    echo "  Linux: sudo apt install nodejs npm"
    echo "  Or:    https://nodejs.org (LTS version)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "[ERROR] Node.js 18+ required. You have $(node -v)"
    echo "  Update: https://nodejs.org"
    exit 1
fi
echo "[OK] Node.js $(node -v)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "[OK] Dependencies installed"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env from template..."
    cp .env.example .env
    echo "[ACTION REQUIRED] Open .env and add your ANTHROPIC_API_KEY"
    echo "  Get your key at: https://console.anthropic.com/"
else
    echo "[OK] .env file exists"
fi

# Create data directories
echo ""
echo "Creating data directories..."
mkdir -p backend/data/sessions
mkdir -p backend/data/feedback
mkdir -p backend/data/scraped
mkdir -p backend/knowledge-base
echo "[OK] Directories created"

# Generate starter knowledge base
echo ""
echo "Generating starter knowledge base..."
cd backend && node services/ingest.js && cd ..

echo ""
echo "  ===================================="
echo "   Setup Complete!"
echo "  ===================================="
echo ""
echo "  Next steps:"
echo "    1. Open .env and paste your ANTHROPIC_API_KEY"
echo "    2. Run: npm run dev"
echo "    3. Open: http://localhost:3000"
echo ""
echo "  Optional:"
echo "    - Run scrapers: npm run scrape"
echo "    - Then ingest:  npm run ingest"
echo ""
