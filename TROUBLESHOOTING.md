# 🔧 Troubleshooting: Session Not Starting

## Step 1: Check Browser Console

1. Open your frontend URL in both browsers
2. Press **F12** (or Right-click → Inspect)
3. Go to **Console** tab
4. Look for these messages:

### ✅ Good Signs:
- `Connecting to signaling server: wss://...`
- `✅ Connected to signaling server at: wss://...`
- `📤 Sending message: create (session: ...)`
- `📥 Received message: peer-joined`

### ❌ Bad Signs:
- `❌ Signaling server error`
- `WebSocket connection timeout`
- `Failed to connect to: wss://...`
- `⚠️ No message listener set`

---

## Step 2: Verify Environment Variable in Render

1. Go to https://dashboard.render.com/
2. Click on your **Frontend** service
3. Click **Environment** tab
4. Check `VITE_SIGNALING_SERVER_URL`:
   - Should be: `wss://volley-peer-app.onrender.com` (or your server URL)
   - Must use `wss://` (not `ws://` or `https://`)
   - Should match your signaling server URL exactly

5. If it's wrong:
   - Edit the value
   - Click **Save Changes**
   - Wait for automatic redeploy (2-3 minutes)

---

## Step 3: Verify Signaling Server is Running

1. Go to https://dashboard.render.com/
2. Click on your **Signaling Server** service
3. Check status - should be **"Live"**
4. Click **Logs** tab
5. You should see: `WebRTC Signaling Server started on port 10000`

---

## Step 4: Test WebSocket Connection

In browser console, try this:

```javascript
const ws = new WebSocket('wss://volley-peer-app.onrender.com');
ws.onopen = () => console.log('✅ WebSocket works!');
ws.onerror = (e) => console.error('❌ WebSocket error:', e);
```

If this fails, the signaling server URL is wrong or server is down.

---

## Common Issues:

### Issue 1: "Failed to connect to signaling server"
**Fix**: Check `VITE_SIGNALING_SERVER_URL` in Render dashboard

### Issue 2: "No message listener set"
**Fix**: This is a code bug - should be fixed now after latest update

### Issue 3: "WebSocket connection timeout"
**Fix**: Signaling server might be spun down (free tier). Wait 30 seconds and try again.

### Issue 4: Console shows connection but peers don't see each other
**Fix**: Check if you see `peer-joined` message in console. If not, the join message isn't being relayed.

---

## Still Not Working?

Share the console logs from both browsers and I'll help debug!
