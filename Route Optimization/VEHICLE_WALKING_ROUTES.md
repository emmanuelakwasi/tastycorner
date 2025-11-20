# Vehicle & Walking Routes Feature

## Overview

The Food Truck Route Optimizer now includes separate **vehicle routes** (for driving the truck) and **walking routes** (for delivering on foot). This is essential for food truck delivery drivers who need to:

1. **Drive the truck** to a parking location near the delivery
2. **Walk from parking** to the actual delivery location

## How It Works

### 1. Parking Location Detection

For each delivery stop, the system:
- Finds a parking location within 100 meters of the delivery
- Calculates walking distance from parking to delivery
- Estimates walking time

**Current Implementation:**
- Uses estimated parking locations (simplified)
- In production, integrate with parking APIs:
  - Google Places API
  - Parkopedia API
  - Local parking databases

### 2. Vehicle Route Calculation

**Vehicle Distance:**
- Calculates distance from truck to parking location
- Accounts for road distances (not straight-line)
- Uses a multiplier (1.3x) to approximate real road distances
- In production, use Google Maps Directions API for accurate routes

**Vehicle Time:**
- Estimates based on distance
- Assumes average speed of 40 km/h
- Formula: `distance * 1.5 minutes/km`

### 3. Walking Route Calculation

**Walking Distance:**
- Calculates distance from parking to delivery
- More accurate for short distances
- Uses a small multiplier (1.1x) for walking paths

**Walking Time:**
- Estimates based on distance
- Assumes average walking speed of 6 km/h
- Formula: `distance * 10 minutes/km`

## Visual Display

### Map Markers

- **Black teardrop (🚚)**: Start location (food truck)
- **Black teardrop with number**: Delivery stops
- **Red teardrop with number**: Urgent deliveries
- **Orange "P" marker**: Parking locations

### Route Lines

- **Black solid line**: Vehicle route (truck to parking)
  - Thickness: 5px
  - Opacity: 0.7
  - Connects: Start → Parking 1 → Parking 2 → ...

- **Green dashed line**: Walking route (parking to delivery)
  - Thickness: 3px
  - Opacity: 0.6
  - Dash pattern: 10px solid, 5px gap
  - Connects: Parking → Delivery (for each stop)

## API Response Structure

### Route Object

Each stop in the optimized route includes:

```json
{
  "id": 1,
  "name": "Customer 1",
  "lat": 40.7128,
  "lng": -74.0060,
  "order": 1,
  "distanceFromPrevious": 2.5,
  "vehicleDistance": 2.8,
  "walkingDistance": 0.1,
  "parkingLocation": {
    "lat": 40.7130,
    "lng": -74.0058,
    "walkingDistance": 0.1,
    "estimatedWalkingTime": 1.0
  },
  "estimatedVehicleTime": 4.2,
  "estimatedWalkingTime": 1.0
}
```

### Statistics Object

```json
{
  "totalStops": 5,
  "totalDistance": 12.5,
  "totalVehicleDistance": 14.2,
  "totalWalkingDistance": 0.5,
  "estimatedTime": 18.75,
  "estimatedVehicleTime": 21.3,
  "estimatedWalkingTime": 5.0,
  "averageDistancePerStop": 2.5
}
```

## Backend Functions

### `findParkingLocation(deliveryLat, deliveryLng, options)`

Finds a parking location near a delivery point.

**Parameters:**
- `deliveryLat`: Delivery latitude
- `deliveryLng`: Delivery longitude
- `options`: Configuration object
  - `parkingRadius`: Maximum distance in km (default: 0.1)

**Returns:**
```javascript
{
  lat: 40.7130,
  lng: -74.0058,
  walkingDistance: 0.1,  // km
  estimatedWalkingTime: 1.0  // minutes
}
```

### `calculateVehicleDistance(lat1, lon1, lat2, lon2)`

Calculates vehicle route distance (accounts for roads).

