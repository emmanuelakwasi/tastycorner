# Integration Guide

This guide explains how to integrate the Food Truck Route Optimizer into your food truck management system.

## API Endpoints

### 1. Optimize Route

**Endpoint:** `POST /api/optimize`

**Request Body:**
```json
{
  "stops": [
    {
      "id": 1,
      "name": "John Doe",
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Main St, New York, NY",
      "priority": 1,
      "urgent": false,
      "timeWindow": {
        "start": 1609459200000,
        "end": 1609462800000
      }
    }
  ],
  "startLocation": {
    "lat": 40.7580,
    "lng": -73.9855,
    "name": "Food Truck Location"
  },
  "options": {
    "enableClustering": true,
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
      "name": "John Doe",
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Main St, New York, NY",
      "priority": 1,
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
      "estimatedWalkingTime": 1.0,
      "estimatedArrival": 1609459200000
    }
  ],
  "statistics": {
    "totalStops": 5,
    "totalDistance": 12.5,
    "totalVehicleDistance": 14.2,
    "totalWalkingDistance": 0.5,
    "estimatedTime": 18.75,
    "estimatedVehicleTime": 21.3,
    "estimatedWalkingTime": 5.0,
    "averageDistancePerStop": 2.5
  },
  "optimized": true,
  "routeType": "vehicle-and-walking"
}
```

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function optimizeDeliveryRoute(stops, startLocation) {
  try {
    const response = await axios.post('http://localhost:5000/api/optimize', {
      stops,
      startLocation,
      options: {
        enableClustering: true,
        clusterDistance: 2
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Route optimization failed:', error);
    throw error;
  }
}

// Example usage
const stops = [
  {
    id: 1,
    name: "Customer 1",
    lat: 40.7128,
    lng: -74.0060,
    address: "123 Main St",
    priority: 1,
    urgent: true
  }
];

const startLocation = {
  lat: 40.7580,
  lng: -73.9855,
  name: "Food Truck"
};

optimizeDeliveryRoute(stops, startLocation)
  .then(result => {
    console.log('Optimized route:', result);
  });
```

### Python

```python
import requests

def optimize_delivery_route(stops, start_location):
    url = 'http://localhost:5000/api/optimize'
    payload = {
        'stops': stops,
        'startLocation': start_location,
        'options': {
            'enableClustering': True,
            'clusterDistance': 2
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Example usage
stops = [
    {
        'id': 1,
        'name': 'Customer 1',
        'lat': 40.7128,
        'lng': -74.0060,
        'address': '123 Main St',
        'priority': 1,
        'urgent': True
    }
]

start_location = {
    'lat': 40.7580,
    'lng': -73.9855,
    'name': 'Food Truck'
}

result = optimize_delivery_route(stops, start_location)
print('Optimized route:', result)
```

## Priority Levels

- **Priority 1**: High priority - delivered first
- **Priority 2**: Medium priority - normal delivery
- **Priority 3**: Low priority - delivered last

## Time Windows

Time windows are specified in milliseconds (Unix timestamp). The optimizer will:
- Prefer routes that arrive within the time window
- Penalize routes that arrive too early (waiting time)
- Heavily penalize routes that arrive too late

## Clustering

When clustering is enabled, nearby stops (within the cluster distance) are grouped together to optimize route efficiency. This is particularly useful for:
- Multiple deliveries in the same area
- Apartment complexes
- Office buildings with multiple orders

## Vehicle & Walking Routes

The API now returns separate vehicle and walking routes:

- **Vehicle Distance**: Distance from truck to parking location (accounts for roads)
- **Walking Distance**: Distance from parking to delivery location
- **Parking Location**: Coordinates of parking spot near each delivery
- **Vehicle Time**: Estimated driving time
- **Walking Time**: Estimated walking time

This allows drivers to:
- Know where to park for each delivery
- Plan for both driving and walking time
- See total vehicle and walking distances separately

## Best Practices

1. **Always include stop IDs**: This allows you to match optimized routes back to your original orders
2. **Set appropriate priorities**: Use priority 1 for VIP customers or time-sensitive orders
3. **Use time windows**: Set realistic time windows based on food preparation time
4. **Enable clustering**: For dense urban areas, clustering can significantly improve route efficiency
5. **Update start location**: Keep the start location updated with the food truck's current position
6. **Consider parking**: The app automatically finds parking, but you can customize parking radius in options

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `400`: Bad request (missing required fields)
- `500`: Server error

Always handle errors appropriately in your integration:

```javascript
try {
  const result = await optimizeRoute(stops, startLocation);
  // Process result
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('API Error:', error.response.data);
  } else {
    // Network or other error
    console.error('Network Error:', error.message);
  }
}
```

