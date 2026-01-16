#!/bin/bash

cd /var/www/next-frontend || exit 1

echo "📦 Installing dependencies..."
yarn || npm install

echo "🛑 Stopping existing PM2 app..."
pm2 stop nextjs-frontend 2>/dev/null || true
pm2 delete nextjs-frontend 2>/dev/null || true

echo "🚀 Starting Next.js frontend..."
pm2 start npm --name "nextjs-frontend" -- start

pm2 save

echo "✅ Frontend deployed"
pm2 status nextjs-frontend

