import React, { useState, useEffect } from 'react';
import { reoptimizeRoute } from '../services/api';
import './AutoReoptimize.css';

function AutoReoptimize({ 
  optimizedRoute, 
  startLocation, 
  onRouteUpdate,
  options 
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [completedStops, setCompletedStops] = useState([]);
  const [isReoptimizing, setIsReoptimizing] = useState(false);

  // Track current location
  useEffect(() => {
    if (!isTracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Location',
          timestamp: Date.now()
        };
        setCurrentLocation(newLocation);
        checkIfOffRoute(newLocation);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, optimizedRoute]);

  const checkIfOffRoute = async (location) => {
    if (!optimizedRoute || !optimizedRoute.route || optimizedRoute.route.length === 0) {
      return;
    }

    // Find nearest point on route
    const nextStop = optimizedRoute.route.find(stop => 
      !completedStops.includes(stop.id)
    );

    if (!nextStop) return;

    // Calculate distance to next stop
    const distance = calculateDistance(
      location.lat,
      location.lng,
      nextStop.parkingLocation?.lat || nextStop.lat,
      nextStop.parkingLocation?.lng || nextStop.lng
    );

    // If driver is more than 500m off route, re-optimize
    if (distance > 0.5) {
      await handleReoptimize(location);
    }
  };

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

  const handleReoptimize = async (location) => {
    if (isReoptimizing) return;

    setIsReoptimizing(true);
    try {
      const remainingStops = optimizedRoute.route.filter(stop => 
        !completedStops.includes(stop.id)
      );

      if (remainingStops.length === 0) {
        return;
      }

      const newRoute = await reoptimizeRoute(
        location,
        remainingStops,
        completedStops,
        startLocation,
        options
      );

      onRouteUpdate(newRoute);
    } catch (error) {
      console.error('Auto-reoptimization error:', error);
    } finally {
      setIsReoptimizing(false);
    }
  };

  const handleMarkComplete = (stopId) => {
    setCompletedStops([...completedStops, stopId]);
  };

  if (!optimizedRoute) {
    return null;
  }

  return (
    <div className="AutoReoptimize">
      <h3>🚗 Real-Time Tracking</h3>
      <div className="AutoReoptimize-controls">
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`AutoReoptimize-button ${isTracking ? 'active' : ''}`}
        >
          {isTracking ? '⏸️ Stop Tracking' : '▶️ Start Tracking'}
        </button>
        {isTracking && currentLocation && (
          <div className="AutoReoptimize-status">
            <small>📍 Tracking active</small>
            {isReoptimizing && <small>🔄 Re-optimizing route...</small>}
          </div>
        )}
      </div>
      {isTracking && (
        <div className="AutoReoptimize-info">
          <p>System will automatically re-optimize if you go off route</p>
          <p>Completed stops: {completedStops.length} / {optimizedRoute.route.length}</p>
        </div>
      )}
    </div>
  );
}

export default AutoReoptimize;

