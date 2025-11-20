/**
 * Training Data Generator for Route Optimization ML Model
 * Generates training examples with input-output pairs for the learner algorithm
 */

/**
 * Generate training examples for route optimization
 * Each example contains input features and expected optimal route order
 */
function generateTrainingData(numExamples = 100) {
  const trainingData = [];
  
  for (let i = 0; i < numExamples; i++) {
    // Generate random scenario
    const numStops = Math.floor(Math.random() * 5) + 3; // 3-7 stops
    const stops = generateRandomStops(numStops);
    const startLocation = generateRandomLocation();
    const conditions = generateRandomConditions();
    
    // Calculate optimal route using traditional algorithm (as ground truth)
    const optimalOrder = calculateOptimalOrder(stops, startLocation, conditions);
    
    // Extract features for ML model
    const features = extractFeatures(stops, startLocation, conditions);
    
    // Create training example
    trainingData.push({
      input: {
        features: features,
        stops: stops,
        startLocation: startLocation,
        conditions: conditions
      },
      output: {
        optimalOrder: optimalOrder,
        orderVector: orderToVector(optimalOrder, numStops)
      }
    });
  }
  
  return trainingData;
}

/**
 * Generate random delivery stops
 */
function generateRandomStops(count) {
  const stops = [];
  for (let i = 0; i < count; i++) {
    stops.push({
      id: i + 1,
      lat: 32.4 + Math.random() * 0.3, // Ruston, LA area
      lng: -92.6 - Math.random() * 0.3,
      priority: Math.floor(Math.random() * 3) + 1, // 1-3
      urgent: Math.random() > 0.8, // 20% urgent
      timeWindow: Math.random() > 0.5 ? {
        start: Date.now() + Math.random() * 3600000,
        end: Date.now() + Math.random() * 7200000
      } : null
    });
  }
  return stops;
}

/**
 * Generate random start location
 */
function generateRandomLocation() {
  return {
    lat: 32.4 + Math.random() * 0.3,
    lng: -92.6 - Math.random() * 0.3
  };
}

/**
 * Generate random conditions (traffic, weather, time)
 */
function generateRandomConditions() {
  const trafficLevels = ['low', 'moderate', 'high'];
  const weatherConditions = ['clear', 'rain', 'snow', 'fog'];
  const timesOfDay = ['morning', 'afternoon', 'evening', 'night'];
  
  return {
    trafficLevel: trafficLevels[Math.floor(Math.random() * trafficLevels.length)],
    weather: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
    timeOfDay: timesOfDay[Math.floor(Math.random() * timesOfDay.length)],
    timeOfDayHour: Math.floor(Math.random() * 24) // 0-23
  };
}

/**
 * Extract features for ML model
 * These features will be used to predict optimal route order
 * Uses fixed-size feature vector to handle variable number of stops
 */
