/**
 * Traffic and Road Conditions Service
 * Provides real-time traffic updates, weather conditions, and safety factors
 * for route optimization
 */

const axios = require('axios');
const { getRouteWeatherSummary } = require('./weatherService');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ENABLED = !!GOOGLE_MAPS_API_KEY;

/**
 * Get real-time traffic conditions for a route segment
 */
async function getTrafficConditions(origin, destination) {
  if (!GOOGLE_MAPS_ENABLED) {
    return {
      level: 'unknown',
      delay: 0,
      severity: 'none',
      message: 'Traffic data unavailable (API key required)'
    };
  }

  try {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      key: GOOGLE_MAPS_API_KEY,
      traffic_model: 'best_guess',
      departure_time: 'now',
      alternatives: true // Get multiple routes to compare
    };

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const routes = response.data.routes || [];
    if (routes.length === 0) {
      return {
        level: 'unknown',
        delay: 0,
        severity: 'none'
      };
    }

    // Analyze all routes to find best one
    const routeAnalyses = routes.map((route, index) => {
      const leg = route.legs[0];
      const baseDuration = leg.duration.value / 60; // minutes
      const trafficDuration = leg.duration_in_traffic 
        ? leg.duration_in_traffic.value / 60 
        : baseDuration;
      const delay = trafficDuration - baseDuration;
      const delayPercent = (delay / baseDuration) * 100;

      // Determine traffic level
      let level = 'low';
      let severity = 'none';
      if (delayPercent > 50) {
        level = 'severe';
        severity = 'high';
      } else if (delayPercent > 25) {
        level = 'heavy';
        severity = 'moderate';
      } else if (delayPercent > 10) {
        level = 'moderate';
        severity = 'low';
      }

      return {
        routeIndex: index,
        distance: leg.distance.value / 1000,
        baseDuration,
        trafficDuration,
        delay,
        delayPercent,
        level,
        severity,
        polyline: route.overview_polyline.points
      };
    });

    // Find best route (lowest traffic delay)
    const bestRoute = routeAnalyses.reduce((best, current) => {
      return current.delay < best.delay ? current : best;
    });

    // Get overall traffic assessment
    const avgDelay = routeAnalyses.reduce((sum, r) => sum + r.delay, 0) / routeAnalyses.length;
    const maxDelay = Math.max(...routeAnalyses.map(r => r.delay));
    
    let overallLevel = 'low';
    if (maxDelay > 30) overallLevel = 'severe';
    else if (maxDelay > 15) overallLevel = 'heavy';
    else if (maxDelay > 5) overallLevel = 'moderate';

    return {
      level: overallLevel,
      delay: bestRoute.delay,
      delayPercent: bestRoute.delayPercent,
      severity: bestRoute.severity,
      bestRoute: bestRoute,
      allRoutes: routeAnalyses,
      message: getTrafficMessage(overallLevel, bestRoute.delay),
      recommendation: getTrafficRecommendation(overallLevel, bestRoute.delay)
    };
  } catch (error) {
    console.error('Traffic conditions error:', error.message);
    return {
      level: 'unknown',
      delay: 0,
      severity: 'none',
      error: error.message
    };
  }
}

/**
 * Get traffic message for display
 */
function getTrafficMessage(level, delay) {
  const messages = {
    low: `Light traffic (${delay.toFixed(1)} min delay)`,
    moderate: `Moderate traffic (${delay.toFixed(1)} min delay)`,
    heavy: `Heavy traffic (${delay.toFixed(1)} min delay)`,
    severe: `Severe traffic (${delay.toFixed(1)} min delay)`,
    unknown: 'Traffic data unavailable'
  };
  return messages[level] || messages.unknown;
}

/**
 * Get traffic recommendation
 */
function getTrafficRecommendation(level, delay) {
  if (level === 'severe' || delay > 30) {
    return 'Consider alternative route or delay departure';
  } else if (level === 'heavy' || delay > 15) {
    return 'Expect significant delays, allow extra time';
  } else if (level === 'moderate' || delay > 5) {
    return 'Minor delays expected';
  }
  return 'Normal traffic conditions';
}

