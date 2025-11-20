import React from 'react';
import './NextStopBanner.css';

function NextStopBanner({ optimizedRoute, startLocation }) {
  if (!optimizedRoute || !optimizedRoute.route || optimizedRoute.route.length === 0) {
    return null;
  }

  // Get the first stop (after start location)
  const firstStop = optimizedRoute.route.find(stop => stop.order === 1);
  
  if (!firstStop) {
    return null;
  }

  const distance = firstStop.vehicleDistance || firstStop.distanceFromPrevious || 0;
  const duration = firstStop.estimatedVehicleTime || 0;
  const address = firstStop.address || firstStop.name || 'Unknown address';

  return (
    <div className="NextStopBanner">
      <div className="NextStopBanner-content">
        <div className="NextStopBanner-icon">📍</div>
        <div className="NextStopBanner-info">
          <div className="NextStopBanner-label">GO TO FIRST:</div>
          <div className="NextStopBanner-address">{address}</div>
          <div className="NextStopBanner-details">
            {distance.toFixed(1)} km • {Math.round(duration)} min
          </div>
        </div>
        {firstStop.urgent && (
          <div className="NextStopBanner-urgent">URGENT</div>
        )}
      </div>
    </div>
  );
}

export default NextStopBanner;

