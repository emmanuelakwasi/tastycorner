# Backend Developer Guide

## Your Role

You're responsible for the **backend** of the Food Truck Route Optimizer. This means you'll work with:
- Server code (`server/` folder)
- API endpoints (how frontend communicates with backend)
- Business logic (route optimization algorithms)
- Data processing and validation

---

## Backend Architecture Overview

```
Request Flow:
Frontend → API Endpoint → Service Layer → Response → Frontend
```

### Three-Layer Architecture

1. **Route Layer** (`server/routes/optimizer.js`)
   - Receives HTTP requests
   - Validates input
   - Calls service layer
   - Sends responses

2. **Service Layer** (`server/services/routeOptimizer.js`)
   - Contains business logic
   - Performs calculations
   - Returns results

3. **Server Layer** (`server/index.js`)
   - Sets up Express
   - Configures middleware
   - Connects routes

---

## Understanding the Current Backend

### File: `server/index.js`

**Purpose:** Main server file that starts everything

**Key Parts:**

```javascript
const express = require('express');
```
- Imports Express framework
- Express makes it easy to create web servers

```javascript
const app = express();
app.use(cors());
app.use(express.json());
```
- `app`: The Express application
- `cors()`: Allows frontend (port 3000) to call backend (port 5000)
- `express.json()`: Automatically parses JSON request bodies

```javascript
app.use('/api/optimize', routeOptimizer);
```
- Connects routes: any request to `/api/optimize/*` goes to `routeOptimizer.js`