/**
 * Analyze route conditions (traffic + weather + safety)
 */
async function analyzeRouteConditions(route, startLocation) {
  const conditions = {
    traffic: [],
    weather: null,
    safety: {
      overall: 'good',
      factors: [],
      warnings: []
    },
    recommendations: []
  };

  // Analyze traffic for each segment
  let previousLocation = startLocation;
  for (const stop of route) {
    const traffic = await getTrafficConditions(
      previousLocation,
      stop.parkingLocation || stop
    );
    conditions.traffic.push({
      stopId: stop.id,
      stopOrder: stop.order,
      ...traffic
    });
    previousLocation = stop.parkingLocation || stop;
  }

  // Get weather conditions
  try {
    const weather = await getRouteWeatherSummary(route);
    conditions.weather = weather;
    
    // Add weather warnings to safety
    if (weather && weather.alerts && weather.alerts.length > 0) {
      weather.alerts.forEach(alert => {
        if (alert.severity === 'high') {
          conditions.safety.warnings.push({
            type: 'weather',
            message: alert.message,
            severity: alert.severity
          });
        }
      });
    }
  } catch (error) {
    console.error('Weather analysis error:', error.message);
  }

  // Assess overall safety
  const severeTraffic = conditions.traffic.filter(t => t.level === 'severe' || t.level === 'heavy');
  const weatherWarnings = conditions.safety.warnings.filter(w => w.severity === 'high');
  
  // Check for road conditions (construction, closures, etc.)
  const hasRoadIssues = conditions.traffic.some(t => t.bestRoute?.hasWarnings);
  if (hasRoadIssues) {
    conditions.safety.factors.push('Road construction or closures detected');
    conditions.safety.warnings.push({
      type: 'road',
      message: 'Some routes may have construction or closures',
      severity: 'moderate'
    });
  }
  
  if (severeTraffic.length > 0 && weatherWarnings.length > 0) {
    conditions.safety.overall = 'poor';
    conditions.safety.factors.push('Heavy traffic and severe weather conditions');
  } else if (severeTraffic.length > 0 || hasRoadIssues) {
    conditions.safety.overall = severeTraffic.length > 2 ? 'poor' : 'moderate';
    if (severeTraffic.length > 0) {
      conditions.safety.factors.push('Heavy traffic conditions');
    }
  } else if (weatherWarnings.length > 0) {
    conditions.safety.overall = 'moderate';
    conditions.safety.factors.push('Severe weather conditions');
  }

  // Generate recommendations
  if (conditions.safety.overall === 'poor') {
    conditions.recommendations.push('Consider delaying route or using alternative paths');
  }
  if (severeTraffic.length > 0) {
    conditions.recommendations.push('Allow extra time for traffic delays');
  }
  if (weatherWarnings.length > 0) {
    conditions.recommendations.push('Exercise caution due to weather conditions');
  }
  if (hasRoadIssues) {
    conditions.recommendations.push('Watch for construction zones and road closures');
  }
  
  // Add speed recommendations based on conditions
  if (weatherWarnings.some(w => w.type === 'rain' || w.type === 'snow')) {
    conditions.recommendations.push('Reduce speed in wet/icy conditions');
  }
  if (severeTraffic.length > 0) {
    conditions.recommendations.push('Consider leaving earlier to avoid peak traffic');
  }

  return conditions;
}

/**
 * Get best route considering traffic, weather, and safety
 */
