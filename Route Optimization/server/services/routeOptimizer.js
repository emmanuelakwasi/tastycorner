/**
 * Route Optimization Service
 * Implements TSP-like algorithm with food truck specific features:
 * - Time windows
 * - Priority levels
 * - Customer clustering
 * - Multi-stop optimization
 * - Vehicle routes (truck to parking)
 * - Walking routes (parking to delivery)
 */

// Haversine formula to calculate distance between two coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest parking location to delivery point
// Uses Google Places API if available, otherwise estimates
async function findParkingLocation(deliveryLat, deliveryLng, options = {}) {
  const parkingRadius = options.parkingRadius || 0.1; // 100 meters default
  
  // Try to use Google Places API if available
  try {
    const { findNearbyParking } = require('./googleMapsService');
    const parking = await findNearbyParking(
      { lat: deliveryLat, lng: deliveryLng },
      parkingRadius * 1000 // Convert to meters
    );
    return parking;
  } catch (error) {
    // Fallback to estimated parking
    console.log('Using estimated parking (API not available)');
  }
  
  // Fallback: Estimate parking location
  const offset = parkingRadius / 111; // Rough conversion: 1 degree ≈ 111 km
  
  // Try to find parking on a nearby street (simplified)
  const parkingLat = deliveryLat + (Math.random() - 0.5) * offset * 0.5;
  const parkingLng = deliveryLng + (Math.random() - 0.5) * offset * 0.5;
  
  const walkingDistance = haversineDistance(
    parkingLat, parkingLng,
    deliveryLat, deliveryLng
  );
  
  return {
    lat: parkingLat,
    lng: parkingLng,
    name: 'Estimated Parking',
    address: null,
    walkingDistance: walkingDistance,
    estimatedWalkingTime: walkingDistance * 10, // minutes (rough estimate)
    fallback: true
  };
}

// Calculate vehicle route distance (accounts for roads, not straight line)
// Uses Google Maps Directions API if available, otherwise estimates
async function calculateVehicleDistance(lat1, lon1, lat2, lon2) {
  // Try to use Google Maps Directions API if available
  try {
    const { getDirections } = require('./googleMapsService');
    const directions = await getDirections(
      { lat: lat1, lng: lon1 },
      { lat: lat2, lng: lon2 },
      'driving'
    );
    return {
      distance: directions.distance,
      duration: directions.duration,
      polyline: directions.polyline,
      steps: directions.steps,
      fallback: directions.fallback
    };
  } catch (error) {
    // Fallback to estimated distance
    const straightDistance = haversineDistance(lat1, lon1, lat2, lon2);
    const roadMultiplier = 1.3; // Average road distance multiplier
    return {
      distance: straightDistance * roadMultiplier,
      duration: (straightDistance * roadMultiplier) * 1.5, // minutes
      polyline: null,
      steps: [],
      fallback: true
    };
  }
}

// Calculate walking distance using walking paths
// Uses Google Maps Directions API with 'walking' mode if available
async function calculateWalkingDistance(lat1, lon1, lat2, lon2) {
  // Try to use Google Maps Directions API with walking mode
  try {
    const { getDirections } = require('./googleMapsService');
    const directions = await getDirections(
      { lat: lat1, lng: lon1 },
      { lat: lat2, lng: lon2 },
      'walking' // Use walking mode for pedestrian paths
    );
    return {
      distance: directions.distance,
      duration: directions.duration,
      polyline: directions.polyline,
      steps: directions.steps,
      fallback: directions.fallback
    };
  } catch (error) {
    // Fallback to estimated distance
    const straightDistance = haversineDistance(lat1, lon1, lat2, lon2);
    const walkingMultiplier = 1.1; // Slight multiplier for walking paths
    return {
      distance: straightDistance * walkingMultiplier,
      duration: (straightDistance * walkingMultiplier) * 10, // minutes (walking speed)
      polyline: null,
      steps: [],
      fallback: true
    };
  }
}

