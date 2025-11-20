import React, { useState } from 'react';
import { geocodeAddress } from '../services/api';
import './RouteControls.css';

function RouteControls({ 
  onAddStop, 
  onSetStartLocation, 
  startLocation,
  onOptimize,
  isOptimizing,
  options,
  onOptionsChange
}) {
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopForm, setStopForm] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    priority: 3,
    urgent: false,
    timeWindow: { start: '', end: '' }
  });

  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocodeAddress = async () => {
    if (!stopForm.address || stopForm.address.trim() === '') {
      alert('Please enter an address');
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(stopForm.address);
      setStopForm({
        ...stopForm,
        lat: result.lat.toString(),
        lng: result.lng.toString(),
        address: result.formattedAddress || stopForm.address
      });
    } catch (error) {
      alert(`Failed to find address: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    
    // If address is provided but no coordinates, geocode first
    if (stopForm.address && (!stopForm.lat || !stopForm.lng)) {
      await handleGeocodeAddress();
      // Wait a moment for state to update
      setTimeout(() => {
        if (stopForm.lat && stopForm.lng) {
          submitStop();
        }
      }, 100);
      return;
    }
    
    if (!stopForm.lat || !stopForm.lng) {
      alert('Please enter an address (to geocode) or coordinates');
      return;
    }

    submitStop();
  };

  const submitStop = () => {
    const stop = {
      name: stopForm.name || `Stop ${Date.now()}`,
      address: stopForm.address,
      lat: parseFloat(stopForm.lat),
      lng: parseFloat(stopForm.lng),
      priority: parseInt(stopForm.priority),
      urgent: stopForm.urgent,
      timeWindow: stopForm.timeWindow.start && stopForm.timeWindow.end ? {
        start: new Date(stopForm.timeWindow.start).getTime(),
        end: new Date(stopForm.timeWindow.end).getTime()
      } : null
    };

    onAddStop(stop);
    setStopForm({
      name: '',
      address: '',
      lat: '',
      lng: '',
      priority: 3,
      urgent: false,
      timeWindow: { start: '', end: '' }
    });
    setShowAddStop(false);
  };

  const handleSetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSetStartLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          alert('Failed to get current location');
          console.error(error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="RouteControls">
      <div className="RouteControls-section">
        <h2>Start Location</h2>
        {startLocation ? (
          <div className="RouteControls-location">
            <p><strong>{startLocation.name}</strong></p>
            <p className="RouteControls-coords">
              {startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)}
            </p>
            <button 
              onClick={handleSetCurrentLocation}
              className="RouteControls-button secondary"
            >
              Update Location
            </button>
          </div>
        ) : (
          <button 
            onClick={handleSetCurrentLocation}
            className="RouteControls-button primary"
          >
            📍 Use Current Location
          </button>
        )}
      </div>

        <div className="RouteControls-section">
          <h2>Stops</h2>
          <p className="RouteControls-hint-text">
            💡 Use the search bar at the top to quickly add delivery addresses
          </p>
          {!showAddStop ? (
          <button
            onClick={() => setShowAddStop(true)}
            className="RouteControls-button primary"
          >
            + Add Stop (Manual)
          </button>
        ) : (
          <form onSubmit={handleAddStopSubmit} className="RouteControls-form">
            <input
              type="text"
              placeholder="Stop name (optional)"
              value={stopForm.name}
              onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
            />
            <div className="RouteControls-address-input">
              <input
                type="text"
                placeholder="Enter delivery address (e.g., 123 Main St, City, State)"
                value={stopForm.address}
                onChange={(e) => setStopForm({ ...stopForm, address: e.target.value })}
              />
              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={isGeocoding || !stopForm.address}
                className="RouteControls-button geocode-btn"
                title="Find coordinates from address"
              >
                {isGeocoding ? 'Finding...' : '📍 Find'}
              </button>
            </div>
            <div className="RouteControls-coords-input">
              <input
                type="number"
                step="any"
                placeholder="Latitude (auto-filled from address)"
                value={stopForm.lat}
                onChange={(e) => setStopForm({ ...stopForm, lat: e.target.value })}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude (auto-filled from address)"
                value={stopForm.lng}
                onChange={(e) => setStopForm({ ...stopForm, lng: e.target.value })}
              />
            </div>
            <small className="RouteControls-hint">
              💡 Enter an address and click "Find" to automatically get coordinates
            </small>
            <select
              value={stopForm.priority}
              onChange={(e) => setStopForm({ ...stopForm, priority: e.target.value })}
            >
              <option value={1}>High Priority</option>
              <option value={2}>Medium Priority</option>
              <option value={3}>Low Priority</option>
            </select>
            <label className="RouteControls-checkbox">
              <input
                type="checkbox"
                checked={stopForm.urgent}
                onChange={(e) => setStopForm({ ...stopForm, urgent: e.target.checked })}
              />
              Urgent Delivery
            </label>
            <div className="RouteControls-timewindow">
              <label>Time Window (optional)</label>
              <input
                type="datetime-local"
                value={stopForm.timeWindow.start}
                onChange={(e) => setStopForm({ 
                  ...stopForm, 
                  timeWindow: { ...stopForm.timeWindow, start: e.target.value }
                })}
              />
              <input
                type="datetime-local"
                value={stopForm.timeWindow.end}
                onChange={(e) => setStopForm({ 
                  ...stopForm, 
                  timeWindow: { ...stopForm.timeWindow, end: e.target.value }
                })}
              />
            </div>
            <div className="RouteControls-form-actions">
              <button type="submit" className="RouteControls-button primary">
                Add Stop
              </button>
              <button 
                type="button"
                onClick={() => setShowAddStop(false)}
                className="RouteControls-button secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="RouteControls-section">
        <h2>Optimization Options</h2>
        <label className="RouteControls-checkbox">
          <input
            type="checkbox"
            checked={options.enableClustering}
            onChange={(e) => onOptionsChange({ 
              ...options, 
              enableClustering: e.target.checked 
            })}
          />
          Enable Customer Clustering
        </label>
        {options.enableClustering && (
          <div className="RouteControls-cluster-distance">
            <label>Cluster Distance (km)</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="10"
              value={options.clusterDistance}
              onChange={(e) => onOptionsChange({ 
                ...options, 
                clusterDistance: parseFloat(e.target.value) 
              })}
            />
          </div>
        )}
      </div>

      <div className="RouteControls-section">
        <button 
          onClick={onOptimize}
          disabled={isOptimizing}
          className="RouteControls-button optimize"
        >
          {isOptimizing ? 'Optimizing...' : '🚀 Optimize Route'}
        </button>
      </div>
    </div>
  );
}

export default RouteControls;

