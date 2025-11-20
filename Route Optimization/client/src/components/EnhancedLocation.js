import React, { useState, useEffect } from 'react';
import { reverseGeocode } from '../services/api';
import './EnhancedLocation.css';

function EnhancedLocation({ currentLocation, onLocationRefined }) {
  const [refinedAddress, setRefinedAddress] = useState(null);
  const [isRefining, setIsRefining] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);

  useEffect(() => {
    if (!currentLocation) return;

    const refineLocation = async () => {
      setIsRefining(true);
      try {
        // Reverse geocode to get full address
        const addressData = await reverseGeocode(currentLocation.lat, currentLocation.lng);
        
        if (addressData) {
          setRefinedAddress(addressData.formattedAddress);
          
          // Extract apartment/room number if available
          const addressComponents = addressData.addressComponents || [];
          const apartment = addressComponents.find(comp => 
            comp.types.includes('subpremise') || 
            comp.types.includes('premise')
          );
          
          const room = addressComponents.find(comp => 
            comp.types.includes('room') || 
            comp.longName.toLowerCase().includes('apt') ||
            comp.longName.toLowerCase().includes('room')
          );

          setLocationDetails({
            fullAddress: addressData.formattedAddress,
            apartment: apartment?.longName || null,
            room: room?.longName || null,
            components: addressComponents
          });

          if (onLocationRefined) {
            onLocationRefined({
              ...currentLocation,
              refinedAddress: addressData.formattedAddress,
              apartment: apartment?.longName,
              room: room?.longName
            });
          }
        }
      } catch (error) {
        console.error('Location refinement error:', error);
      } finally {
        setIsRefining(false);
      }
    };

    refineLocation();
  }, [currentLocation, onLocationRefined]);

  if (!currentLocation) {
    return null;
  }

  return (
    <div className="EnhancedLocation">
      <div className="EnhancedLocation-header">
        <span className="EnhancedLocation-icon">📍</span>
        <span className="EnhancedLocation-title">Precise Location</span>
        {isRefining && <span className="EnhancedLocation-spinner">⏳</span>}
      </div>
      
      {refinedAddress && (
        <div className="EnhancedLocation-details">
          <div className="EnhancedLocation-address">{refinedAddress}</div>
          {locationDetails && (locationDetails.apartment || locationDetails.room) && (
            <div className="EnhancedLocation-extra">
              {locationDetails.apartment && (
                <span className="EnhancedLocation-badge">🏠 {locationDetails.apartment}</span>
              )}
              {locationDetails.room && (
                <span className="EnhancedLocation-badge">🚪 {locationDetails.room}</span>
              )}
            </div>
          )}
          <div className="EnhancedLocation-coords">
            {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedLocation;