// Calculate distance matrix for all locations
// Uses vehicle distance estimate (accounts for roads) for better optimization
function calculateDistanceMatrix(locations) {
  const matrix = [];
  for (let i = 0; i < locations.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        // Use haversine distance with road multiplier for vehicle routing
        // This gives better optimization than straight-line distance
        const straightDist = haversineDistance(
          locations[i].lat,
          locations[i].lng,
          locations[j].lat,
          locations[j].lng
        );
        // Apply road multiplier (1.3x) to approximate actual driving distance
        // This makes optimization more accurate for vehicle routes
        const vehicleDist = straightDist * 1.3;
        matrix[i][j] = vehicleDist;
      }
    }
  }
  return matrix;
}

// Cluster nearby stops to optimize route
function clusterStops(stops, maxClusterDistance = 2) {
  const clusters = [];
  const used = new Set();

  stops.forEach((stop, index) => {
    if (used.has(index)) return;

    const cluster = [stop];
    used.add(index);

    stops.forEach((otherStop, otherIndex) => {
      if (used.has(otherIndex) || index === otherIndex) return;

      const distance = haversineDistance(
        stop.lat,
        stop.lng,
        otherStop.lat,
        otherStop.lng
      );

      if (distance <= maxClusterDistance) {
        cluster.push(otherStop);
        used.add(otherIndex);
      }
    });

    clusters.push(cluster);
  });

  return clusters;
}

