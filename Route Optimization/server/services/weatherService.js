/**
 * Weather Service
 * Provides weather alerts and conditions for delivery routes
 * Uses OpenWeatherMap API (free tier available)
 */

const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_ENABLED = !!OPENWEATHER_API_KEY;

/**
 * Get current weather conditions for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Weather data
 */
async function getWeatherConditions(lat, lng) {
  if (!WEATHER_ENABLED) {
    return {
      available: false,
      message: 'Weather API not configured'
    };
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: lat,
        lon: lng,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weather = response.data;
    
    return {
      available: true,
      temperature: weather.main.temp,
      feelsLike: weather.main.feels_like,
      condition: weather.weather[0].main,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
      windSpeed: weather.wind?.speed || 0,
      windDirection: weather.wind?.deg || 0,
      humidity: weather.main.humidity,
      visibility: weather.visibility / 1000, // Convert to km
      alerts: getWeatherAlerts(weather),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return {
      available: false,
      error: error.message
    };
  }
}

/**
 * Get weather alerts based on conditions
 * @param {Object} weather - Weather data from API
 * @returns {Array} - Array of alert messages
 */
function getWeatherAlerts(weather) {
  const alerts = [];
  const condition = weather.weather[0].main.toLowerCase();
  const windSpeed = weather.wind?.speed || 0; // m/s
  const visibility = weather.visibility / 1000; // km

  // Rain/Snow alerts
  if (condition.includes('rain') || condition.includes('drizzle')) {
    alerts.push({
      type: 'rain',
      severity: 'moderate',
      message: '⚠️ Rain expected - Drive carefully and allow extra time',
      icon: '🌧️'
    });
  }

  if (condition.includes('snow')) {
    alerts.push({
      type: 'snow',
      severity: 'high',
      message: '❄️ Snow conditions - Drive slowly, roads may be slippery',
      icon: '❄️'
    });
  }

  // Wind alerts
  if (windSpeed > 15) { // > 15 m/s = strong wind
    alerts.push({
      type: 'wind',
      severity: 'moderate',
      message: `💨 Strong winds (${windSpeed.toFixed(1)} m/s) - Be cautious, especially with food truck`,
      icon: '💨'
    });
  }

  // Visibility alerts
  if (visibility < 1) {
    alerts.push({
      type: 'fog',
      severity: 'high',
      message: `🌫️ Low visibility (${visibility.toFixed(1)} km) - Drive slowly with headlights on`,
      icon: '🌫️'
    });
  } else if (visibility < 5) {
    alerts.push({
      type: 'fog',
      severity: 'moderate',
      message: `🌫️ Reduced visibility (${visibility.toFixed(1)} km) - Drive carefully`,
      icon: '🌫️'
    });
  }

  // Extreme weather
  if (condition.includes('thunderstorm')) {
    alerts.push({
      type: 'storm',
      severity: 'high',
      message: '⛈️ Thunderstorm warning - Consider delaying delivery if safe',
      icon: '⛈️'
    });
  }

  return alerts;
}

/**
 * Get weather for multiple locations (route stops)
 * @param {Array} locations - Array of {lat, lng}
 * @returns {Promise<Array>} - Array of weather data for each location
 */
async function getRouteWeather(locations) {
  const weatherPromises = locations.map(loc => 
    getWeatherConditions(loc.lat, loc.lng)
  );
  
  return Promise.all(weatherPromises);
}

/**
 * Get weather summary for entire route
 * @param {Array} route - Optimized route with stops
 * @returns {Promise<Object>} - Weather summary
 */
async function getRouteWeatherSummary(route) {
  if (!route || route.length === 0) {
    return { available: false };
  }

  const locations = route.map(stop => ({
    lat: stop.lat,
    lng: stop.lng,
    name: stop.name
  }));

  const weatherData = await getRouteWeather(locations);
  
  // Collect all alerts
  const allAlerts = [];
  weatherData.forEach((weather, index) => {
    if (weather.available && weather.alerts) {
      weather.alerts.forEach(alert => {
        allAlerts.push({
          ...alert,
          location: locations[index].name,
          locationIndex: index
        });
      });
    }
  });

  // Get most severe alert
  const severityOrder = { high: 3, moderate: 2, low: 1 };
  const mostSevere = allAlerts.sort((a, b) => 
    (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
  )[0];

  return {
    available: true,
    locations: weatherData,
    alerts: allAlerts,
    mostSevereAlert: mostSevere,
    hasAlerts: allAlerts.length > 0
  };
}

module.exports = {
  getWeatherConditions,
  getRouteWeather,
  getRouteWeatherSummary,
  getWeatherAlerts
};

