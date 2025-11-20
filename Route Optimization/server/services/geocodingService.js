/**
 * Geocoding Service
 * Converts addresses to coordinates using Google Geocoding API
 * Falls back to estimated coordinates if API unavailable
 */

const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ENABLED = !!GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} - { lat, lng, formattedAddress, placeId }
 */
async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    throw new Error('Address is required');
  }

  // Try Google Geocoding API if available
  if (GOOGLE_MAPS_ENABLED) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          addressComponents: result.address_components,
          accuracy: 'high'
        };
      } else {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Geocoding API error:', error.message);
      // Fall through to fallback
    }
  }

  // Fallback: Return error (can't estimate coordinates from address)
  throw new Error('Geocoding service unavailable. Please provide coordinates or enable Google Maps API.');
}

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - { address, formattedAddress }
 */
async function reverseGeocode(lat, lng) {
  if (GOOGLE_MAPS_ENABLED) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
          key: GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          address: result.formatted_address,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          addressComponents: result.address_components || []
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
    }
  }

  return {
    address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  };
}

/**
 * Get autocomplete suggestions for an address query
 * @param {string} query - Partial address query
 * @param {Object} options - Options (location, radius, etc.)
 * @returns {Promise<Array>} - Array of suggestion objects
 */
async function getAutocompleteSuggestions(query, options = {}) {
  if (!query || query.trim() === '') {
    return [];
  }

  if (!GOOGLE_MAPS_ENABLED) {
    return [];
  }

  try {
    const params = {
      input: query,
      key: GOOGLE_MAPS_API_KEY,
      // No types restriction - allows addresses, establishments, and all place types
      language: 'en'
    };

    // Add location bias if provided
    if (options.location && options.location.lat && options.location.lng) {
      params.location = `${options.location.lat},${options.location.lng}`;
      params.radius = options.radius || 50000; // 50km default
    }
    
    // If location is provided as string (lat,lng), parse it
    if (typeof options === 'string' && options.includes(',')) {
      const [lat, lng] = options.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        params.location = `${lat},${lng}`;
        params.radius = 50000;
      }
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params
    });

    if (response.data.status === 'OK' && response.data.predictions) {
      return response.data.predictions.map(prediction => ({
        description: prediction.description,
        placeId: prediction.place_id,
        mainText: prediction.structured_formatting?.main_text || prediction.description,
        secondaryText: prediction.structured_formatting?.secondary_text || '',
        types: prediction.types
      }));
    }

    return [];
  } catch (error) {
    console.error('Autocomplete API error:', error.message);
    return [];
  }
}

/**
 * Get place details from place ID
 * @param {string} placeId - Google Places place ID
 * @returns {Promise<Object>} - Place details with coordinates
 */
async function getPlaceDetails(placeId) {
  if (!GOOGLE_MAPS_ENABLED) {
    throw new Error('Google Maps API not configured');
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: 'formatted_address,geometry,name,place_id'
      }
    });

    if (response.data.status === 'OK' && response.data.result) {
      const result = response.data.result;
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        name: result.name,
        placeId: result.place_id,
        accuracy: 'high'
      };
    }

    throw new Error('Place details not found');
  } catch (error) {
    console.error('Place details API error:', error.message);
    throw error;
  }
}

/**
 * Batch geocode multiple addresses
 * @param {Array<string>} addresses - Array of addresses
 * @returns {Promise<Array>} - Array of geocoded results
 */
async function batchGeocode(addresses) {
  const results = [];
  
  for (const address of addresses) {
    try {
      const geocoded = await geocodeAddress(address);
      results.push({ address, ...geocoded, success: true });
    } catch (error) {
      results.push({ address, error: error.message, success: false });
    }
  }
  
  return results;
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  batchGeocode,
  getAutocompleteSuggestions,
  getPlaceDetails
};