// Nearest Neighbor algorithm with enhancements for food truck delivery
async function nearestNeighborOptimized(stops, startLocation, distanceMatrix) {
  const route = [];
  const visited = new Set();
  let currentIndex = 0; // Start location index
  let totalDistance = 0;

  // Add start location
  route.push({
    ...startLocation,
    type: 'start',
    order: 0
  });

  // Sort stops by priority and time window
  const sortedStops = [...stops].sort((a, b) => {
    // Priority first (higher priority = lower number)
    if (a.priority !== b.priority) {
      return (a.priority || 3) - (b.priority || 3);
    }
    // Then by earliest time window
    if (a.timeWindow && b.timeWindow) {
      return a.timeWindow.start - b.timeWindow.start;
    }
    return 0;
  });

  let currentOrder = 1;
  let currentTime = new Date().getTime(); // Current time in milliseconds
  let isFirstStop = true; // Track if this is the first stop from start location

  while (sortedStops.length > 0) {
    let bestIndex = -1;
    let bestScore = Infinity;
    let bestStop = null;

    sortedStops.forEach((stop, index) => {
      if (visited.has(index)) return;

      const stopIndex = stops.indexOf(stop);
      // Use vehicle distance from matrix (already accounts for roads)
      const vehicleDistance = distanceMatrix[currentIndex][stopIndex + 1]; // +1 because start is at 0
      
      // Calculate score - prioritize closest destination first, then optimize overall route
      let score = vehicleDistance;

      // For the FIRST stop: prioritize closest distance (90% weight on distance)
      // Only override if urgent or very high priority (priority 1)
      if (isFirstStop) {
        const priority = stop.priority || 3;
        // For first stop, use distance as primary factor
        // Only consider other factors if urgent or priority 1
        if (stop.urgent || priority === 1) {
          // Still prioritize distance but allow urgent/high priority to influence
          score = vehicleDistance * 0.85; // 85% weight on distance
          // Small adjustment for urgency/priority
          if (stop.urgent) score *= 0.9;
          if (priority === 1) score *= 0.95;
        } else {
          // Pure distance-based for first stop
          score = vehicleDistance;
        }
      } else {
        // For subsequent stops: balanced optimization (consider all factors)
        // Priority multiplier (higher priority = lower score)
        const priority = stop.priority || 3;
        score *= (4 - priority) / 3; // Priority 1 gets 1x, priority 3 gets 0.33x

        // Time window penalty
        if (stop.timeWindow) {
          // Use vehicle distance for time estimation (more accurate)
          // Estimate: 1km = 1.5 minutes for vehicle (40 km/h average)
          const estimatedArrival = currentTime + (vehicleDistance * 1.5 * 60000);
          const windowStart = stop.timeWindow.start;
          const windowEnd = stop.timeWindow.end;

          if (estimatedArrival < windowStart) {
            // Too early - add waiting penalty
            score += (windowStart - estimatedArrival) / 60000; // Penalty in minutes
          } else if (estimatedArrival > windowEnd) {
            // Too late - heavy penalty
            score += (estimatedArrival - windowEnd) / 60000 * 10; // Heavy penalty
          }
        }

        // Urgency bonus (if marked as urgent)
        if (stop.urgent) {
          score *= 0.5; // Halve the score for urgent deliveries
        }
      }

      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
        bestStop = stop;
      }
    });

    if (bestIndex !== -1 && bestStop) {
      const stopIndex = stops.indexOf(bestStop);
      const estimatedVehicleDistance = distanceMatrix[currentIndex][stopIndex + 1];
      
      // Find parking location for this stop (await async function)
      const parkingLocation = await findParkingLocation(
        bestStop.lat,
        bestStop.lng,
        { parkingRadius: 0.1 } // 100 meters
      );

      // Calculate ACTUAL vehicle distance using Google Maps (truck to parking)
      // Get previous location (either start or previous stop's parking)
      let previousLat, previousLng;
      if (currentIndex === 0) {
        previousLat = startLocation.lat;
        previousLng = startLocation.lng;
      } else {
        // Find the previous stop in the route
        const previousStop = route[route.length - 1];
        previousLat = previousStop.parkingLocation?.lat || previousStop.lat;
        previousLng = previousStop.parkingLocation?.lng || previousStop.lng;
      }
      
      // Get actual street route from Google Maps (with traffic data)
      const vehicleRoute = await calculateVehicleDistance(
        previousLat,
        previousLng,
        parkingLocation.lat,
        parkingLocation.lng
      );
      
      // Get best route considering traffic, weather, and road conditions
      let bestRouteData = vehicleRoute;
      try {
        const { getBestRouteWithConditions } = require('./trafficConditionsService');
        const bestRoute = await getBestRouteWithConditions(
          { lat: previousLat, lng: previousLng },
          { lat: parkingLocation.lat, lng: parkingLocation.lng }
        );
        if (bestRoute && bestRoute.trafficDuration < vehicleRoute.durationInTraffic) {
          bestRouteData = {
            ...vehicleRoute,
            distance: bestRoute.distance,
            duration: bestRoute.baseDuration,
            durationInTraffic: bestRoute.trafficDuration,
            trafficDelay: bestRoute.delay,
            polyline: bestRoute.polyline,
            hasWarnings: bestRoute.hasWarnings,
            routeScore: bestRoute.score
          };
        }
      } catch (error) {
        console.log('Best route analysis not available:', error.message);
      }
      
      // Use traffic-aware duration if available
      const actualDuration = bestRouteData.durationInTraffic || bestRouteData.duration;

      // Calculate walking distance (parking to delivery) - uses walking paths
      const walkingRoute = await calculateWalkingDistance(
        parkingLocation.lat,
        parkingLocation.lng,
        bestStop.lat,
        bestStop.lng
      );

      route.push({
        ...bestStop,
        id: bestStop.id,
        order: currentOrder++,
        distanceFromPrevious: estimatedVehicleDistance, // Estimated for optimization
        vehicleDistance: bestRouteData.distance, // Actual vehicle distance
        vehicleDuration: bestRouteData.duration, // Base duration
        vehicleDurationInTraffic: bestRouteData.durationInTraffic, // Duration with traffic
        vehicleTrafficDelay: bestRouteData.trafficDelay || 0, // Traffic delay in minutes
        vehiclePolyline: bestRouteData.polyline, // Street route polyline - THIS IS KEY!
        vehicleSteps: bestRouteData.steps || vehicleRoute.steps, // Turn-by-turn for streets
        walkingDistance: walkingRoute.distance,
        walkingDuration: walkingRoute.duration,
        walkingPolyline: walkingRoute.polyline, // Walking path polyline
        walkingSteps: walkingRoute.steps, // Walking directions
        parkingLocation: parkingLocation,
        estimatedArrival: currentTime + (actualDuration * 60000), // Use traffic-aware duration
        estimatedVehicleTime: actualDuration, // Use traffic duration
        estimatedWalkingTime: walkingRoute.duration || parkingLocation.estimatedWalkingTime,
        routeConditions: {
          hasWarnings: bestRouteData.hasWarnings || false,
          routeScore: bestRouteData.routeScore || null
        }
      });

      // Update total distance with actual vehicle distance
      totalDistance += bestRouteData.distance;
      currentIndex = stopIndex + 1;
      // Update current time with actual vehicle duration (use traffic-aware duration)
      currentTime += actualDuration * 60000;
      visited.add(bestIndex);
      sortedStops.splice(bestIndex, 1);
      
      // After first stop, switch to balanced optimization
      isFirstStop = false;
    } else {
      break;
    }
  }

  return { route, totalDistance };
}