**Parameters:**
- `lat1, lon1`: Start coordinates
- `lat2, lon2`: End coordinates

**Returns:** Distance in kilometers (with road multiplier)

**Note:** In production, use Google Maps Directions API for accurate road routes.

### `calculateWalkingDistance(lat1, lon1, lat2, lon2)`

Calculates walking distance (more accurate for short distances).

**Parameters:**
- `lat1, lon1`: Start coordinates
- `lat2, lon2`: End coordinates

**Returns:** Distance in kilometers

## Frontend Display

### Route Statistics Component

Shows separate statistics for:
- **Vehicle Distance**: Total driving distance
- **Vehicle Time**: Total driving time
- **Walking Distance**: Total walking distance
- **Walking Time**: Total walking time

### Map Component

Displays:
- Vehicle route as black solid line
- Walking routes as green dashed lines
- Parking markers as orange "P" icons
- Stop markers with order numbers

### Popup Information

When clicking on a stop marker, shows:
- Total distance
- Vehicle distance (driving)
- Walking distance
- Estimated times

## Future Enhancements

### 1. Real Parking API Integration

Replace estimated parking with real parking data:

```javascript
// Example: Google Places API
const parking = await googlePlacesAPI.findNearbyParking(
  deliveryLat,
  deliveryLng,
  { radius: 100 }
);
```

### 2. Google Maps Directions API

Get accurate road routes:

```javascript
// Example: Google Directions API
const directions = await googleDirectionsAPI.getDirections({
  origin: { lat: startLat, lng: startLng },
  destination: { lat: parkingLat, lng: parkingLng },
  mode: 'driving'
});
```

### 3. Turn-by-Turn Navigation

Add navigation instructions:
- "Turn left on Main St"
- "Park at 123 Main St"
- "Walk 50m to delivery"

### 4. Real-Time Traffic

Account for traffic conditions:
- Adjust vehicle time based on traffic
- Suggest alternative routes
- Update ETA in real-time

### 5. Parking Availability

Check parking availability:
- Real-time parking spots
- Parking restrictions
- Time-based availability

## Configuration Options

### Parking Radius

Control how far parking can be from delivery:

```javascript
{
  options: {
    parkingRadius: 0.1  // 100 meters (default)
  }
}
```

### Vehicle Speed

Adjust vehicle speed for time estimates:

```javascript
// In routeOptimizer.js
const VEHICLE_SPEED = 40; // km/h
const vehicleTime = distance / VEHICLE_SPEED * 60; // minutes
```

### Walking Speed

Adjust walking speed for time estimates:

```javascript
// In routeOptimizer.js
const WALKING_SPEED = 6; // km/h
const walkingTime = distance / WALKING_SPEED * 60; // minutes
```

## Testing

### Test Vehicle Routes

1. Add multiple stops
2. Optimize route
3. Check that vehicle route connects parking locations
4. Verify vehicle distances are reasonable

### Test Walking Routes

1. Add stops
2. Optimize route
3. Check that walking routes connect parking to delivery
4. Verify walking distances are short (< 200m)

### Test Parking Locations

1. Add stops in different areas
2. Optimize route
3. Check that parking locations are near deliveries
4. Verify parking is within 100m radius

## Troubleshooting

### Parking Too Far from Delivery

**Problem:** Parking location is more than 100m from delivery

**Solution:**
- Reduce `parkingRadius` in options
- Check if delivery location is valid
- Consider using a parking API

### Vehicle Distance Too Long

**Problem:** Vehicle distance seems unrealistic

**Solution:**
- Check if using road multiplier (1.3x)
- Consider using Google Maps Directions API
- Verify coordinates are correct

### Walking Distance Too Long

**Problem:** Walking distance is very long

**Solution:**
- Check parking radius (should be < 200m)
- Verify parking location calculation
- Consider finding closer parking

---

**This feature makes the route optimizer perfect for food truck delivery drivers!** 🚚🚶

