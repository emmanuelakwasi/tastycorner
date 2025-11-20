# React Route Optimization Integration Plan

## Current Structure

- **Flask App**: Python backend on port 5000 (default)
- **Route Optimization**: 
  - React client in `Route Optimization/client/`
  - Node.js/Express server in `Route Optimization/server/`
  - API endpoint: `POST /api/optimize`

## Integration Strategy

### Option 1: Separate Services with Proxy (Recommended)
- Flask runs on port 5000
- Node.js server runs on port 5001
- Flask proxies API requests to Node.js server
- Flask serves built React app from static folder
- Delivery drivers access via `/driver/route-optimizer`

### Option 2: Full Flask Integration
- Convert Node.js API routes to Flask routes
- Build React app and serve from Flask static folder
- Everything runs on Flask port 5000

## Implementation Steps

### Step 1: Build React App
```bash
cd "Route Optimization/client"
npm install
npm run build
```

### Step 2: Copy Build to Flask Static
```bash
# Copy build folder to Flask static directory
cp -r "Route Optimization/client/build" static/route-optimizer
```

### Step 3: Add Flask Routes
- `/driver/route-optimizer` - Serve React app
- `/api/optimize` - Proxy to Node.js server OR implement in Flask

### Step 4: Connect to Orders
- Get orders with status "out_for_delivery"
- Convert order addresses to route optimization format
- Pass to React app as props/API data

### Step 5: Update Order Status
- When driver completes delivery, update order status
- Mark as "completed" in orders.csv

## File Structure After Integration

```
res/
├── app.py
├── Route Optimization/
│   ├── client/          (React app - source)
│   └── server/          (Node.js API - can run separately)
├── static/
│   ├── route-optimizer/ (React build - served by Flask)
│   └── ...
├── templates/
│   └── driver/
│       └── route_optimizer.html (Flask template wrapper)
└── ...
```

## API Integration Points

1. **Get Pending Deliveries**
   - Flask endpoint: `/api/deliveries/pending`
   - Returns orders with status "out_for_delivery"
   - Format: Convert to route optimization stops format

2. **Optimize Route**
   - Use existing `/api/optimize` endpoint
   - Proxy from Flask to Node.js server OR implement in Flask

3. **Update Delivery Status**
   - Flask endpoint: `/api/deliveries/complete/<order_id>`
   - Updates order status to "completed"

## Next Steps

1. Build React app
2. Set up Flask routes for delivery driver
3. Create API endpoints for order data
4. Integrate route optimization with delivery system
5. Test end-to-end flow

