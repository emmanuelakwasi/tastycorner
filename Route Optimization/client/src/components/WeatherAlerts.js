import React, { useEffect, useState } from 'react';
import { getRouteWeather } from '../services/api';
import './WeatherAlerts.css';

function WeatherAlerts({ route }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route && route.length > 0) {
      loadWeather();
    }
  }, [route]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const weatherData = await getRouteWeather(route);
      setWeather(weatherData);
    } catch (error) {
      console.error('Weather load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!route || route.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="WeatherAlerts">
        <div className="WeatherAlerts-loading">Loading weather conditions...</div>
      </div>
    );
  }

  if (!weather || !weather.available) {
    return null;
  }

  if (!weather.hasAlerts || weather.alerts.length === 0) {
    return (
      <div className="WeatherAlerts">
        <div className="WeatherAlerts-good">
          ✅ Good weather conditions for delivery
        </div>
      </div>
    );
  }

  const mostSevere = weather.mostSevereAlert;

  return (
    <div className="WeatherAlerts">
      <h3>🌤️ Weather Alerts</h3>
      {mostSevere && (
        <div className={`WeatherAlerts-alert WeatherAlerts-${mostSevere.severity}`}>
          <div className="WeatherAlerts-alert-icon">{mostSevere.icon}</div>
          <div className="WeatherAlerts-alert-content">
            <strong>{mostSevere.message}</strong>
            {mostSevere.location && (
              <small>Location: {mostSevere.location}</small>
            )}
          </div>
        </div>
      )}
      {weather.alerts.length > 1 && (
        <details className="WeatherAlerts-details">
          <summary>View all alerts ({weather.alerts.length})</summary>
          <div className="WeatherAlerts-all-alerts">
            {weather.alerts.map((alert, index) => (
              <div key={index} className={`WeatherAlerts-alert-item WeatherAlerts-${alert.severity}`}>
                <span>{alert.icon}</span>
                <span>{alert.message}</span>
                {alert.location && <small>{alert.location}</small>}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default WeatherAlerts;

