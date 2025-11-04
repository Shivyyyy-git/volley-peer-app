#!/bin/bash
# Simple dev server starter script

cd "$(dirname "$0")"

echo "🚀 Starting Volley Development Servers..."
echo ""

# Check if signaling server is running
if lsof -i:8080 > /dev/null 2>&1; then
    echo "✅ Signaling server is running on port 8080"
else
    echo "⚠️  Starting signaling server..."
    cd server && npm start &
    cd ..
fi

echo ""
echo "🌐 Starting frontend with Vite..."
npx vite --host 0.0.0.0 --port 8888

echo ""
echo "📱 Open your browser to: http://localhost:8888"

