import React from 'react';
import './RouteStats.css';

function RouteStats({ statistics }) {
  if (!statistics) return null;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="RouteStats">
      <h2>Route Statistics</h2>
      <div className="RouteStats-grid">
        <div className="RouteStats-item">
          <div className="RouteStats-label">Total Distance</div>
          <div className="RouteStats-value">{statistics.totalDistance.toFixed(2)} km</div>
        </div>
        <div className="RouteStats-item">
          <div className="RouteStats-label">Estimated Time</div>
          <div className="RouteStats-value">{formatTime(statistics.estimatedTime)}</div>
        </div>
        <div className="RouteStats-item">
          <div className="RouteStats-label">Total Stops</div>
          <div className="RouteStats-value">{statistics.totalStops}</div>
        </div>
        <div className="RouteStats-item">
          <div className="RouteStats-label">Avg Distance/Stop</div>
          <div className="RouteStats-value">{statistics.averageDistancePerStop.toFixed(2)} km</div>
        </div>
        {statistics.totalVehicleDistance !== undefined && (
          <>
            <div className="RouteStats-item">
              <div className="RouteStats-label">🚚 Vehicle Distance</div>
              <div className="RouteStats-value">{statistics.totalVehicleDistance.toFixed(2)} km</div>
            </div>
            <div className="RouteStats-item">
              <div className="RouteStats-label">🚚 Vehicle Time</div>
              <div className="RouteStats-value">{formatTime(statistics.estimatedVehicleTime || 0)}</div>
            </div>
            <div className="RouteStats-item">
              <div className="RouteStats-label">🚶 Walking Distance</div>
              <div className="RouteStats-value">{statistics.totalWalkingDistance.toFixed(2)} km</div>
            </div>
            <div className="RouteStats-item">
              <div className="RouteStats-label">🚶 Walking Time</div>
              <div className="RouteStats-value">{formatTime(statistics.estimatedWalkingTime || 0)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RouteStats;

