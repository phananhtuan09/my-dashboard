#!/bin/bash

# Exit immediately if any error occurs during the process
set -e

echo "🚀 Starting deployment process..."

# 1. Pull the latest code from the main branch
echo "📥 Pulling latest source code from GitHub..."
git pull origin main

# 2. Install new dependencies (if any)
echo "📦 Installing dependencies..."
npm install

# 3. Rebuild the Next.js application
echo "🏗️ Building Next.js application..."
npm run build

# 4. Start / Restart the application using PM2
# You need to change 'my-dashboard' to the App name declared in PM2
echo "🔄 Restarting application via PM2..."

# Check if the app already exists in PM2
if pm2 list | grep -q "my-dashboard"; then
  echo "App 'my-dashboard' exists, restarting..."
  pm2 restart my-dashboard
else
  echo "App 'my-dashboard' does not exist, starting..."
  pm2 start npm --name "my-dashboard" -- run start
fi

# Save the PM2 configuration to run automatically when the VPS reboots
pm2 save

echo "✅ Deployment completed successfully!"
