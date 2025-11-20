import React from 'react';
import './StopList.css';

function StopList({ stops, onRemoveStop, onUpdateStop, currentLocation }) {
  if (stops.length === 0) {
    return (
      <div className="StopList">
        <h2>Delivery Stops</h2>
        <p className="StopList-empty">No stops added yet. Click on the map or use "Add Stop" to add delivery locations.</p>
      </div>
    );
  }

  return (
    <div className="StopList">
      <h2>Delivery Stops ({stops.length})</h2>
      <div className="StopList-items">
        {stops.map((stop, index) => (
          <div key={stop.id} className="StopList-item">
            <div className="StopList-item-header">
              <span className="StopList-item-number">#{index + 1}</span>
              <div className="StopList-item-actions">
                {currentLocation && (
                  <button
                    onClick={() => {
                      if (window.confirm('Update this stop to your current location? This will re-optimize the route and may affect other deliveries.')) {
                        onUpdateStop(stop.id, {
                          lat: currentLocation.lat,
                          lng: currentLocation.lng,
                          address: `Current Location (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`
                        });
                      }
                    }}
                    className="StopList-item-update-location"
                    title="Update to current location"
                  >
                    📍
                  </button>
                )}
                <button
                  onClick={() => onRemoveStop(stop.id)}
                  className="StopList-item-remove"
                  title="Remove stop"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="StopList-item-content">
              <h3>{stop.name}</h3>
              {stop.address && <p className="StopList-item-address">{stop.address}</p>}
              <div className="StopList-item-badges">
                {stop.urgent && (
                  <span className="StopList-badge urgent">⚡ URGENT</span>
                )}
                <span className={`StopList-badge priority-${stop.priority || 3}`}>
                  Priority {stop.priority || 3}
                </span>
              </div>
              {stop.timeWindow && (
                <div className="StopList-item-timewindow">
                  <small>
                    Time Window: {new Date(stop.timeWindow.start).toLocaleString()} - {new Date(stop.timeWindow.end).toLocaleString()}
                  </small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StopList;