```javascript
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
- Starts the server listening on port 5000
- Server is now ready to accept requests

### File: `server/routes/optimizer.js`

**Purpose:** Defines API endpoints

**Current Endpoints:**

#### 1. POST `/api/optimize`
**What it does:** Optimizes a delivery route

**Request Body:**
```json
{
  "stops": [
    {
      "id": 1,
      "name": "Customer 1",
      "lat": 40.7128,
      "lng": -74.0060,
      "priority": 1,
      "urgent": false
    }
  ],
  "startLocation": {
    "lat": 40.7580,
    "lng": -73.9855,
    "name": "Food Truck"
  },
  "options": {
    "enableClustering": false,
    "clusterDistance": 2
  }
}
```

**Response:**
```json
{
  "route": [
    {
      "id": 1,
      "name": "Customer 1",
      "lat": 40.7128,
      "lng": -74.0060,
      "order": 1,
      "distanceFromPrevious": 0
    }
  ],
  "statistics": {
    "totalStops": 1,
    "totalDistance": 0,
    "estimatedTime": 0,
    "averageDistancePerStop": 0
  },
  "optimized": true
}
```

**Code Breakdown:**
```javascript
router.post('/', async (req, res) => {
```
- `router.post`: Handles POST requests
- `'/'`: Relative to `/api/optimize`, so full path is `/api/optimize`
- `async`: Allows using `await` for asynchronous operations
- `req`: Request object (contains data from frontend)
- `res`: Response object (used to send data back)

```javascript
const { stops, startLocation, options } = req.body;
```
- Extracts data from request body
- `req.body` contains the JSON data sent from frontend
- Destructuring: `{ stops, ... }` extracts `stops` from `req.body`

```javascript
if (!stops || !Array.isArray(stops) || stops.length === 0) {
  return res.status(400).json({ error: 'Stops array is required' });
}
```
- **Validation:** Checks if data is valid
- `res.status(400)`: Sets HTTP status code to 400 (Bad Request)
- `res.json()`: Sends JSON response
- `return`: Stops execution (doesn't continue to next lines)

```javascript
const optimizedRoute = optimizeRoute(stops, startLocation, options || {});
res.json(optimizedRoute);
```
- Calls the optimization function
- `options || {}`: Uses options if provided, otherwise empty object
- `res.json()`: Sends result back as JSON (status 200 by default)

#### 2. POST `/api/optimize/distance-matrix`
**What it does:** Calculates distances between all locations

**Request Body:**
```json
{
  "locations": [
    {"lat": 40.7128, "lng": -74.0060},
    {"lat": 40.7580, "lng": -73.9855}
  ]
}
```

**Response:**
```json
[
  [0, 8.5],
  [8.5, 0]
]
```
- Matrix where `[i][j]` = distance from location i to location j

### File: `server/services/routeOptimizer.js`

**Purpose:** Contains the route optimization algorithm

**Key Functions:**

#### 1. `haversineDistance(lat1, lon1, lat2, lon2)`
**What it does:** Calculates distance between two coordinates

**How it works:**
- Uses the Haversine formula
- Accounts for Earth's curvature
- Returns distance in kilometers

**Example:**
```javascript
const distance = haversineDistance(40.7128, -74.0060, 40.7580, -73.9855);
// Returns: ~8.5 km
```

#### 2. `calculateDistanceMatrix(locations)`
**What it does:** Creates a matrix of all distances

**Why it's useful:**
- Pre-calculates all distances once
- Algorithm can quickly look up distances
- More efficient than calculating on-the-fly

**Example:**
```javascript
const matrix = calculateDistanceMatrix([
  {lat: 40.7128, lng: -74.0060},  // Location 0
  {lat: 40.7580, lng: -73.9855}  // Location 1
]);
// Returns: [[0, 8.5], [8.5, 0]]
// matrix[0][1] = distance from location 0 to location 1
```

#### 3. `optimizeRoute(stops, startLocation, options)`
**What it does:** Main optimization function

**Steps:**
1. Validates input
2. Creates locations array (start + stops)
3. Calculates distance matrix
4. Applies clustering (if enabled)
5. Runs optimization algorithm
6. Returns optimized route with statistics

**Returns:**
```javascript
{
  route: [
    {
      id: 1,
      name: "Customer 1",
      lat: 40.7128,
      lng: -74.0060,
      order: 1,
      distanceFromPrevious: 2.5,
      vehicleDistance: 2.8,      // Truck to parking
      walkingDistance: 0.1,       // Parking to delivery
      parkingLocation: {
        lat: 40.7130,
        lng: -74.0058,
        walkingDistance: 0.1,
        estimatedWalkingTime: 1.0
      },
      estimatedVehicleTime: 4.2,
      estimatedWalkingTime: 1.0
    }
  ],
  statistics: {
    totalStops: 5,
    totalDistance: 12.5,
    totalVehicleDistance: 14.2,   // Total driving distance
    totalWalkingDistance: 0.5,     // Total walking distance
    estimatedTime: 18.75,
    estimatedVehicleTime: 21.3,    // Total driving time
    estimatedWalkingTime: 5.0,     // Total walking time
    averageDistancePerStop: 2.5
  },
  optimized: true,
  routeType: "vehicle-and-walking"
}
```

#### 4. `findParkingLocation(deliveryLat, deliveryLng, options)`
**What it does:** Finds a parking location near a delivery point

**How it works:**
- Searches for parking within a radius (default: 100m)
- Returns parking coordinates and walking distance
- In production, would use a parking API (Google Places, Parkopedia)

**Returns:**
```javascript
{
  lat: 40.7130,
  lng: -74.0058,
  walkingDistance: 0.1,  // km
  estimatedWalkingTime: 1.0  // minutes
}
```

#### 5. `calculateVehicleDistance(lat1, lon1, lat2, lon2)`
**What it does:** Calculates vehicle route distance (accounts for roads)

**How it works:**
- Uses haversine distance with a multiplier (1.3x) to account for roads
- Real roads are typically 1.2-1.5x longer than straight-line distance
- In production, would use Google Maps Directions API for accurate road routes

#### 6. `calculateWalkingDistance(lat1, lon1, lat2, lon2)`
**What it does:** Calculates walking distance (more accurate for short distances)

**How it works:**
- Uses haversine distance with a small multiplier (1.1x)
- Walking paths are closer to straight-line for short distances
- More accurate than vehicle distance for walking

#### 7. `nearestNeighborOptimized(stops, startLocation, distanceMatrix)`
**What it does:** The actual optimization algorithm

**Algorithm Type:** Greedy Nearest Neighbor with enhancements

**How it works:**
1. Start at start location
2. For each unvisited stop:
   - Find parking location near delivery
   - Calculate vehicle distance (truck to parking)
   - Calculate walking distance (parking to delivery)
   - Calculate a "score" considering all factors
3. Pick the stop with the lowest score
4. Add it to the route with parking and distances
5. Repeat until all stops are visited

**Score Calculation:**

**For the FIRST stop (from start location):**
- **Prioritizes closest distance** (pure distance-based selection)
- Only considers other factors (urgency, priority 1) if they would significantly impact the route
- Formula: `score = vehicleDistance` (pure distance)
- Exception: If urgent or priority 1, uses `score = vehicleDistance * 0.85` with small adjustments

**For subsequent stops:**
- **Balanced optimization** considering all factors
- Formula:
```javascript
let score = vehicleDistance;                    // Base: vehicle distance
score *= (4 - priority) / 3;                    // Priority multiplier
if (stop.urgent) score *= 0.5;                  // Urgent bonus
// Time window penalties added if applicable
```

**Priority Multipliers (for subsequent stops):**
- Priority 1 (High): score × 1.0 (highest priority)
- Priority 2 (Medium): score × 0.67
- Priority 3 (Low): score × 0.33 (lowest priority)

**Time Window Handling:**
- Too early: Add waiting penalty
- Too late: Heavy penalty (10×)
- On time: No penalty

**Optimization Strategy:**
1. **First stop**: Always goes to the closest destination (ensures efficient start)
2. **Remaining stops**: Optimized considering distance, priority, time windows, and urgency (ensures overall route efficiency)

---

## Common Backend Tasks

### Task 1: Add a New API Endpoint

**Example: Get route statistics without optimizing**

In `server/routes/optimizer.js`:
```javascript
router.get('/stats', async (req, res) => {
  try {
    const { stops, startLocation } = req.query;
    
    if (!stops || !startLocation) {
      return res.status(400).json({ 
        error: 'stops and startLocation are required' 
      });
    }
    
    // Parse query parameters
    const stopsArray = JSON.parse(stops);
    const start = JSON.parse(startLocation);
    
    // Calculate statistics
    const stats = calculateRouteStats(stopsArray, start);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Usage:**
```
GET /api/optimize/stats?stops=[...]&startLocation={...}
```

### Task 2: Add Input Validation

**Example: Validate coordinates**

In `server/routes/optimizer.js`:
```javascript
function validateCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Latitude and longitude must be numbers');
  }
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
}

router.post('/', async (req, res) => {
  try {
    // Validate start location
    validateCoordinates(
      req.body.startLocation.lat,
      req.body.startLocation.lng
    );
    
    // Validate all stops
    req.body.stops.forEach(stop => {
      validateCoordinates(stop.lat, stop.lng);
    });
    
    // Continue with optimization...
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Task 3: Add Error Logging

**Example: Log errors to file**

```javascript
const fs = require('fs');

function logError(error, context) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context: context
  };
  
  fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n');
}

router.post('/', async (req, res) => {
  try {
    // ... optimization code
  } catch (error) {
    logError(error, { endpoint: '/api/optimize', body: req.body });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Task 4: Add Caching

**Example: Cache optimization results**

```javascript
const cache = new Map();

function getCacheKey(stops, startLocation) {
  return JSON.stringify({ stops, startLocation });
}

router.post('/', async (req, res) => {
  try {
    const cacheKey = getCacheKey(req.body.stops, req.body.startLocation);
    
    // Check cache
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }
    
    // Optimize
    const result = optimizeRoute(
      req.body.stops,
      req.body.startLocation,
      req.body.options
    );
    
    // Store in cache
    cache.set(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Task 5: Add Database Integration

**Example: Save routes to MongoDB**

```javascript
const mongoose = require('mongoose');

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

// Define schema
const RouteSchema = new mongoose.Schema({
  stops: Array,
  startLocation: Object,
  optimizedRoute: Object,
  createdAt: { type: Date, default: Date.now }
});

const Route = mongoose.model('Route', RouteSchema);

// Save route
router.post('/', async (req, res) => {
  try {
    const result = optimizeRoute(
      req.body.stops,
      req.body.startLocation,
      req.body.options
    );
    
    // Save to database
    const savedRoute = await Route.create({
      stops: req.body.stops,
      startLocation: req.body.startLocation,
      optimizedRoute: result
    });
    
    res.json({ ...result, id: savedRoute._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get route history
router.get('/history', async (req, res) => {
  try {
    const routes = await Route.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Testing Your Backend

### Method 1: Using curl

**Test optimize endpoint:**
```bash
curl -X POST http://localhost:5000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "stops": [
      {"id": 1, "lat": 40.7128, "lng": -74.0060, "name": "Stop 1"}
    ],
    "startLocation": {"lat": 40.7580, "lng": -73.9855, "name": "Start"}
  }'
```

### Method 2: Using Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:5000/api/optimize`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "stops": [
    {"id": 1, "lat": 40.7128, "lng": -74.0060, "name": "Stop 1"}
  ],
  "startLocation": {"lat": 40.7580, "lng": -73.9855, "name": "Start"}
}
```
6. Click Send

### Method 3: Using the Frontend

- The frontend already calls your backend
- Just use the app and check the Network tab in browser DevTools
- You'll see the requests and responses

---

## Debugging Tips

### 1. Use console.log()

```javascript
router.post('/', async (req, res) => {
  console.log('Request received:', req.body);
  console.log('Number of stops:', req.body.stops.length);
  
  const result = optimizeRoute(...);
  
  console.log('Optimization result:', result);
  res.json(result);
});
```

### 2. Check Server Logs

When you run `npm run dev`, you'll see:
- Server startup messages
- Any console.log() output
- Error messages

### 3. Use Node.js Debugger

```bash
node --inspect server/index.js
```

Then open Chrome DevTools → Sources → Open dedicated DevTools for Node

### 4. Handle Errors Properly

```javascript
try {
  // Your code
} catch (error) {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    input: req.body
  });
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
}
```

---

## Best Practices

### 1. Always Validate Input

```javascript
if (!stops || !Array.isArray(stops)) {
  return res.status(400).json({ error: 'Invalid stops' });
}
```

### 2. Use Try-Catch for Async Operations

```javascript
router.post('/', async (req, res) => {
  try {
    // Your code
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Return Meaningful Error Messages

```javascript
res.status(400).json({ 
  error: 'Validation failed',
  details: 'Stops array is required' 
});
```

### 4. Use Environment Variables for Configuration

```javascript
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
```

### 5. Keep Functions Small and Focused

```javascript
// Good: Single responsibility
function validateStops(stops) { ... }
function calculateRoute(stops) { ... }

// Bad: Does too much
function doEverything(stops) { ... }
```

---

## Next Steps

1. **Understand the current code** - Read through all backend files
2. **Test the endpoints** - Use Postman or curl
3. **Make small changes** - Add logging, improve validation
4. **Add new features** - New endpoints, better algorithms
5. **Optimize performance** - Improve algorithm speed
6. **Add database** - Store routes, history, etc.

---

**You're ready to start developing the backend!** 🚀

