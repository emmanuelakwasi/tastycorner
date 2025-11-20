import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const optimizeRoute = async (stops, startLocation, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize`, {
      stops,
      startLocation,
      options: {
        ...options,
        includeInstructions: options.includeInstructions !== false
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getNavigationInstructions = async (route, startLocation, statistics) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/instructions`, {
      route,
      startLocation,
      statistics
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkGoogleMapsStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/optimize/google-maps-status`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getDistanceMatrix = async (locations) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/distance-matrix`, {
      locations
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/geocode`, {
      address
    });
    return response.data;
  } catch (error) {
    console.error('Geocoding Error:', error);
    throw error;
  }
};

export const getAutocompleteSuggestions = async (query, location = null) => {
  try {
    const params = { query };
    if (location) {
      params.location = location;
    }
    const response = await axios.get(`${API_BASE_URL}/optimize/geocode/autocomplete`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Autocomplete Error:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/geocode/place-details`, {
      placeId
    });
    return response.data;
  } catch (error) {
    console.error('Place Details Error:', error);
    throw error;
  }
};

export const batchGeocode = async (addresses) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/geocode/batch`, {
      addresses
    });
    return response.data;
  } catch (error) {
    console.error('Batch Geocoding Error:', error);
    throw error;
  }
};

export const getRouteWeather = async (route) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/weather`, {
      route
    });
    return response.data;
  } catch (error) {
    console.error('Weather Error:', error);
    throw error;
  }
};

export const reoptimizeRoute = async (currentLocation, remainingStops, completedStops = [], startLocation, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/reoptimize`, {
      currentLocation,
      remainingStops,
      completedStops,
      startLocation,
      options
    });
    return response.data;
  } catch (error) {
    console.error('Re-optimization Error:', error);
    throw error;
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/geocode/reverse`, {
      lat,
      lng
    });
    return response.data;
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    throw error;
  }
};

export const getTrafficConditions = async (origin, destination) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/traffic-conditions`, {
      origin,
      destination
    });
    return response.data;
  } catch (error) {
    console.error('Traffic Conditions Error:', error);
    throw error;
  }
};

export const getRouteConditions = async (route, startLocation) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/route-conditions`, {
      route,
      startLocation
    });
    return response.data;
  } catch (error) {
    console.error('Route Conditions Error:', error);
    throw error;
  }
};

export const getTrafficUpdates = async (route, startLocation) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/traffic-updates`, {
      route,
      startLocation
    });
    return response.data;
  } catch (error) {
    console.error('Traffic Updates Error:', error);
    throw error;
  }
};

export const getBestRoute = async (origin, destination, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/best-route`, {
      origin,
      destination,
      options
    });
    return response.data;
  } catch (error) {
    console.error('Best Route Error:', error);
    throw error;
  }
};

