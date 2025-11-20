const express = require('express');
const router = express.Router();
const { optimizeRoute } = require('../services/routeOptimizer');
const { geocodeAddress, batchGeocode, getAutocompleteSuggestions, getPlaceDetails } = require('../services/geocodingService');
const { getRouteWeatherSummary } = require('../services/weatherService');
const { 
  getTrafficConditions, 
  analyzeRouteConditions, 
  getRouteTrafficUpdates,
  getBestRouteWithConditions 
} = require('../services/trafficConditionsService');
const { optimizeRouteWithML } = require('../services/mlRouteOptimizer');
const { extractFeatures } = require('../services/trainingDataGenerator');
const { RouteOptimizationLearner } = require('../services/mlRouteOptimizer');
const path = require('path');
const fs = require('fs');

// Optimize delivery route
router.post('/', async (req, res) => {
  try {
    const { stops, startLocation, options } = req.body;
    
    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ error: 'Stops array is required' });
    }

    if (!startLocation) {
      return res.status(400).json({ error: 'Start location is required' });
    }

    const optimizedRoute = await optimizeRoute(stops, startLocation, options || {});
    
    // Add navigation instructions if requested
    if (req.body.includeInstructions) {
      const { generateNavigationInstructions, generateSimpleInstructions, generateRouteSummary } = require('../services/navigationService');
      optimizedRoute.instructions = generateNavigationInstructions(optimizedRoute.route, startLocation);
      optimizedRoute.simpleInstructions = generateSimpleInstructions(optimizedRoute.route, startLocation);
      optimizedRoute.summary = generateRouteSummary(optimizedRoute.route, optimizedRoute.statistics);
    }
    
    res.json(optimizedRoute);
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize route', details: error.message });
  }
});

// Get distance matrix (for frontend use)
router.post('/distance-matrix', async (req, res) => {
  try {
    const { locations } = req.body;
    const { calculateDistanceMatrix } = require('../services/routeOptimizer');
    const matrix = calculateDistanceMatrix(locations);
    res.json(matrix);
  } catch (error) {
    console.error('Distance matrix error:', error);
    res.status(500).json({ error: 'Failed to calculate distance matrix' });
  }
});

// Get navigation instructions for a route
router.post('/instructions', async (req, res) => {
  try {
    const { route, startLocation } = req.body;
    
    if (!route || !Array.isArray(route)) {
      return res.status(400).json({ error: 'Route array is required' });
    }

    if (!startLocation) {
      return res.status(400).json({ error: 'Start location is required' });
    }

    const { generateNavigationInstructions, generateSimpleInstructions, generateRouteSummary } = require('../services/navigationService');
    
    const instructions = {
      detailed: generateNavigationInstructions(route, startLocation),
      simple: generateSimpleInstructions(route, startLocation),
      summary: generateRouteSummary(route, req.body.statistics || {})
    };
    
    res.json(instructions);
  } catch (error) {
    console.error('Instructions error:', error);
    res.status(500).json({ error: 'Failed to generate instructions', details: error.message });
  }
});

// Check Google Maps API status
router.get('/google-maps-status', async (req, res) => {
  try {
    const { isGoogleMapsEnabled } = require('../services/googleMapsService');
    res.json({
      enabled: isGoogleMapsEnabled(),
      message: isGoogleMapsEnabled() 
        ? 'Google Maps API is enabled' 
        : 'Google Maps API not configured. Set GOOGLE_MAPS_API_KEY environment variable.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check API status' });
  }
});

// Geocode address to coordinates
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const result = await geocodeAddress(address);
    res.json(result);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: error.message || 'Failed to geocode address' });
  }
});

// Batch geocode multiple addresses
router.post('/geocode/batch', async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Addresses array is required' });
    }

    const results = await batchGeocode(addresses);
    res.json({ results });
  } catch (error) {
    console.error('Batch geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode addresses' });
  }
});

// Get autocomplete suggestions
router.get('/geocode/autocomplete', async (req, res) => {
  try {
    const { query, location, radius } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({ suggestions: [] });
    }

    const options = {};
    if (location) {
      try {
        const [lat, lng] = location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          options.location = { lat, lng };
          options.radius = radius ? parseInt(radius) : 50000;
        }
      } catch (e) {
        // Invalid location format, ignore
      }
    }

    const suggestions = await getAutocompleteSuggestions(query, options);
    res.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get place details from place ID
router.post('/geocode/place-details', async (req, res) => {
  try {
    const { placeId } = req.body;
    
    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    const details = await getPlaceDetails(placeId);
    res.json(details);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ error: error.message || 'Failed to get place details' });
  }
});

// Get weather conditions for route
router.post('/weather', async (req, res) => {
  try {
    const { route } = req.body;
    
    if (!route || !Array.isArray(route)) {
      return res.status(400).json({ error: 'Route array is required' });
    }

    const weatherSummary = await getRouteWeatherSummary(route);
    res.json(weatherSummary);
  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({ error: 'Failed to get weather data' });
  }
});

