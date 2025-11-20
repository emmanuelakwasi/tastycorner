import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { decodePolyline } from '../utils/polylineDecoder';
import './RouteMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapController({ bounds, onMapReady }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [bounds, map]);
  
  return null;
}

// Custom draggable marker component
function DraggableMarker({ stop, order, onDragEnd, optimizedRoute, isStart = false }) {
  const [position, setPosition] = useState([stop.lat, stop.lng]);
  const routePoint = isStart ? null : optimizedRoute?.route?.find(r => r.id === stop.id);

  const markerRef = useRef(null);

  const eventHandlers = useCallback({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPosition = marker.getLatLng();
        setPosition([newPosition.lat, newPosition.lng]);
        if (isStart) {
          onDragEnd(newPosition.lat, newPosition.lng);
        } else {
          onDragEnd(stop.id, newPosition.lat, newPosition.lng);
        }
      }
    },
  }, [isStart, stop?.id, onDragEnd]);

  useEffect(() => {
    setPosition([stop.lat, stop.lng]);
  }, [stop.lat, stop.lng]);

  const icon = isStart
    ? L.divIcon({
        className: 'custom-marker start-marker',
        html: `<div class="marker-pin start-pin"><span>🚚</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })
    : stop.urgent
    ? L.divIcon({
        className: 'custom-marker urgent-marker',
        html: `<div class="marker-pin urgent-pin"><span>${order}</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })
    : L.divIcon({
        className: 'custom-marker stop-marker',
        html: `<div class="marker-pin stop-pin"><span>${order}</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={icon}
      ref={markerRef}
    >
      <Popup>
        <div className="marker-popup">
          <strong>{isStart ? '🚚 Start' : `📍 Stop #${order}`}</strong>
          <p>{stop.name}</p>
          {stop.address && <small>{stop.address}</small>}
          {routePoint?.distanceFromPrevious && !isStart && (
            <div className="distance-info">
              <div>Total: {routePoint.distanceFromPrevious.toFixed(2)} km</div>
              {routePoint.vehicleDistance && (
                <div>🚚 Drive: {routePoint.vehicleDistance.toFixed(2)} km</div>
              )}
              {routePoint.walkingDistance && (
                <div>🚶 Walk: {routePoint.walkingDistance.toFixed(2)} km</div>
              )}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

// Click handler component
function MapClickHandler({ onMapClick, onRouteLineClick }) {
  useMapEvents({
    click: (e) => {
      // Check if click is on route line (simplified - in real app would need more precise detection)
      onMapClick(e);
    },
  });
  return null;
}

function RouteMap({ stops, startLocation, optimizedRoute, currentLocation, isDarkMode, onSetStartLocation, onAddStop, onUpdateStop }) {
  const [isDragging, setIsDragging] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (!startLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSetStartLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [startLocation, onSetStartLocation]);

  // Calculate bounds for all markers
  const getBounds = () => {
    const locations = [];
    if (startLocation) locations.push([startLocation.lat, startLocation.lng]);
    stops.forEach(stop => locations.push([stop.lat, stop.lng]));
    return locations;
  };

  const bounds = getBounds();
  const defaultCenter = startLocation 
    ? [startLocation.lat, startLocation.lng] 
    : [40.7128, -74.0060]; // Default to NYC

  // Get vehicle route polylines (truck to parking locations)
  // Uses Google Maps street routes if available, otherwise connects points
  const getVehicleRoutePolylines = () => {
    if (!optimizedRoute || !optimizedRoute.route) return [];
    
    const routes = [];
    
    // Filter out start location from route (it's order 0)
    const deliveryStops = optimizedRoute.route.filter(point => point.order > 0);
    
    // Build route segments: start -> parking1, parking1 -> parking2, etc.
    let previousLocation = startLocation;
    
    deliveryStops.forEach((point) => {
      const parkingLocation = point.parkingLocation;
      
      if (!parkingLocation) return;
      
      // PRIORITY: Use Google Maps polyline if available (actual street route)
      if (point.vehiclePolyline) {
        try {
          const decoded = decodePolyline(point.vehiclePolyline);
          if (decoded && decoded.length > 0) {
            routes.push(decoded);
            previousLocation = parkingLocation;
            return;
          }
        } catch (error) {
          console.warn('Error decoding polyline:', error);
        }
      }
      
      // Fallback: connect previous location to parking with straight line
      if (previousLocation) {
        routes.push([
          [previousLocation.lat, previousLocation.lng],
          [parkingLocation.lat, parkingLocation.lng]
        ]);
      }
      previousLocation = parkingLocation;
    });
    
    return routes;
  };

  // Get walking route polylines (parking to delivery)
  // Uses Google Maps walking paths if available, otherwise connects points
  const getWalkingRoutePolylines = () => {
    if (!optimizedRoute || !optimizedRoute.route) return [];
    
    return optimizedRoute.route
      .filter(point => point.parkingLocation)
      .map(point => {
        // If we have a Google Maps polyline for walking, use it (actual walking path)
        if (point.walkingPolyline) {
          const decoded = decodePolyline(point.walkingPolyline);
          if (decoded.length > 0) {
            return decoded;
          }
        }
        
        // Fallback: connect parking to delivery with straight line
        return [
          [point.parkingLocation.lat, point.parkingLocation.lng],
          [point.lat, point.lng]
        ];
      });
  };

  const handleMapClick = (e) => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    
    const { lat, lng } = e.latlng;
    const name = `Stop ${stops.length + 1}`;
    
    onAddStop({
      lat,
      lng,
      name,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    });
  };

  const handleMarkerDragEnd = useCallback((stopId, newLat, newLng) => {
    setIsDragging(true);
    onUpdateStop(stopId, { lat: newLat, lng: newLng });
    setTimeout(() => setIsDragging(false), 100);
  }, [onUpdateStop]);

  const handleStartDragEnd = useCallback((lat, lng) => {
    onSetStartLocation({
      ...startLocation,
      lat,
      lng
    });
  }, [startLocation, onSetStartLocation]);

  return (
    <div className="RouteMap">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />
        
        <MapController 
          bounds={bounds} 
          onMapReady={setMapInstance}
        />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Start location marker - draggable */}
        {startLocation && (
          <DraggableMarker
            stop={startLocation}
            order={0}
            onDragEnd={handleStartDragEnd}
            optimizedRoute={null}
            isStart={true}
          />
        )}
        
        {/* Stop markers - draggable */}
        {stops.map((stop, index) => {
          const routePoint = optimizedRoute?.route?.find(r => r.id === stop.id);
          const order = routePoint?.order || index + 1;
          
          return (
            <DraggableMarker
              key={stop.id}
              stop={stop}
              order={order}
              onDragEnd={handleMarkerDragEnd}
              optimizedRoute={optimizedRoute}
              isStart={false}
            />
          );
        })}
        
        {/* Vehicle route polylines (truck to parking) - uses actual street routes */}
        {optimizedRoute && optimizedRoute.route && getVehicleRoutePolylines().map((vehicleRoute, index) => (
          <Polyline
            key={`vehicle-${index}`}
            positions={vehicleRoute}
            color="#000000"
            weight={5}
            opacity={0.7}
            className="route-line vehicle-route"
          />
        ))}
        
        {/* Walking route polylines (parking to delivery) - uses actual walking paths */}
        {optimizedRoute && optimizedRoute.route && getWalkingRoutePolylines().map((walkingRoute, index) => (
          <Polyline
            key={`walking-${index}`}
            positions={walkingRoute}
            color="#00ff00"
            weight={3}
            opacity={0.6}
            dashArray="10, 5"
            className="route-line walking-route"
          />
        ))}
        
        {/* Parking location markers */}
        {optimizedRoute && optimizedRoute.route && optimizedRoute.route.map((stop) => {
          if (!stop.parkingLocation) return null;
          return (
            <Marker
              key={`parking-${stop.id}`}
              position={[stop.parkingLocation.lat, stop.parkingLocation.lng]}
              icon={L.divIcon({
                className: 'custom-marker parking-marker',
                html: `<div class="marker-pin parking-pin"><span>P</span></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
              })}
            >
              <Popup>
                <div className="marker-popup">
                  <strong>🅿️ Parking</strong>
                  <p>For Stop #{stop.order}</p>
                  <small>Walking: {stop.walkingDistance?.toFixed(2)} km</small>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Current location marker (driver's live location) */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={L.divIcon({
              className: 'custom-marker current-location-marker',
              html: `<div class="marker-pin current-location-pin">
                <div class="pulse-ring"></div>
                <span>📍</span>
              </div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
            })}
          >
            <Popup>
              <div className="marker-popup">
                <strong>📍 Your Location</strong>
                <p>Live tracking active</p>
                {currentLocation.accuracy && (
                  <small>Accuracy: ±{currentLocation.accuracy.toFixed(0)}m</small>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="RouteMap-floating-controls">
        <button 
          className="floating-button add-stop-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (mapInstance && mapInstance.getCenter) {
              const center = mapInstance.getCenter();
              handleMapClick({ latlng: center });
            }
          }}
          title="Add stop at map center"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default RouteMap;

