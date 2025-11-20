import React, { useState, useEffect } from 'react';
import './RealTimeTracker.css';

function RealTimeTracker({ optimizedRoute, onLocationUpdate, isTracking: externalTracking }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [trafficConditions, setTrafficConditions] = useState(null);

  // Only track if enabled by user
  useEffect(() => {
    if (isEnabled && optimizedRoute && optimizedRoute.route && optimizedRoute.route.length > 0) {
      if (externalTracking !== undefined) {
        setIsTracking(externalTracking && isEnabled);
      } else {
        setIsTracking(isEnabled);
      }
    } else {
      setIsTracking(false);
    }
  }, [optimizedRoute, externalTracking, isEnabled]);

  // Track location
  useEffect(() => {
    if (!isTracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        setCurrentLocation(newLocation);

        // Calculate distance traveled
        if (lastLocation) {
          const distance = calculateDistance(
            lastLocation.lat,
            lastLocation.lng,
            newLocation.lat,
            newLocation.lng
          );
          setDistanceTraveled(prev => prev + distance);
        }

        setLastLocation(newLocation);

        // Update parent component
        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }

        // Update estimated arrival
        updateEstimatedArrival(newLocation);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, lastLocation, onLocationUpdate]);

  // Track elapsed time
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking]);

  // Fetch traffic conditions
  useEffect(() => {
    if (!currentLocation || !optimizedRoute) return;

    const fetchTrafficConditions = async () => {
      try {
        // This would call an API to get traffic conditions
        // For now, we'll simulate it
        const conditions = getTrafficConditions(currentLocation);
        setTrafficConditions(conditions);
      } catch (error) {
        console.error('Traffic conditions error:', error);
      }
    };

    const interval = setInterval(fetchTrafficConditions, 30000); // Every 30 seconds
    fetchTrafficConditions(); // Initial fetch

    return () => clearInterval(interval);
  }, [currentLocation, optimizedRoute]);

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

  const updateEstimatedArrival = (location) => {
    if (!optimizedRoute || !optimizedRoute.route) return;

    const nextStop = optimizedRoute.route.find(stop => stop.order >= 1);
    if (!nextStop) return;

    const distanceToStop = calculateDistance(
      location.lat,
      location.lng,
      nextStop.parkingLocation?.lat || nextStop.lat,
      nextStop.parkingLocation?.lng || nextStop.lng
    );

    // Estimate time based on current speed and traffic
    const avgSpeed = trafficConditions?.speed || 40; // km/h
    const estimatedMinutes = (distanceToStop / avgSpeed) * 60;
    const arrivalTime = new Date(Date.now() + estimatedMinutes * 60000);

    setEstimatedArrival(arrivalTime);
  };

  const getTrafficConditions = (location) => {
    // This would normally call a traffic API
    // For now, return simulated conditions
    return {
      level: 'moderate', // light, moderate, heavy
      speed: 35, // km/h
      delay: 5, // minutes
      incidents: []
    };
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!optimizedRoute) {
    return null;
  }

  return (
    <div className="RealTimeTracker">
      <div className="RealTimeTracker-header">
        <div className="RealTimeTracker-title">📍 Live Location</div>
        <label className="RealTimeTracker-toggle-switch">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => {
              setIsEnabled(e.target.checked);
              if (!e.target.checked) {
                setIsTracking(false);
                setCurrentLocation(null);
              }
            }}
          />
          <span className="RealTimeTracker-slider"></span>
        </label>
      </div>
      
      {isEnabled && (
        <>
          <div className="RealTimeTracker-status">
            {currentLocation ? '🟢 Tracking' : '🟡 Locating...'}
          </div>

      <div className="RealTimeTracker-stats">
        <div className="RealTimeTracker-stat">
          <div className="RealTimeTracker-stat-label">Time</div>
          <div className="RealTimeTracker-stat-value">{formatTime(elapsedTime)}</div>
        </div>
        <div className="RealTimeTracker-stat">
          <div className="RealTimeTracker-stat-label">Distance</div>
          <div className="RealTimeTracker-stat-value">{distanceTraveled.toFixed(1)} km</div>
        </div>
        {estimatedArrival && (
          <div className="RealTimeTracker-stat">
            <div className="RealTimeTracker-stat-label">ETA</div>
            <div className="RealTimeTracker-stat-value">
              {estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>

      {trafficConditions && (
        <div className="RealTimeTracker-traffic">
          <div className={`RealTimeTracker-traffic-indicator RealTimeTracker-traffic-${trafficConditions.level}`}>
            <span>🚦</span>
            <span>Traffic: {trafficConditions.level}</span>
            {trafficConditions.delay > 0 && (
              <span className="RealTimeTracker-traffic-delay">
                +{trafficConditions.delay} min delay
              </span>
            )}
          </div>
        </div>
      )}

          {currentLocation && (
            <div className="RealTimeTracker-location">
              <small>Accuracy: ±{currentLocation.accuracy?.toFixed(0) || 'N/A'}m</small>
            </div>
          )}
        </>
      )}
      
      {!isEnabled && (
        <div className="RealTimeTracker-disabled">
          <small>Enable to track your location and see it on the map</small>
        </div>
      )}
    </div>
  );
}

export default RealTimeTracker;

