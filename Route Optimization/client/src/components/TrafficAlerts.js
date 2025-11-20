import React, { useState, useEffect } from 'react';
import './TrafficAlerts.css';

function TrafficAlerts({ route, startLocation }) {
  const [trafficConditions, setTrafficConditions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!route || !route.length || !startLocation) {
      setTrafficConditions(null);
      return;
    }

    const fetchTrafficConditions = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/optimize/traffic-conditions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: route,
            startLocation: startLocation
          })
        });

        if (response.ok) {
          const data = await response.json();
          setTrafficConditions(data);
        }
      } catch (error) {
        console.error('Traffic conditions error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficConditions();
    
    // Update every 5 minutes
    const interval = setInterval(fetchTrafficConditions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [route, startLocation]);

  if (!trafficConditions || !trafficConditions.traffic || trafficConditions.traffic.length === 0) {
    return null;
  }

  // Find worst traffic condition
  const worstTraffic = trafficConditions.traffic.reduce((worst, current) => {
    const worstDelay = worst.delay || 0;
    const currentDelay = current.delay || 0;
    return currentDelay > worstDelay ? current : worst;
  }, trafficConditions.traffic[0]);

  const getTrafficIcon = (level) => {
    switch (level) {
      case 'severe': return '🔴';
      case 'heavy': return '🟠';
      case 'moderate': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTrafficColor = (level) => {
    switch (level) {
      case 'severe': return '#ea4335';
      case 'heavy': return '#fbbc04';
      case 'moderate': return '#fbbc04';
      case 'low': return '#34a853';
      default: return '#5f6368';
    }
  };

  if (worstTraffic.level === 'low' && trafficConditions.safety.overall === 'good') {
    return null; // Don't show if traffic is good and no safety issues
  }

  return (
    <div className="TrafficAlerts">
      <div className="TrafficAlerts-header">
        <span className="TrafficAlerts-icon">{getTrafficIcon(worstTraffic.level)}</span>
        <h3>Traffic & Road Conditions</h3>
      </div>

      {loading && (
        <div className="TrafficAlerts-loading">
          <small>Updating traffic conditions...</small>
        </div>
      )}

      {worstTraffic && worstTraffic.level !== 'low' && (
        <div 
          className="TrafficAlerts-alert"
          style={{ borderLeftColor: getTrafficColor(worstTraffic.level) }}
        >
          <div className="TrafficAlerts-alert-header">
            <strong>{worstTraffic.message || `Traffic: ${worstTraffic.level}`}</strong>
            {worstTraffic.delay > 0 && (
              <span className="TrafficAlerts-delay">
                +{worstTraffic.delay.toFixed(1)} min delay
              </span>
            )}
          </div>
          {worstTraffic.recommendation && (
            <p className="TrafficAlerts-recommendation">
              {worstTraffic.recommendation}
            </p>
          )}
        </div>
      )}

      {trafficConditions.safety && trafficConditions.safety.overall !== 'good' && (
        <div className="TrafficAlerts-safety">
          <div className="TrafficAlerts-safety-header">
            <strong>⚠️ Safety Assessment: {trafficConditions.safety.overall.toUpperCase()}</strong>
          </div>
          {trafficConditions.safety.factors.length > 0 && (
            <ul className="TrafficAlerts-safety-factors">
              {trafficConditions.safety.factors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          )}
          {trafficConditions.safety.warnings.length > 0 && (
            <div className="TrafficAlerts-warnings">
              {trafficConditions.safety.warnings.map((warning, index) => (
                <div key={index} className="TrafficAlerts-warning">
                  <strong>{warning.type}:</strong> {warning.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {trafficConditions.recommendations && trafficConditions.recommendations.length > 0 && (
        <div className="TrafficAlerts-recommendations">
          <strong>Recommendations:</strong>
          <ul>
            {trafficConditions.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {trafficConditions.traffic.length > 1 && (
        <details className="TrafficAlerts-details">
          <summary>View all traffic segments ({trafficConditions.traffic.length})</summary>
          <div className="TrafficAlerts-segments">
            {trafficConditions.traffic.map((segment, index) => (
              <div key={index} className="TrafficAlerts-segment">
                <div className="TrafficAlerts-segment-header">
                  <span>Stop {segment.stopOrder}</span>
                  <span 
                    className="TrafficAlerts-segment-level"
                    style={{ color: getTrafficColor(segment.level) }}
                  >
                    {getTrafficIcon(segment.level)} {segment.level}
                  </span>
                </div>
                {segment.delay > 0 && (
                  <small>Delay: +{segment.delay.toFixed(1)} min</small>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default TrafficAlerts;

