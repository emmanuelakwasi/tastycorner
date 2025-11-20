# Quick Guide: Getting Google Maps API Key

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console

1. **Visit:** https://console.cloud.google.com/
2. **Sign in** with your Google account (or create one if needed)

### Step 2: Create a Project

1. Click **"Select a project"** (top left)
2. Click **"New Project"**
3. Enter project name: **"Food Truck Route Optimizer"**
4. Click **"Create"**
5. Wait for project to be created (takes a few seconds)

### Step 3: Enable Required APIs

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for and enable these APIs (click each one, then click "Enable"):

   **Required APIs:**
   - **Directions API** - For road routes
   - **Places API** - For parking locations and autocomplete suggestions
   
   **Optional (but recommended):**
   - **Maps JavaScript API** - For enhanced map features
   - **Geocoding API** - For address lookup

3. For each API:
   - Click on the API name
   - Click the **"Enable"** button
   - Wait for it to enable

### Step 4: Create API Key

1. Go to **"APIs & Services"** → **"Credentials"** (left sidebar)
2. Click **"+ CREATE CREDENTIALS"** (top of page)
3. Select **"API key"**
4. Your API key will be created and displayed
5. **Copy the API key** (you'll need it in a moment)

### Step 5: Restrict API Key (Important for Security)

1. Click on your newly created API key to edit it
2. Under **"API restrictions":**
   - Select **"Restrict key"**
   - Check only these APIs:
     - Directions API
     - Places API
     - Maps JavaScript API (if enabled)
     - Geocoding API (if enabled)

3. Under **"Application restrictions":**
   - For development: Select **"None"** (or "HTTP referrers" and add `localhost:3000/*`)
   - For production: Select **"HTTP referrers"** and add your domain

4. Click **"Save"**

### Step 6: Set Up Billing (Required)

**Important:** Google requires a billing account even for the free tier.

1. Go to **"Billing"** in the left sidebar
2. Click **"Link a billing account"** or **"Create billing account"**
3. Enter your payment information
4. **Don't worry:** You get $200 free credit per month
5. Typical usage costs less than $1 per month for small operations

### Step 7: Add API Key to Your Project

1. **Create `.env` file** in your project root:
   ```
   C:\Users\patri\OneDrive\Documents\Route Optimization\.env
   ```

2. **Add this line:**
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Replace `your_api_key_here`** with the API key you copied

4. **Example `.env` file:**
   ```
   PORT=5000
   NODE_ENV=development
   REACT_APP_API_URL=http://localhost:5000/api
   GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 8: Restart Your Server

1. **Stop the server** (if running): Press `Ctrl+C` in terminal
2. **Start it again:**
   ```bash
   npm run dev
   ```

### Step 9: Verify It's Working

1. **Check API status:**
   - Open browser: `http://localhost:5000/api/optimize/google-maps-status`
   - Should show: `{"enabled": true, "message": "Google Maps API is enabled"}`

2. **Test route optimization:**
   - Add some stops in the app
   - Optimize a route
   - Check if parking locations are real (not estimated)
   - Check if routes use real road distances

## Visual Guide

### Where to Find Everything

```
Google Cloud Console
├── Select Project (top left)
│   └── New Project
│
├── APIs & Services
│   ├── Library
│   │   ├── Directions API → Enable
│   │   ├── Places API → Enable
│   │   └── Maps JavaScript API → Enable (optional)
│   │
│   └── Credentials
│       └── + CREATE CREDENTIALS → API key
│
└── Billing
    └── Link billing account
```

## Cost Information

### Free Tier
- **$200 free credit per month**
- More than enough for development and small operations

### Pricing (after free tier)
- **Directions API:** $5 per 1,000 requests
- **Places API:** $17 per 1,000 requests
- **Geocoding API:** $5 per 1,000 requests

### Typical Usage
- **Route optimization:** ~1-2 API calls
- **Parking lookup:** 1 API call per stop
- **5-stop route:** ~6-7 API calls = **~$0.10**

**Example monthly cost:**
- 100 routes/day × 30 days = 3,000 routes
- 3,000 routes × 7 API calls = 21,000 calls
- Cost: ~$2-3/month (well within free tier)

## Troubleshooting

### "API key not valid" Error

**Solutions:**
1. Check API key is correct in `.env` file
2. Make sure APIs are enabled
3. Check API key restrictions aren't too strict
4. Verify billing account is linked
5. Restart server after adding key

### "This API project is not authorized" Error

**Solutions:**
1. Go to APIs & Services → Library
2. Make sure all required APIs are enabled
3. Wait a few minutes for changes to propagate

### "Billing account required" Error

**Solutions:**
1. Go to Billing in Google Cloud Console
2. Link a billing account
3. Even with billing, you get $200 free credit

### API Key Not Working

**Checklist:**
- [ ] API key copied correctly (no extra spaces)
- [ ] APIs are enabled (Directions, Places)
- [ ] Billing account is linked
- [ ] `.env` file is in project root
- [ ] Server restarted after adding key
- [ ] API key restrictions allow your usage

## Security Tips

1. **Never commit `.env` to Git:**
   - `.env` should already be in `.gitignore`
   - Never share your API key publicly

2. **Restrict your API key:**
   - Limit to specific APIs
   - Restrict to your domain (for production)
   - Set daily quotas

3. **Monitor usage:**
   - Set up billing alerts
   - Check usage in Google Cloud Console
   - Set daily quotas to prevent overuse

## Alternative: Use Without API Key

**The app works perfectly without an API key!**

- Uses estimated distances (1.3x multiplier for roads)
- Uses estimated parking locations
- All core features work
- Just less accurate than with API

**You can always add the API key later** when you need more accuracy.

---

## Quick Summary

1. Go to https://console.cloud.google.com/
2. Create project
3. Enable Directions API and Places API
4. Create API key
5. Link billing account
6. Add key to `.env` file
7. Restart server
8. Done! ✅

**Need help?** Check `GOOGLE_MAPS_SETUP.md` for detailed instructions.

