# ⚡ Quick Command Reference

Copy and paste these commands when you need them!

---

## 🔄 Every Time You Make Changes (Update Your Live App)

Open Terminal and run these commands:

```bash
cd /Users/shivamsharma/Downloads/volley---ai-peer-accountability
git add .
git commit -m "Update app"
git push
```

**Wait 2-3 minutes** - Render will automatically update your live app!

---

## 📝 Change the Commit Message

Replace "Update app" with what you actually changed:

```bash
git commit -m "Added new feature"
git commit -m "Fixed video connection bug"
git commit -m "Improved UI design"
```

---

## ✅ Check What Changed

Before committing, see what files you modified:

```bash
cd /Users/shivamsharma/Downloads/volley---ai-peer-accountability
git status
```

---

## 🔍 View Your Deployment Status

1. Go to https://dashboard.render.com/
2. Click on your service
3. Check the "Events" tab to see deployment status

---

## 🆘 If Something Goes Wrong

### Reset to Last Working Version:
```bash
cd /Users/shivamsharma/Downloads/volley---ai-peer-accountability
git checkout .
```

### See Your Git History:
```bash
git log --oneline
```

---

## 📚 First Time Setup (One Time Only)

If starting fresh on a new computer:

```bash
cd /Users/shivamsharma/Downloads
git clone https://github.com/YOUR_USERNAME/volley-peer-app.git
cd volley-peer-app
npm install
```

(Replace YOUR_USERNAME with your actual GitHub username)