// Main optimization function
async function optimizeRoute(stops, startLocation, options = {}) {
  // Validate inputs
  if (!stops || stops.length === 0) {
    throw new Error('No stops provided');
  }

  if (!startLocation || !startLocation.lat || !startLocation.lng) {
    throw new Error('Invalid start location');
  }

  // Prepare locations array (start + stops)
  const locations = [
    { lat: startLocation.lat, lng: startLocation.lng },
    ...stops.map(s => ({ lat: s.lat, lng: s.lng }))
  ];

  // Calculate distance matrix
  const distanceMatrix = calculateDistanceMatrix(locations);

  // Apply clustering if enabled
  let processedStops = stops;
  if (options.enableClustering) {
    const clusters = clusterStops(stops, options.clusterDistance || 2);
    // For now, use cluster centers (simplified)
    processedStops = clusters.map(cluster => {
      const centerLat = cluster.reduce((sum, s) => sum + s.lat, 0) / cluster.length;
      const centerLng = cluster.reduce((sum, s) => sum + s.lng, 0) / cluster.length;
      return {
        ...cluster[0],
        lat: centerLat,
        lng: centerLng,
        clusterSize: cluster.length
      };
    });
  }

  // Try multiple optimization strategies and pick the best one
  const optimizationResults = [];
  
  // Strategy 0: ML-based optimization (if enabled and model available)
  if (options.useML !== false) {
    try {
      const { optimizeRouteWithML } = require('./mlRouteOptimizer');
      const { extractFeatures } = require('./trainingDataGenerator');
      const { RouteOptimizationLearner } = require('./mlRouteOptimizer');
      const path = require('path');
      const fs = require('fs');
      
      const modelPath = path.join(__dirname, '..', 'data', 'trained_model.json');
      if (fs.existsSync(modelPath)) {
        const model = RouteOptimizationLearner.load(modelPath);
        const conditions = {
          trafficLevel: 'moderate', // Could be enhanced with real-time data
          weather: 'clear',
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                    new Date().getHours() < 17 ? 'afternoon' : 'evening',
          timeOfDayHour: new Date().getHours()
        };
        
        const mlResult = optimizeRouteWithML(processedStops, startLocation, conditions, model, extractFeatures);
        
        // Convert ML order to full route with distances
        const mlRoute = await buildRouteFromOrder(mlResult.route, startLocation, distanceMatrix);
        optimizationResults.push({
          strategy: 'ml-optimized',
          route: mlRoute,
          totalDistance: mlRoute.reduce((sum, stop) => sum + (stop.vehicleDistance || 0), 0),
          totalTime: mlRoute.reduce((sum, stop) => sum + (stop.estimatedVehicleTime || 0), 0)
        });
      }
    } catch (error) {
      console.log('ML optimization not available:', error.message);
      // Continue with other strategies
    }
  }
  
  // Strategy 1: Nearest Neighbor (closest first, then optimize)
  const nnResult = await nearestNeighborOptimized(processedStops, startLocation, distanceMatrix);
  optimizationResults.push({
    strategy: 'nearest-neighbor',
    ...nnResult,
    totalTime: nnResult.route.reduce((sum, stop) => sum + (stop.estimatedVehicleTime || 0), 0)
  });
  
  // Strategy 2: Priority-based (if stops have different priorities)
  const hasPriorities = processedStops.some(s => s.priority && s.priority !== 3);
  if (hasPriorities) {
    const priorityResult = await priorityBasedOptimization(processedStops, startLocation, distanceMatrix);
    optimizationResults.push({
      strategy: 'priority-based',
      ...priorityResult,
      totalTime: priorityResult.route.reduce((sum, stop) => sum + (stop.estimatedVehicleTime || 0), 0)
    });
  }
  
  // Strategy 3: Time-window optimized (if stops have time windows)
  const hasTimeWindows = processedStops.some(s => s.timeWindow);
  if (hasTimeWindows) {
    const timeWindowResult = await timeWindowOptimization(processedStops, startLocation, distanceMatrix);
    optimizationResults.push({
      strategy: 'time-window',
      ...timeWindowResult,
      totalTime: timeWindowResult.route.reduce((sum, stop) => sum + (stop.estimatedVehicleTime || 0), 0)
    });
  }
  
  // Select best route based on total time (considering traffic)
  // Prefer routes with lower total time, but also consider distance
  const bestResult = optimizationResults.reduce((best, current) => {
    const bestScore = best.totalTime + (best.totalDistance * 0.5); // Time + distance penalty
    const currentScore = current.totalTime + (current.totalDistance * 0.5);
    return currentScore < bestScore ? current : best;
  });
  
  const result = bestResult;

  // Calculate statistics including vehicle and walking distances
  const totalVehicleDistance = result.route.reduce((sum, stop) => 
    sum + (stop.vehicleDistance || 0), 0
  );
  const totalWalkingDistance = result.route.reduce((sum, stop) => 
    sum + (stop.walkingDistance || 0), 0
  );
  const totalVehicleTime = result.route.reduce((sum, stop) => 
    sum + (stop.estimatedVehicleTime || 0), 0
  );
  const totalWalkingTime = result.route.reduce((sum, stop) => 
    sum + (stop.estimatedWalkingTime || 0), 0
  );

  const stats = {
    totalStops: stops.length,
    totalDistance: result.totalDistance,
    totalVehicleDistance: totalVehicleDistance,
    totalWalkingDistance: totalWalkingDistance,
    estimatedTime: result.totalDistance * 1.5, // Rough estimate: 1.5 minutes per km
    estimatedVehicleTime: totalVehicleTime,
    estimatedWalkingTime: totalWalkingTime,
    averageDistancePerStop: result.totalDistance / stops.length
  };

  // Analyze route conditions (traffic, weather, safety)
  let routeConditions = null;
  try {
    const { analyzeRouteConditions } = require('./trafficConditionsService');
    routeConditions = await analyzeRouteConditions(result.route, startLocation);
  } catch (error) {
    console.log('Route conditions analysis not available:', error.message);
  }

  return {
    route: result.route,
    statistics: stats,
    optimized: true,
    routeType: 'vehicle-and-walking', // Indicates this includes both vehicle and walking routes
    conditions: routeConditions, // Traffic, weather, and safety conditions
    bestStrategy: result.strategy
  };
}

