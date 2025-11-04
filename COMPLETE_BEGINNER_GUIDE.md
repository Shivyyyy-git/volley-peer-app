# 🎓 Complete Beginner's Guide - Deploy Your App Step by Step

This guide is written for beginners! Follow each step carefully.

---

## 📚 What You'll Learn

1. How to set up GitHub (code storage)
2. How to upload your code to GitHub
3. How to deploy to Render (make it live on the internet)
4. How updates work (auto vs manual)

---

## 🔑 Important Concepts (Read This First!)

### **GitHub** = Your code storage in the cloud
- Think of it like Google Drive, but for code
- You upload your code here
- Render reads from here

### **Render** = Where your app runs on the internet
- Like renting a computer in the cloud
- Your app will be accessible to everyone
- Free to use!

### **Auto-Deploy** = Automatic updates
- When you push code to GitHub, Render automatically updates your live app
- You don't need to manually redeploy every time!

---

## 📝 PART 1: Setting Up GitHub

### Step 1: Create GitHub Account

1. Go to https://github.com/
2. Click **"Sign up"** (top right)
3. Enter your email, create a password
4. Verify your email
5. **Done!** You now have a GitHub account

---

### Step 2: Create a New Repository on GitHub

1. After logging in, click the **"+"** icon (top right)
2. Click **"New repository"**
3. Fill in:
   - **Repository name**: `volley-peer-app` (or any name you like)
   - **Description**: "Peer accountability video chat app" (optional)
   - **Visibility**: Choose **Public** (free) or **Private**
   - **DO NOT** check "Add README" or "Add .gitignore" (we already have code)
4. Click **"Create repository"**
5. **Copy the repository URL** - it will look like:
   - `https://github.com/YOUR_USERNAME/volley-peer-app.git`
   - Save this URL somewhere!

---

### Step 3: Install Git on Your Mac

1. Open **Terminal** (Press `⌘ + Space`, type "Terminal", press Enter)
2. Check if Git is installed:
   ```bash
   git --version
   ```
3. If it says "command not found", install it:
   - Go to https://git-scm.com/download/mac
   - Download and install
   - Restart Terminal

---

### Step 4: Upload Your Code to GitHub

1. Open **Terminal**
2. Type these commands ONE BY ONE (press Enter after each):

```bash
# Go to your project folder
cd /Users/shivamsharma/Downloads/volley---ai-peer-accountability

# Initialize Git (tell Git to track this folder)
git init

# Add all your files
git add .

# Create your first commit (save point)
git commit -m "Initial commit - first version of app"

# Connect to GitHub (replace YOUR_USERNAME and REPO_NAME with yours!)
git remote add origin https://github.com/YOUR_USERNAME/volley-peer-app.git

# Push (upload) to GitHub
git branch -M main
git push -u origin main
```

5. When prompted:
   - **Username**: Your GitHub username
   - **Password**: Use a **Personal Access Token** (see below)

---

### Step 5: Create Personal Access Token (GitHub Password)

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: "Render Deployment"
   - **Expiration**: 90 days (or No expiration)
   - **Select scopes**: Check ✅ **repo** (all repo permissions)
