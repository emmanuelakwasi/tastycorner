/**
 * Google Maps API Service
 * Provides integration with Google Maps Directions API and Places API
 * Falls back to estimated calculations if API key is not provided
 */

const axios = require('axios');

// Configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ENABLED = !!GOOGLE_MAPS_API_KEY;

/**
 * Get directions using Google Maps Directions API
 * Falls back to estimated distance if API key not available
 */
async function getDirections(origin, destination, mode = 'driving', options = {}) {
  if (!GOOGLE_MAPS_ENABLED) {
    // Fallback to estimated distance
    const { haversineDistance } = require('./routeOptimizer');
    const distance = haversineDistance(
      origin.lat, origin.lng,
      destination.lat, destination.lng
    );
    
    // Apply mode-specific multipliers
    const multipliers = {
      driving: 1.3,
      walking: 1.1,
      bicycling: 1.15
    };
    
    return {
      distance: distance * (multipliers[mode] || 1.3),
      duration: calculateEstimatedTime(distance * (multipliers[mode] || 1.3), mode),
      polyline: null,
      steps: [],
      fallback: true
    };
  }

  try {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: mode,
      key: GOOGLE_MAPS_API_KEY,
      alternatives: false,
      traffic_model: 'best_guess', // Consider traffic
      departure_time: options.departureTime || 'now' // Real-time traffic
    };

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: params
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    // Get duration in traffic if available
    const durationInTraffic = leg.duration_in_traffic 
      ? leg.duration_in_traffic.value / 60 
      : leg.duration.value / 60;

    return {
      distance: leg.distance.value / 1000, // Convert meters to km
      duration: leg.duration.value / 60, // Base duration in minutes
      durationInTraffic: durationInTraffic, // Duration with traffic
      trafficDelay: durationInTraffic - (leg.duration.value / 60), // Traffic delay in minutes
      polyline: route.overview_polyline.points,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.value / 1000,
        duration: step.duration.value / 60,
        startLocation: {
          lat: step.start_location.lat,
          lng: step.start_location.lng
        },
        endLocation: {
          lat: step.end_location.lat,
          lng: step.end_location.lng
        },
        maneuver: step.maneuver || null
      })),
      fallback: false,
      hasTrafficData: !!leg.duration_in_traffic
    };
  } catch (error) {
    console.error('Google Maps Directions API error:', error.message);
    // Fallback to estimated distance
    const { haversineDistance } = require('./routeOptimizer');
    const distance = haversineDistance(
      origin.lat, origin.lng,
      destination.lat, destination.lng
    );
    
    return {
      distance: distance * 1.3,
      duration: calculateEstimatedTime(distance * 1.3, mode),
      polyline: null,
      steps: [],
      fallback: true,
      error: error.message
    };
  }
}

/**
 * Find nearby parking using Google Places API
 * Falls back to estimated parking if API key not available
 */
