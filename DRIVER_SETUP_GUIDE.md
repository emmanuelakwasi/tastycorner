# Delivery Driver Route Optimization Setup Guide

## ✅ What's Been Done

1. **Flask Routes Created**:
   - `/driver/login` - Driver login page
   - `/driver/dashboard` - Driver dashboard with pending deliveries
   - `/driver/route-optimizer` - Route optimizer page (serves React app)
   - `/api/deliveries/pending` - API to get pending deliveries
   - `/api/deliveries/complete/<order_id>` - API to mark delivery complete

2. **Templates Created**:
   - `templates/driver/login.html` - Driver login
   - `templates/driver/dashboard.html` - Driver dashboard
   - `templates/driver/route_optimizer.html` - Route optimizer wrapper

3. **Integration Points**:
   - Orders with status "out_for_delivery" are shown to drivers
   - User addresses from `users.csv` are linked to orders
   - Orders converted to route optimization format

## 🚀 Next Steps

### Step 1: Build the React App

```bash
# Navigate to React app directory
cd "Route Optimization/client"

# Install dependencies (if not already done)
npm install

# Build the React app for production
npm run build
```

This creates a `build` folder with optimized static files.

### Step 2: Copy Build to Flask Static

```bash
# From project root (res/)
# Create directory for route optimizer
mkdir -p static/route-optimizer

# Copy React build files
# Windows PowerShell:
Copy-Item -Path "Route Optimization\client\build\*" -Destination "static\route-optimizer\" -Recurse

# Or manually copy the entire build folder contents to static/route-optimizer/
```

### Step 3: Update Restaurant Location

In `app.py`, line ~2718, update the restaurant coordinates:

```python
start_location = {
    'lat': 30.4515,  # UPDATE WITH ACTUAL RESTAURANT LATITUDE
    'lng': -91.1871,  # UPDATE WITH ACTUAL RESTAURANT LONGITUDE
    'name': 'TastyCorner Restaurant'
}
```

### Step 4: Configure Route Optimization API

The React app expects the API at `http://localhost:5000/api/optimize`. You have two options:

**Option A: Keep Node.js Server Running**
- Start the Node.js server from `Route Optimization/server/`
- Update React app's API URL to point to Node.js server (port 5001)
- Or proxy requests through Flask

**Option B: Implement API in Flask**
- Convert Node.js optimization routes to Flask
- Serve everything from Flask port 5000

### Step 5: Test the Integration

1. **Create a Delivery Driver Employee**:
   - In admin dashboard, add an employee
   - Set job title to "Delivery Driver"
   - Note the Employee ID

2. **Create Test Orders**:
   - Place orders through the website
   - In admin dashboard, change order status to "out_for_delivery"

3. **Login as Driver**:
   - Go to `/driver/login`
   - Enter the Employee ID
   - View pending deliveries
   - Click "Open Route Optimizer"

## 📋 Current Features

- ✅ Driver authentication (Employee ID login)
- ✅ View pending deliveries
- ✅ Link to route optimizer
- ✅ API endpoints for deliveries
- ✅ Order completion tracking

## 🔧 Configuration Needed

1. **Restaurant Location**: Update lat/lng in `app.py`
2. **React App Build**: Build and copy to `static/route-optimizer/`
3. **API Connection**: Configure route optimization API endpoint
4. **Google Maps API Key**: Ensure React app has Google Maps API key configured

## 📝 Notes

- Orders must have status "out_for_delivery" to appear for drivers
- Users must have addresses in `users.csv` for deliveries to show
- The route optimizer will need geocoding to convert addresses to lat/lng
- Make sure the Node.js server is running if using separate API

## 🐛 Troubleshooting

**React app not loading?**
- Check that build files are in `static/route-optimizer/`
- Check browser console for errors
- Verify file paths in `route_optimizer.html`

**No deliveries showing?**
- Check order status is "out_for_delivery"
- Verify users have addresses in `users.csv`
- Check Flask logs for errors

**API not working?**
- Verify Node.js server is running (if using separate server)
- Check API endpoint URLs in React app
- Verify CORS settings if servers are on different ports

