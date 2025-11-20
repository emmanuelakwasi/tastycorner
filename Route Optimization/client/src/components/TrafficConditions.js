import React, { useState, useEffect } from 'react';
import './TrafficConditions.css';
import { getTrafficUpdates } from '../services/api';

function TrafficConditions({ optimizedRoute, startLocation, onConditionsUpdate }) {
  const [trafficUpdates, setTrafficUpdates] = useState([]);
  const [routeConditions, setRouteConditions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch traffic updates when route changes
  useEffect(() => {
    if (!optimizedRoute || !optimizedRoute.route || !startLocation) {
      return;
    }

    const fetchTrafficUpdates = async () => {
      setIsLoading(true);
      try {
        const updates = await getTrafficUpdates(optimizedRoute.route, startLocation);
        setTrafficUpdates(updates.updates || []);
        setLastUpdate(updates.timestamp);
        
        // Also get full route conditions
        const conditions = await getRouteConditions(optimizedRoute.route, startLocation);
        setRouteConditions(conditions);
        
        if (onConditionsUpdate) {
          onConditionsUpdate(conditions);
        }
      } catch (error) {
        console.error('Failed to fetch traffic updates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrafficUpdates();
    
    // Update every 2 minutes
    const interval = setInterval(fetchTrafficUpdates, 120000);
    
    return () => clearInterval(interval);
  }, [optimizedRoute, startLocation, onConditionsUpdate]);

  if (!optimizedRoute || !optimizedRoute.route) {
    return null;
  }

  // Get overall traffic assessment
  const getOverallTraffic = () => {
    if (!trafficUpdates.length) return null;
    
    const delays = trafficUpdates.map(u => u.traffic?.delay || 0);
    const maxDelay = Math.max(...delays);
    const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
    
    let level = 'low';
    if (maxDelay > 30) level = 'severe';
    else if (maxDelay > 15) level = 'heavy';
    else if (maxDelay > 5) level = 'moderate';
    
    return { level, maxDelay, avgDelay };
  };

  const overallTraffic = getOverallTraffic();
  const safetyLevel = routeConditions?.safety?.overall || 'good';

  return (
    <div className="TrafficConditions">
      <div className="TrafficConditions-header">
        <div className="TrafficConditions-title">🚦 Route Conditions</div>
        {lastUpdate && (
          <div className="TrafficConditions-update-time">
            Updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="TrafficConditions-loading">
          <small>Updating traffic conditions...</small>
        </div>
      )}

      {overallTraffic && (
        <div className={`TrafficConditions-overall TrafficConditions-${overallTraffic.level}`}>
          <div className="TrafficConditions-overall-label">Overall Traffic</div>
          <div className="TrafficConditions-overall-value">
            {overallTraffic.level.toUpperCase()}
            {overallTraffic.maxDelay > 0 && (
              <span className="TrafficConditions-delay">
                (+{overallTraffic.maxDelay.toFixed(0)} min delay)
              </span>
            )}
          </div>
        </div>
      )}

      {routeConditions && (
        <>
          {/* Weather Conditions */}
          {routeConditions.weather && (
            <div className="TrafficConditions-section">
              <div className="TrafficConditions-section-title">🌤️ Weather</div>
              <div className="TrafficConditions-weather">
                {routeConditions.weather.summary && (
                  <div className="TrafficConditions-weather-summary">
                    {routeConditions.weather.summary}
                  </div>
                )}
                {routeConditions.weather.alerts && routeConditions.weather.alerts.length > 0 && (
                  <div className="TrafficConditions-alerts">
                    {routeConditions.weather.alerts.map((alert, idx) => (
                      <div 
                        key={idx} 
                        className={`TrafficConditions-alert TrafficConditions-alert-${alert.severity}`}
                      >
                        <strong>{alert.type}:</strong> {alert.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety Assessment */}
          {routeConditions.safety && (
            <div className="TrafficConditions-section">
              <div className="TrafficConditions-section-title">🛡️ Safety</div>
              <div className={`TrafficConditions-safety TrafficConditions-safety-${safetyLevel}`}>
                <div className="TrafficConditions-safety-level">
                  {safetyLevel === 'poor' ? '⚠️ Poor' : 
                   safetyLevel === 'moderate' ? '⚡ Moderate' : 
                   '✅ Good'}
                </div>
                {routeConditions.safety.factors && routeConditions.safety.factors.length > 0 && (
                  <div className="TrafficConditions-safety-factors">
                    {routeConditions.safety.factors.map((factor, idx) => (
                      <div key={idx} className="TrafficConditions-factor">
                        • {factor}
                      </div>
                    ))}
                  </div>
                )}
                {routeConditions.safety.warnings && routeConditions.safety.warnings.length > 0 && (
                  <div className="TrafficConditions-warnings">
                    {routeConditions.safety.warnings.map((warning, idx) => (
                      <div key={idx} className="TrafficConditions-warning">
                        ⚠️ {warning.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {routeConditions.recommendations && routeConditions.recommendations.length > 0 && (
            <div className="TrafficConditions-section">
              <div className="TrafficConditions-section-title">💡 Recommendations</div>
              <div className="TrafficConditions-recommendations">
                {routeConditions.recommendations.map((rec, idx) => (
                  <div key={idx} className="TrafficConditions-recommendation">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Traffic Updates by Segment */}
      {trafficUpdates.length > 0 && (
        <div className="TrafficConditions-section">
          <div className="TrafficConditions-section-title">📍 Segment Traffic</div>
          <div className="TrafficConditions-segments">
            {trafficUpdates.map((update, idx) => {
              const traffic = update.traffic;
              if (!traffic) return null;
              
              return (
                <div key={idx} className="TrafficConditions-segment">
                  <div className="TrafficConditions-segment-header">
                    <span className="TrafficConditions-segment-label">
                      To Stop #{update.stopOrder}
                    </span>
                    <span className={`TrafficConditions-segment-level TrafficConditions-${traffic.level}`}>
                      {traffic.level}
                    </span>
                  </div>
                  {traffic.delay > 0 && (
                    <div className="TrafficConditions-segment-delay">
                      +{traffic.delay.toFixed(1)} min delay
                    </div>
                  )}
                  {traffic.message && (
                    <div className="TrafficConditions-segment-message">
                      {traffic.message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get route conditions
async function getRouteConditions(route, startLocation) {
  try {
    const response = await fetch('/api/optimize/route-conditions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route, startLocation })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to get route conditions:', error);
    return null;
  }
}

export default TrafficConditions;