// Reverse geocode coordinates to address
router.post('/geocode/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const { reverseGeocode } = require('../services/geocodingService');
    const result = await reverseGeocode(lat, lng);
    res.json(result);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: error.message || 'Failed to reverse geocode' });
  }
});

// Re-optimize route from current location (for missed turns)
router.post('/reoptimize', async (req, res) => {
  try {
    const { currentLocation, remainingStops, completedStops, startLocation, options } = req.body;
    
    if (!currentLocation || !remainingStops || !Array.isArray(remainingStops)) {
      return res.status(400).json({ error: 'currentLocation and remainingStops are required' });
    }

    // Re-optimize from current location
    const optimizedRoute = await optimizeRoute(remainingStops, currentLocation, options || {});
    
    res.json({
      ...optimizedRoute,
      reoptimized: true,
      completedStops: completedStops || [],
      currentLocation: currentLocation
    });
  } catch (error) {
    console.error('Re-optimization error:', error);
    res.status(500).json({ error: 'Failed to re-optimize route', details: error.message });
  }
});

// ML-based route optimization
router.post('/ml-optimize', async (req, res) => {
  try {
    const { stops, startLocation, conditions } = req.body;
    
    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ error: 'Stops array is required' });
    }

    if (!startLocation) {
      return res.status(400).json({ error: 'Start location is required' });
    }

    const modelPath = path.join(__dirname, '..', 'data', 'trained_model.json');
    if (!fs.existsSync(modelPath)) {
      return res.status(404).json({ 
        error: 'ML model not found. Please train the model first.',
        hint: 'Run: node server/scripts/trainModel.js'
      });
    }

    const model = RouteOptimizationLearner.load(modelPath);
    const routeConditions = conditions || {
      trafficLevel: 'moderate',
      weather: 'clear',
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                new Date().getHours() < 17 ? 'afternoon' : 'evening',
      timeOfDayHour: new Date().getHours()
    };

    const mlResult = optimizeRouteWithML(stops, startLocation, routeConditions, model, extractFeatures);
    
    res.json({
      route: mlResult.route,
      order: mlResult.order,
      method: 'ML',
      optimized: true
    });
  } catch (error) {
    console.error('ML optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize route with ML', details: error.message });
  }
});

// Generate training data
router.post('/ml/generate-training-data', async (req, res) => {
  try {
    const { count = 200 } = req.body;
    const { generateTrainingData, saveTrainingData } = require('../services/trainingDataGenerator');
    
    const trainingData = generateTrainingData(count);
    const filePath = saveTrainingData(trainingData);
    
    res.json({
      success: true,
      examplesGenerated: trainingData.length,
      filePath: filePath,
      message: 'Training data generated successfully'
    });
  } catch (error) {
    console.error('Training data generation error:', error);
    res.status(500).json({ error: 'Failed to generate training data', details: error.message });
  }
});

// Get traffic conditions for a route segment
router.post('/traffic-conditions', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const traffic = await getTrafficConditions(origin, destination);
    res.json(traffic);
  } catch (error) {
    console.error('Traffic conditions error:', error);
    res.status(500).json({ error: 'Failed to get traffic conditions', details: error.message });
  }
});

// Analyze route conditions (traffic, weather, safety)
router.post('/route-conditions', async (req, res) => {
  try {
    const { route, startLocation } = req.body;
    
    if (!route || !Array.isArray(route) || route.length === 0) {
      return res.status(400).json({ error: 'Route array is required' });
    }

    if (!startLocation) {
      return res.status(400).json({ error: 'Start location is required' });
    }

    const conditions = await analyzeRouteConditions(route, startLocation);
    res.json(conditions);
  } catch (error) {
    console.error('Route conditions analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze route conditions', details: error.message });
  }
});

// Get real-time traffic updates for entire route
router.post('/traffic-updates', async (req, res) => {
  try {
    const { route, startLocation } = req.body;
    
    if (!route || !Array.isArray(route) || route.length === 0) {
      return res.status(400).json({ error: 'Route array is required' });
    }

    if (!startLocation) {
      return res.status(400).json({ error: 'Start location is required' });
    }

    const updates = await getRouteTrafficUpdates(route, startLocation);
    res.json({ updates, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Traffic updates error:', error);
    res.status(500).json({ error: 'Failed to get traffic updates', details: error.message });
  }
});

// Get best route considering all conditions
router.post('/best-route', async (req, res) => {
  try {
    const { origin, destination, options } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const bestRoute = await getBestRouteWithConditions(origin, destination, options);
    
    if (!bestRoute) {
      return res.status(404).json({ error: 'No route found' });
    }

    res.json(bestRoute);
  } catch (error) {
    console.error('Best route error:', error);
    res.status(500).json({ error: 'Failed to get best route', details: error.message });
  }
});

module.exports = router;