async function getBestRouteWithConditions(origin, destination, options = {}) {
  if (!GOOGLE_MAPS_ENABLED) {
    return null;
  }

  try {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      key: GOOGLE_MAPS_API_KEY,
      traffic_model: 'best_guess',
      departure_time: 'now',
      alternatives: true
    };

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params
    });

    if (response.data.status !== 'OK' || !response.data.routes) {
      return null;
    }

    // Analyze all route alternatives
    const routeOptions = response.data.routes.map((route, index) => {
      const leg = route.legs[0];
      const baseDuration = leg.duration.value / 60;
      const trafficDuration = leg.duration_in_traffic 
        ? leg.duration_in_traffic.value / 60 
        : baseDuration;
      const delay = trafficDuration - baseDuration;
      const distance = leg.distance.value / 1000;

      // Score route (lower is better)
      // Consider: traffic delay, distance, and safety
      let score = trafficDuration; // Primary: time with traffic
      score += distance * 0.5; // Secondary: distance penalty
      
      // Check for warnings in steps (construction, closures, etc.)
      const warnings = [];
      leg.steps.forEach(step => {
        const instruction = step.html_instructions.toLowerCase();
        if (instruction.includes('closed')) {
          warnings.push({ type: 'closure', message: 'Road closure detected' });
        }
        if (instruction.includes('construction')) {
          warnings.push({ type: 'construction', message: 'Construction zone ahead' });
        }
        if (instruction.includes('detour')) {
          warnings.push({ type: 'detour', message: 'Detour required' });
        }
        if (instruction.includes('toll')) {
          warnings.push({ type: 'toll', message: 'Toll road' });
        }
      });
      
      const hasWarnings = warnings.length > 0;
      if (hasWarnings) {
        score += 10; // Penalty for route issues
      }
      
      // Weather penalty (if available)
      // This would be enhanced with actual weather data along the route
      const weatherPenalty = 0; // Could be calculated based on weather conditions
      score += weatherPenalty;

      return {
        index,
        distance,
        baseDuration,
        trafficDuration,
        delay,
        score,
        polyline: route.overview_polyline.points,
        steps: leg.steps,
        hasWarnings,
        warnings: warnings,
        // Safety score (lower is better)
        safetyScore: hasWarnings ? 0.7 : 1.0
      };
    });

    // Select best route (lowest score)
    const bestRoute = routeOptions.reduce((best, current) => {
      return current.score < best.score ? current : best;
    });

    return {
      ...bestRoute,
      allOptions: routeOptions,
      selected: true
    };
  } catch (error) {
    console.error('Best route analysis error:', error.message);
    return null;
  }
}

/**
 * Get real-time traffic updates for entire route
 */
async function getRouteTrafficUpdates(route, startLocation) {
  const updates = [];
  let currentLocation = startLocation;

  for (const stop of route) {
    const traffic = await getTrafficConditions(
      currentLocation,
      stop.parkingLocation || stop
    );

    updates.push({
      from: currentLocation,
      to: stop.parkingLocation || stop,
      stopId: stop.id,
      stopOrder: stop.order,
      traffic: traffic,
      timestamp: new Date().toISOString()
    });

    currentLocation = stop.parkingLocation || stop;
  }

  return updates;
}

/**
 * Check if route should be re-optimized based on conditions
 */
function shouldReoptimize(conditions, threshold = { delay: 15, severity: 'heavy' }) {
  const severeTraffic = conditions.traffic.filter(t => 
    t.delay > threshold.delay || t.level === threshold.severity || t.level === 'severe'
  );

  const weatherWarnings = conditions.safety.warnings.filter(w => w.severity === 'high');

  return {
    shouldReoptimize: severeTraffic.length > 0 || weatherWarnings.length > 0,
    reason: severeTraffic.length > 0 
      ? `Heavy traffic detected (${severeTraffic.length} segments)`
      : weatherWarnings.length > 0
      ? `Severe weather warnings (${weatherWarnings.length} alerts)`
      : null,
    severity: severeTraffic.length > 0 ? 'traffic' : 'weather'
  };
}

module.exports = {
  getTrafficConditions,
  analyzeRouteConditions,
  getBestRouteWithConditions,
  getRouteTrafficUpdates,
  shouldReoptimize,
  getTrafficMessage,
  getTrafficRecommendation
};

