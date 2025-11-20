# Google Maps API Setup Guide

## Overview

The Food Truck Route Optimizer now supports Google Maps API integration for enhanced features:
- **Real road routes** (not just straight-line distances)
- **Real parking locations** (actual parking spots, not estimates)
- **Traffic-aware routing** (accounts for current traffic conditions)
- **Turn-by-turn directions** (detailed navigation steps)

## Features

### With Google Maps API Key:
- ✅ Real road distances and routes
- ✅ Actual parking locations from Google Places
- ✅ **Autocomplete address suggestions** (real-time as you type)
- ✅ Traffic-aware time estimates
- ✅ Detailed turn-by-turn directions
- ✅ Polyline routes for accurate map display

### Without Google Maps API Key (Fallback):
- ✅ Estimated road distances (1.3x multiplier)
- ✅ Estimated parking locations (within 100m)
- ✅ Estimated time calculations
- ✅ Basic route optimization
- ✅ All core features work

## Setup Instructions

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a new project** (or select existing):
   - Click "Select a project" → "New Project"
   - Enter project name: "Food Truck Route Optimizer"
   - Click "Create"

3. **Enable required APIs:**
   - Go to "APIs & Services" → "Library"
   - Enable these APIs:
     - **Maps JavaScript API**
     - **Directions API**
     - **Places API** (includes parking detection and autocomplete)
     - **Geocoding API** (optional, for address lookup)

4. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

5. **Restrict API Key (Recommended):**
   - Click on your API key to edit
   - Under "API restrictions", select "Restrict key"
   - Select only the APIs you enabled
   - Under "Application restrictions", set to "HTTP referrers" (for web)
   - Add your domain (e.g., `localhost:3000/*` for development)

### Step 2: Add API Key to Project

1. **Create `.env` file** in the project root:
   ```bash
   PORT=5000
   NODE_ENV=development
   REACT_APP_API_URL=http://localhost:5000/api
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. **Replace `your_api_key_here`** with your actual API key

3. **Restart the server** after adding the key:
   ```bash
   npm run dev
   ```

### Step 3: Verify Setup

1. **Check API status:**
   ```bash
   curl http://localhost:5000/api/optimize/google-maps-status
   ```

2. **Expected response:**
   ```json
   {
     "enabled": true,
     "message": "Google Maps API is enabled"
   }
   ```

## API Costs

### Free Tier (Google Maps Platform)
- **$200 free credit per month**
- Directions API: $5 per 1,000 requests
- Places API: $17 per 1,000 requests
- Geocoding API: $5 per 1,000 requests

### Estimated Usage
- **Route optimization**: ~1-2 API calls per optimization
- **Parking lookup**: 1 API call per stop
- **Typical route (5 stops)**: ~6-7 API calls = ~$0.10

**Note:** The app works without API key using fallback methods. API key is optional but recommended for production.

## Troubleshooting

### API Key Not Working

**Problem:** API returns error or fallback mode

**Solutions:**
1. Check API key is correct in `.env` file
2. Verify APIs are enabled in Google Cloud Console
3. Check API key restrictions (may be too restrictive)
4. Check billing is enabled (required even for free tier)
5. Restart server after adding API key

### "API key not valid" Error

**Solutions:**
1. Regenerate API key in Google Cloud Console
2. Check API key restrictions match your usage
3. Verify billing account is linked
4. Check API quotas haven't been exceeded

### Parking Not Found

**Problem:** Parking locations are estimated instead of real

**Solutions:**
1. Verify Places API is enabled
2. Check API key has Places API access
3. Increase parking radius in options
4. Check API quotas

### Directions Not Working

**Problem:** Routes use estimated distances

**Solutions:**
1. Verify Directions API is enabled
2. Check API key has Directions API access
3. Check API quotas
4. Verify coordinates are valid

## Security Best Practices

1. **Never commit API key to Git:**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Restrict API key:**
   - Limit to specific APIs
   - Restrict to your domain
   - Use IP restrictions for server-side calls

3. **Monitor usage:**
   - Set up billing alerts
   - Monitor API usage in Google Cloud Console
   - Set daily quotas

4. **Rotate keys regularly:**
   - Change API keys periodically
   - Revoke old keys when not in use

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
GOOGLE_MAPS_API_KEY=your_production_api_key
NODE_ENV=production
PORT=5000
```

### Server-Side Only

**Important:** API key should only be used server-side. Never expose it in client-side code.

The current implementation uses the API key only in the backend (`server/services/googleMapsService.js`), which is secure.

## Alternative APIs

If you prefer other services:

### Mapbox
- Similar features to Google Maps
- Different pricing structure
- Would require code changes

### OpenStreetMap (OSRM)
- Free and open source
- Requires self-hosting
- Different API structure

### Here Maps
- Commercial alternative
- Good for enterprise
- Different pricing

---

**The app works great without an API key, but Google Maps integration makes it even better!** 🗺️

