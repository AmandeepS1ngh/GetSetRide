#!/bin/bash

echo "🚗 GetSetRide - Starting Application..."
echo ""

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found!"
    echo "Please create backend/.env with your MongoDB Atlas connection string"
    exit 1
fi

echo "✅ Environment files configured"
echo ""

# Start backend in a new terminal tab
echo "🔧 Starting Backend Server..."
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && npm run dev"'

sleep 3

echo "🎨 Starting Frontend Server..."
echo ""
npm run dev
