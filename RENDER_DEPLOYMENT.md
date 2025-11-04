# 🚀 Complete Render Deployment Guide

Deploy both your signaling server and frontend to Render in minutes!

---

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Render Account** (free) - Sign up at https://render.com/
3. **Your code pushed to GitHub** (optional but recommended)

---

## 🎯 Step-by-Step Deployment

### **Step 1: Push Code to GitHub (Recommended)**

1. Create a new GitHub repository
2. Push your code:
```bash
cd /Users/shivamsharma/Downloads/volley---ai-peer-accountability
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

### **Step 2: Deploy Signaling Server**

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (or use "Public Git repository")
4. Configure:
   - **Name**: `volley-signaling-server` (or any name)
   - **Environment**: **Node**
   - **Region**: Choose closest to you
   - **Branch**: `main` (or `master`)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

5. Click **"Advanced"** and add environment variable:
   - **Key**: `PORT`
   - **Value**: `10000` (Render's default, but we'll read from env)

6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. **Copy your service URL** - it will be like: `https://volley-signaling-server.onrender.com`
9. **Important**: For WebSocket, use `wss://` instead of `https://`
   - Your WebSocket URL: `wss://volley-signaling-server.onrender.com`

---

### **Step 3: Deploy Frontend**

1. Still in Render dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `volley-frontend` (or any name)
   - **Branch**: `main` (or `master`)
   - **Root Directory**: Leave empty (root of repo)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: **Free**

4. Click **"Advanced"** and add environment variables:
   - **Key**: `GEMINI_API_KEY`
     - **Value**: Your Gemini API key (from `.env` file)
   - **Key**: `VITE_SIGNALING_SERVER_URL`
     - **Value**: `wss://volley-signaling-server.onrender.com` (from Step 2)

5. Click **"Create Static Site"**
6. Wait for deployment (2-3 minutes)

---

### **Step 4: Update Frontend Environment Variable**

After the signaling server is deployed:

1. Go to your frontend service in Render dashboard
2. Click **"Environment"** tab
3. Edit `VITE_SIGNALING_SERVER_URL`:
   - Update it to: `wss://YOUR-SIGNALING-SERVER-NAME.onrender.com`
   - Replace `YOUR-SIGNALING-SERVER-NAME` with your actual server name from Step 2
4. Click **"Save Changes"**
5. Render will automatically redeploy

---

## ✅ You're Done!

Your app is now live at:
- **Frontend**: `https://volley-frontend.onrender.com` (your actual URL)
- **Signaling**: `wss://volley-signaling-server.onrender.com` (your actual URL)

---

## 🔧 Troubleshooting

### WebSocket Connection Issues:
- Make sure you're using `wss://` (not `ws://` or `https://`)
- Check that both services are "Live" in Render dashboard

### Build Errors:
- Check build logs in Render dashboard
- Make sure all dependencies are in `package.json`

### Environment Variables:
- Frontend env vars must start with `VITE_` to be accessible
- Redeploy after changing env vars

---

## 💡 Tips

1. **Free tier notes**: 
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds
   - For production, consider paid plans

2. **Custom domains**: Render allows custom domains on paid plans

3. **Auto-deploy**: Render auto-deploys on every git push (enable in settings)

---

## 📝 Quick Reference

**Signaling Server Settings:**
- Type: Web Service
- Environment: Node
- Root Directory: `server`
- Build: `npm install`
- Start: `npm start`

**Frontend Settings:**
- Type: Static Site
- Root Directory: (empty)
- Build: `npm install && npm run build`
- Publish: `dist`

**Environment Variables:**
- `GEMINI_API_KEY`: Your API key
- `VITE_SIGNALING_SERVER_URL`: `wss://your-signaling-server.onrender.com`
