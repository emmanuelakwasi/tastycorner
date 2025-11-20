import React, { useState, useEffect } from 'react';
import './LiveDirections.css';

function LiveDirections({ optimizedRoute, currentLocation, onCompleteStop }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(null);
  const [currentStop, setCurrentStop] = useState(null);

  useEffect(() => {
    if (!optimizedRoute || !optimizedRoute.route || optimizedRoute.route.length === 0) {
      return;
    }

    // Find the current stop based on location
    const nextStop = optimizedRoute.route.find(stop => stop.order >= 1);
    if (nextStop) {
      setCurrentStop(nextStop);
      setRemainingTime(nextStop.estimatedVehicleTime || 0);
      setRemainingDistance(nextStop.vehicleDistance || 0);
    }
  }, [optimizedRoute]);

  // Update remaining time and distance based on current location
  useEffect(() => {
    if (!currentLocation || !currentStop) return;

    const updateInterval = setInterval(() => {
      // Calculate distance to next stop
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        currentStop.parkingLocation?.lat || currentStop.lat,
        currentStop.parkingLocation?.lng || currentStop.lng
      );

      // Estimate time based on distance (assuming 40 km/h average)
      const estimatedTime = (distance / 40) * 60; // minutes

      setRemainingDistance(distance);
      setRemainingTime(Math.max(0, Math.round(estimatedTime)));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(updateInterval);
  }, [currentLocation, currentStop]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCompleteStop = () => {
    if (currentStop && onCompleteStop) {
      onCompleteStop(currentStop.id);
      // Move to next stop
      const nextStop = optimizedRoute.route.find(stop => stop.order === currentStop.order + 1);
      if (nextStop) {
        setCurrentStop(nextStop);
      }
    }
  };

  if (!optimizedRoute || !currentStop) {
    return null;
  }

  const address = currentStop.address || currentStop.name || 'Unknown address';
  const steps = currentStop.vehicleSteps || [];

  return (
    <div className="LiveDirections">
      <div className="LiveDirections-header">
        <div className="LiveDirections-stop-number">Stop {currentStop.order}</div>
        <div className="LiveDirections-status">📍 Navigating</div>
      </div>

      <div className="LiveDirections-main">
        <div className="LiveDirections-address">{address}</div>
        
        <div className="LiveDirections-metrics">
          <div className="LiveDirections-metric">
            <div className="LiveDirections-metric-label">Distance</div>
            <div className="LiveDirections-metric-value">
              {remainingDistance !== null ? remainingDistance.toFixed(1) : (currentStop.vehicleDistance || 0).toFixed(1)} km
            </div>
          </div>
          <div className="LiveDirections-metric">
            <div className="LiveDirections-metric-label">Time</div>
            <div className="LiveDirections-metric-value">
              {remainingTime !== null ? remainingTime : Math.round(currentStop.estimatedVehicleTime || 0)} min
            </div>
          </div>
        </div>

        {steps.length > 0 && currentStepIndex < steps.length && (
          <div className="LiveDirections-current-step">
            <div className="LiveDirections-step-icon">
              {getStepIcon(steps[currentStepIndex])}
            </div>
            <div className="LiveDirections-step-text">
              {steps[currentStepIndex].instruction}
            </div>
            <div className="LiveDirections-step-distance">
              {steps[currentStepIndex].distance?.toFixed(1) || 0} km
            </div>
          </div>
        )}

        <div className="LiveDirections-progress">
          <div className="LiveDirections-progress-bar">
            <div 
              className="LiveDirections-progress-fill"
              style={{ 
                width: `${((currentStop.order - 1) / (optimizedRoute.route.length - 1)) * 100}%` 
              }}
            />
          </div>
          <div className="LiveDirections-progress-text">
            {currentStop.order} of {optimizedRoute.route.length} stops
          </div>
        </div>
      </div>

      <div className="LiveDirections-actions">
        <button 
          className="LiveDirections-complete-btn"
          onClick={handleCompleteStop}
        >
          ✓ Mark as Delivered
        </button>
      </div>
    </div>
  );
}

function getStepIcon(step) {
  const instruction = step.instruction?.toLowerCase() || '';
  if (instruction.includes('turn left')) return '↰';
  if (instruction.includes('turn right')) return '↱';
  if (instruction.includes('straight')) return '↑';
  if (instruction.includes('u-turn')) return '↻';
  if (instruction.includes('merge')) return '⇄';
  return '→';
}

export default LiveDirections;

