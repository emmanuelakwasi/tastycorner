# React Route Optimization Integration Guide

## Overview

Your Route Optimization folder contains:
- **React Client**: `Route Optimization/client/` (frontend)
- **Node.js Server**: `Route Optimization/server/` (API backend)

We'll integrate this with your Flask app so delivery drivers can use it.

## Integration Approach

### Recommended: Hybrid Approach
1. **Build React app** → Serve as static files from Flask
2. **Keep Node.js server** → Run separately or proxy through Flask
3. **Create Flask routes** → For delivery driver access and order management
4. **Connect orders** → Convert orders to route optimization format

## Step-by-Step Integration

### Step 1: Build the React App

```bash
cd "Route Optimization/client"
npm install
npm run build
```

This creates a `build` folder with optimized static files.

### Step 2: Copy Build to Flask Static

```bash
# From project root (res/)
mkdir -p static/route-optimizer
cp -r "Route Optimization/client/build/*" static/route-optimizer/
```

### Step 3: Flask Integration Points

I'll create:
1. **Delivery Driver Dashboard** (`/driver/dashboard`)
   - Accessible to employees with "Delivery Driver" job title
   - Shows pending deliveries
   - Link to route optimizer

2. **Route Optimizer Page** (`/driver/route-optimizer`)
   - Serves the React app
   - Passes order data as props/API

3. **API Endpoints**:
   - `/api/deliveries/pending` - Get orders ready for delivery
   - `/api/deliveries/complete/<order_id>` - Mark delivery complete
   - `/api/optimize` - Proxy to Node.js server OR implement in Flask

### Step 4: Order Data Conversion

Convert Flask orders to route optimization format:
```python
# Flask order format
{
  'order_id': 123,
  'user_id': 'user1',
  'status': 'out_for_delivery',
  'created_at': '2024-01-01 12:00:00',
  # ... need to get delivery address from user
}

# Route optimization format
{
  'stops': [
    {
      'id': 123,
      'name': 'John Doe',
      'address': '123 Main St',
      'lat': 40.7128,
      'lng': -74.0060,
      'priority': 1
    }
  ],
  'startLocation': {
    'lat': 30.4515,  # Restaurant location
    'lng': -91.1871,
    'name': 'TastyCorner'
  }
}
```

## Implementation Plan

### Phase 1: Basic Integration
- [ ] Build React app
- [ ] Serve React from Flask static folder
- [ ] Create delivery driver login/dashboard
- [ ] Link to route optimizer

### Phase 2: Data Connection
- [ ] Get pending orders from Flask
- [ ] Convert to route optimization format
- [ ] Pass to React app
- [ ] Display on map

### Phase 3: Full Integration
- [ ] Connect Node.js API (proxy or Flask implementation)
- [ ] Update order status when delivery complete
- [ ] Real-time order updates
- [ ] Driver assignment system

## Next Steps

1. **Tell me when you're ready** → I'll start implementing
2. **Or build React app first** → Then I'll integrate it
3. **Questions?** → Ask about any part of the integration

## File Structure After Integration

```
res/
├── app.py                          (Flask - add driver routes)
├── Route Optimization/
│   ├── client/                     (React source)
│   │   └── build/                  (Built React app)
│   └── server/                     (Node.js API)
├── static/
│   └── route-optimizer/            (React build - served by Flask)
├── templates/
│   └── driver/
│       ├── dashboard.html          (Driver dashboard)
│       └── route_optimizer.html    (React app wrapper)
└── ...
```

## Questions to Answer

1. **Do you want to keep Node.js server separate?** (Run on different port)
   - OR convert API to Flask routes?

2. **Where is the restaurant location?** (Start location for routes)
   - Need lat/lng coordinates

3. **How do we get delivery addresses?** 
   - Currently orders have user_id, need to get address from users.csv

4. **Should drivers be assigned to specific orders?**
   - OR can any driver take any delivery?

Let me know and I'll proceed with the integration!