async function findNearbyParking(location, radius = 100) {
  if (!GOOGLE_MAPS_ENABLED) {
    // Fallback to estimated parking
    return findEstimatedParking(location, radius);
  }

  try {
    // First, search for parking lots/garages
    const parkingResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${location.lat},${location.lng}`,
        radius: radius,
        type: 'parking',
        key: GOOGLE_MAPS_API_KEY,
        rankby: 'distance'
      }
    });

    if (parkingResponse.data.status === 'OK' && parkingResponse.data.results.length > 0) {
      const parking = parkingResponse.data.results[0];
      const parkingLocation = {
        lat: parking.geometry.location.lat,
        lng: parking.geometry.location.lng,
        name: parking.name,
        address: parking.vicinity,
        walkingDistance: calculateWalkingDistance(
          location.lat, location.lng,
          parking.geometry.location.lat, parking.geometry.location.lng
        ),
        estimatedWalkingTime: calculateWalkingTime(
          calculateWalkingDistance(
            location.lat, location.lng,
            parking.geometry.location.lat, parking.geometry.location.lng
          )
        ),
        placeId: parking.place_id,
        rating: parking.rating,
        fallback: false
      };
      
      return parkingLocation;
    }

    // If no parking found, try street parking (search for "parking" in nearby places)
    const streetParkingResponse = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: 'parking',
        location: `${location.lat},${location.lng}`,
        radius: radius * 2,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (streetParkingResponse.data.status === 'OK' && streetParkingResponse.data.results.length > 0) {
      const parking = streetParkingResponse.data.results[0];
      return {
        lat: parking.geometry.location.lat,
        lng: parking.geometry.location.lng,
        name: parking.name || 'Street Parking',
        address: parking.formatted_address,
        walkingDistance: calculateWalkingDistance(
          location.lat, location.lng,
          parking.geometry.location.lat, parking.geometry.location.lng
        ),
        estimatedWalkingTime: calculateWalkingTime(
          calculateWalkingDistance(
            location.lat, location.lng,
            parking.geometry.location.lat, parking.geometry.location.lng
          )
        ),
        placeId: parking.place_id,
        fallback: false
      };
    }

    // Fallback to estimated parking
    return findEstimatedParking(location, radius);
  } catch (error) {
    console.error('Google Places API error:', error.message);
    return findEstimatedParking(location, radius);
  }
}

/**
 * Find estimated parking location (fallback)
 */
function findEstimatedParking(location, radius) {
  const { haversineDistance } = require('./routeOptimizer');
  const offset = radius / 111000; // Convert meters to degrees
  
  // Try to find parking on a nearby street (simplified)
  const parkingLat = location.lat + (Math.random() - 0.5) * offset * 0.5;
  const parkingLng = location.lng + (Math.random() - 0.5) * offset * 0.5;
  
  const walkingDistance = haversineDistance(
    parkingLat, parkingLng,
    location.lat, location.lng
  );
  
  return {
    lat: parkingLat,
    lng: parkingLng,
    name: 'Estimated Parking',
    address: null,
    walkingDistance: walkingDistance,
    estimatedWalkingTime: calculateWalkingTime(walkingDistance),
    fallback: true
  };
}

/**
 * Calculate estimated time based on distance and mode
 */
function calculateEstimatedTime(distance, mode) {
  const speeds = {
    driving: 40,    // km/h
    walking: 6,    // km/h
    bicycling: 15  // km/h
  };
  
  const speed = speeds[mode] || 40;
  return (distance / speed) * 60; // minutes
}

/**
 * Calculate walking distance
 */
function calculateWalkingDistance(lat1, lon1, lat2, lon2) {
  const { haversineDistance } = require('./routeOptimizer');
  const straightDistance = haversineDistance(lat1, lon1, lat2, lon2);
  return straightDistance * 1.1; // Walking multiplier
}

/**
 * Calculate walking time
 */
function calculateWalkingTime(distance) {
  return distance * 10; // minutes (6 km/h = 10 min/km)
}

/**
 * Get traffic-aware directions (if traffic data available)
 */
async function getDirectionsWithTraffic(origin, destination, departureTime = null) {
  if (!GOOGLE_MAPS_ENABLED) {
    return getDirections(origin, destination, 'driving');
  }

  try {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      key: GOOGLE_MAPS_API_KEY,
      traffic_model: 'best_guess',
      alternatives: true
    };

    if (departureTime) {
      params.departure_time = departureTime;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    // Return best route with traffic data
    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.value / 1000,
      duration: leg.duration.value / 60,
      durationInTraffic: leg.duration_in_traffic ? leg.duration_in_traffic.value / 60 : null,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.value / 1000,
        duration: step.duration.value / 60,
        startLocation: {
          lat: step.start_location.lat,
          lng: step.start_location.lng
        },
        endLocation: {
          lat: step.end_location.lat,
          lng: step.end_location.lng
        }
      })),
      fallback: false,
      trafficData: true
    };
  } catch (error) {
    console.error('Google Maps Traffic API error:', error.message);
    return getDirections(origin, destination, 'driving');
  }
}

module.exports = {
  getDirections,
  findNearbyParking,
  getDirectionsWithTraffic,
  isGoogleMapsEnabled: () => GOOGLE_MAPS_ENABLED
};