// Helper function to build route from ML-predicted order
async function buildRouteFromOrder(orderedStops, startLocation, distanceMatrix) {
  const route = [];
  let currentLocation = startLocation;
  
  for (let i = 0; i < orderedStops.length; i++) {
    const stop = orderedStops[i];
    const vehicleDistance = haversineDistance(
      currentLocation.lat, currentLocation.lng,
      stop.lat, stop.lng
    ) * 1.3; // Road multiplier
    
    const vehicleTime = vehicleDistance * 1.5; // 1.5 min per km
    
    // Find parking
    const parking = await findParkingLocation(stop.lat, stop.lng);
    const walkingDistance = parking ? haversineDistance(
      parking.lat, parking.lng,
      stop.lat, stop.lng
    ) : 0;
    const walkingTime = walkingDistance * 10; // 10 min per km walking
    
    route.push({
      ...stop,
      order: i + 1,
      vehicleDistance,
      estimatedVehicleTime: vehicleTime,
      walkingDistance,
      estimatedWalkingTime: walkingTime,
      parkingLocation: parking
    });
    
    currentLocation = parking || stop;
  }
  
  return route;
}

module.exports = {
  optimizeRoute,
  calculateDistanceMatrix,
  haversineDistance,
  findParkingLocation,
  calculateVehicleDistance,
  calculateWalkingDistance,
  buildRouteFromOrder
};