function extractFeatures(stops, startLocation, conditions) {
  const MAX_STOPS = 7; // Maximum number of stops we'll support
  const FEATURES_PER_STOP = 4; // distance, priority, urgent, timeWindow
  const GLOBAL_FEATURES = 4; // traffic, weather, timeOfDay, rushHour
  const FIXED_SIZE = (MAX_STOPS * FEATURES_PER_STOP) + GLOBAL_FEATURES;
  
  const features = new Array(FIXED_SIZE).fill(0);
  
  // For each stop (up to MAX_STOPS), extract features
  const numStops = Math.min(stops.length, MAX_STOPS);
  for (let i = 0; i < numStops; i++) {
    const stop = stops[i];
    const baseIndex = i * FEATURES_PER_STOP;
    
    // Distance from start
    const distance = calculateHaversineDistance(
      startLocation.lat, startLocation.lng,
      stop.lat, stop.lng
    );
    features[baseIndex] = distance;
    
    // Priority (normalized 0-1)
    features[baseIndex + 1] = (stop.priority || 3) / 3;
    
    // Urgent flag (0 or 1)
    features[baseIndex + 2] = stop.urgent ? 1 : 0;
    
    // Time window urgency (if exists)
    if (stop.timeWindow) {
      const now = Date.now();
      const timeUntilStart = (stop.timeWindow.start - now) / 3600000; // hours
      features[baseIndex + 3] = Math.max(0, 1 - timeUntilStart / 24); // urgency score
    } else {
      features[baseIndex + 3] = 0;
    }
  }
  
  // Global features (after all stop features)
  const globalBaseIndex = MAX_STOPS * FEATURES_PER_STOP;
  
  // Traffic level (encoded)
  const trafficEncoding = { low: 0, moderate: 0.5, high: 1 };
  features[globalBaseIndex] = trafficEncoding[conditions.trafficLevel] || 0.5;
  
  // Weather impact (encoded)
  const weatherEncoding = { clear: 0, rain: 0.3, snow: 0.5, fog: 0.4 };
  features[globalBaseIndex + 1] = weatherEncoding[conditions.weather] || 0;
  
  // Time of day (normalized 0-1)
  features[globalBaseIndex + 2] = (conditions.timeOfDayHour || 12) / 24;
  
  // Rush hour indicator (1 if 7-9am or 5-7pm)
  const hour = conditions.timeOfDayHour || 12;
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  features[globalBaseIndex + 3] = isRushHour ? 1 : 0;
  
  // Add number of stops as a feature (normalized)
  features.push(numStops / MAX_STOPS);
  
  return features;
}

/**
 * Calculate optimal order using traditional algorithm (as ground truth)
 * This serves as the "correct answer" for training
 */
function calculateOptimalOrder(stops, startLocation, conditions) {
  // Simplified version of our optimization algorithm
  const visited = new Set();
  const order = [];
  let currentLocation = startLocation;
  
  // Priority-based selection with distance consideration
  while (order.length < stops.length) {
    let bestStop = null;
    let bestScore = Infinity;
    
    stops.forEach((stop, index) => {
      if (visited.has(index)) return;
      
      const distance = calculateHaversineDistance(
        currentLocation.lat, currentLocation.lng,
        stop.lat, stop.lng
      );
      
      // Score: lower is better
      let score = distance;
      
      // Adjust for priority (higher priority = lower score)
      score -= stop.priority * 0.5;
      
      // Urgent stops get priority
      if (stop.urgent) {
        score -= 2;
      }
      
      // Traffic adjustment
      if (conditions.trafficLevel === 'high') {
        score += distance * 0.3; // Prefer closer stops in heavy traffic
      }
      
      if (score < bestScore) {
        bestScore = score;
        bestStop = { stop, index };
      }
    });
    
    if (bestStop) {
      order.push(bestStop.index);
      visited.add(bestStop.index);
      currentLocation = { lat: bestStop.stop.lat, lng: bestStop.stop.lng };
    }
  }
  
  return order;
}

/**
 * Convert order array to vector (position encoding for output)
 */
function orderToVector(order, numStops) {
  const MAX_STOPS = 7;
  // Create fixed-size vector where each element represents the position of that stop
  const vector = new Array(MAX_STOPS).fill(MAX_STOPS + 1); // Default to last position
  order.forEach((stopIndex, position) => {
    if (stopIndex < MAX_STOPS) {
      vector[stopIndex] = position + 1; // Position in route (1, 2, 3, ...)
    }
  });
  return vector;
}

/**
 * Calculate Haversine distance between two points
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
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

/**
 * Save training data to file
 */
function saveTrainingData(trainingData, filename = 'training_data.json') {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '..', 'data', filename);
  
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(filePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(trainingData, null, 2));
  console.log(`Training data saved to ${filePath}`);
  return filePath;
}

/**
 * Load training data from file
 */
function loadTrainingData(filename = 'training_data.json') {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '..', 'data', filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Training data file not found: ${filePath}`);
  }
  
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

module.exports = {
  generateTrainingData,
  extractFeatures,
  saveTrainingData,
  loadTrainingData,
  calculateOptimalOrder
};

