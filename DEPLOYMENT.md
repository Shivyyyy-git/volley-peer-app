# Deployment Guide

This guide will help you deploy both the signaling server and frontend to production.

## 🚀 Part 1: Deploy Signaling Server to Railway

### Step 1: Sign up for Railway
1. Go to https://railway.app/
2. Sign up with GitHub (free tier available)

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo" (or upload the `server/` folder)

### Step 3: Configure Deployment
1. Set the root directory to `server/`
2. Railway will auto-detect Node.js
3. Add environment variable: `PORT` (Railway sets this automatically)

### Step 4: Get Your Server URL
1. After deployment, Railway will give you a URL like: `https://your-app.railway.app`
2. **Important**: For WebSocket, you need to use `wss://` (secure WebSocket)
3. Your WebSocket URL will be: `wss://your-app.up.railway.app` (Railway provides this)

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Sign up for Vercel
1. Go to https://vercel.com/
2. Sign up with GitHub (free tier available)

### Step 2: Import Your Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Or drag and drop your project folder

### Step 3: Configure Build Settings
- Framework Preset: **Vite**
- Root Directory: `/` (main project folder)
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 4: Set Environment Variables
In Vercel project settings, add:
- `GEMINI_API_KEY`: Your Gemini API key
- `VITE_SIGNALING_SERVER_URL`: `wss://your-signaling-server.up.railway.app` (from Railway)

### Step 5: Deploy
Click "Deploy" - Vercel will build and deploy your app!

---

## 📝 Alternative: Deploy to Render (Free Alternative)

### Signaling Server on Render:
1. Go to https://render.com/
2. Create new "Web Service"
3. Connect your repo
4. Set:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

### Frontend on Render:
1. Create new "Static Site"
2. Connect your repo
3. Set:
   - Root Directory: `/` (main folder)
   - Build Command: `npm run build`
   - Publish Directory: `dist`

---

## 🔧 After Deployment

1. Update `VITE_SIGNALING_SERVER_URL` in Vercel/Render with your Railway WebSocket URL
2. Redeploy frontend if needed
3. Test the connection!

---

## 🎯 Quick Commands

### Local Development:
- Server: `cd server && npm start`
- Frontend: `npm run dev`

### Production URLs:
- Frontend: Your Vercel URL (e.g., `https://your-app.vercel.app`)
- Signaling: Your Railway WebSocket URL (e.g., `wss://your-app.up.railway.app`)