4. Click **"Generate token"**
5. **COPY THE TOKEN** (you'll only see it once!)
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save it somewhere safe!
6. Use this token as your password when pushing code

---

## 🚀 PART 2: Deploying to Render

### Step 1: Create Render Account

1. Go to https://render.com/
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (click "Continue with GitHub")
   - This connects Render to your GitHub account
4. Authorize Render to access your repositories

---

### Step 2: Deploy the Signaling Server (Backend)

1. In Render dashboard, click **"New +"** button (top right)
2. Click **"Web Service"**
3. You'll see your GitHub repositories - click **"Connect"** next to `volley-peer-app`
4. Configure the service:
   - **Name**: `volley-signaling-server` (or any name)
   - **Environment**: Select **Node**
   - **Region**: Choose closest to you (e.g., "Oregon (US West)")
   - **Branch**: `main`
   - **Root Directory**: Type `server` (important!)
   - **Build Command**: Type `npm install`
   - **Start Command**: Type `npm start`
   - **Plan**: Select **Free**

5. Scroll down, click **"Advanced"**
6. Under "Environment Variables", click **"Add Environment Variable"**:
   - **Key**: `PORT`
   - **Value**: `10000`
   - Click **"Add"**

7. Scroll to bottom, click **"Create Web Service"**
8. **Wait 2-3 minutes** for deployment
9. When you see "Live" status, your server is ready!
10. **Copy your service URL** - it will be:
    - `https://volley-signaling-server.onrender.com` (example)
    - **For WebSocket, change `https://` to `wss://`**
    - So: `wss://volley-signaling-server.onrender.com`
    - **SAVE THIS URL!**

---

### Step 3: Deploy the Frontend (Your Website)

1. In Render dashboard, click **"New +"** again
2. Click **"Static Site"**
3. Select your repository: `volley-peer-app`
4. Configure:
   - **Name**: `volley-frontend` (or any name)
   - **Branch**: `main`
   - **Root Directory**: Leave **EMPTY** (don't type anything)
   - **Build Command**: Type `npm install && npm run build`
   - **Publish Directory**: Type `dist`
   - **Plan**: Select **Free**

5. Scroll down, click **"Advanced"**
6. Under "Environment Variables", add two variables:

   **Variable 1:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `YOUR_GEMINI_API_KEY_HERE` (get this from https://aistudio.google.com/apikey)
   - Click **"Add"**

   **Variable 2:**
   - **Key**: `VITE_SIGNALING_SERVER_URL`
   - **Value**: `wss://volley-signaling-server.onrender.com` (use YOUR server URL from Step 2!)
   - Click **"Add"**

7. Scroll to bottom, click **"Create Static Site"**
8. **Wait 2-3 minutes** for deployment
9. When you see "Live" status, your website is ready!
10. **Copy your frontend URL** - it will be:
    - `https://volley-frontend.onrender.com` (example)
    - **This is your live app URL!** Share it with anyone!

---

## ✅ PART 3: Your App is Live!

### Test It:
1. Open your frontend URL in a browser
2. Click "Create Session Link"
3. Copy the link and open it in another browser/device
4. Both should connect via video!

---

## 🔄 PART 4: How Updates Work

### **Option A: Automatic Updates (Recommended)**

When you make changes in Cursor AI and want to update your live app:

1. **Save your changes** in Cursor AI
2. Open **Terminal**
3. Run these commands:

```bash
cd /Users/shivamsharma/Downloads/volley---ai-peer-accountability

# See what changed
git status

# Add all changes
git add .

# Save changes with a message
git commit -m "Update: describe what you changed"

# Upload to GitHub
git push
```

4. **Render automatically detects the change** and redeploys your app!
5. Wait 2-3 minutes for deployment
6. Check Render dashboard - you'll see "Deploying..." then "Live"
7. Your live app is updated!

**Render auto-deploys whenever you push to GitHub!**

---

### **Option B: Manual Update**

If auto-deploy doesn't work:

1. Go to Render dashboard
2. Click on your service (signaling server or frontend)
3. Click **"Manual Deploy"** button
4. Click **"Deploy latest commit"**
5. Wait for deployment

---

## 📝 Quick Reference Commands

### Every Time You Make Changes:

```bash
cd /Users/shivamsharma/Downloads/volley---ai-peer-accountability
git add .
git commit -m "Your message here"
git push
```

Then wait 2-3 minutes for Render to auto-deploy!

---

## 🎯 Summary Checklist

✅ Created GitHub account
✅ Created repository on GitHub
✅ Installed Git
✅ Uploaded code to GitHub
✅ Created Render account
✅ Deployed signaling server
✅ Deployed frontend
✅ Added environment variables
✅ Tested the live app

---

## 🆘 Troubleshooting

### "Git push" fails:
- Make sure you used Personal Access Token, not password
- Check your GitHub username is correct

### Build fails on Render:
- Check the "Logs" tab in Render dashboard
- Make sure environment variables are set correctly

### WebSocket not connecting:
- Make sure you're using `wss://` not `ws://`
- Check both services are "Live" in Render

### Changes not showing:
- Wait 2-3 minutes after pushing
- Hard refresh browser: `⌘ + Shift + R` (Mac)

---

## 💡 Tips

1. **Always test locally first** before pushing to GitHub
2. **Commit often** with descriptive messages
3. **Check Render logs** if something breaks
4. **Free tier spins down** after 15 min inactivity (first load takes ~30 sec)

---

## 🎉 You're All Set!

Your app is live and will auto-update when you push changes to GitHub!

**Need help?** Check the Render dashboard logs or ask for help!
