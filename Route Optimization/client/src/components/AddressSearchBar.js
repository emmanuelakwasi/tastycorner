import React, { useState, useEffect, useRef } from 'react';
import { geocodeAddress, getAutocompleteSuggestions, getPlaceDetails } from '../services/api';
import './AddressSearchBar.css';

function AddressSearchBar({ onAddStop, isOptimizing, startLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState(null);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  // Fetch autocomplete suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const locationParam = startLocation 
          ? `${startLocation.lat},${startLocation.lng}` 
          : null;
        
        const data = await getAutocompleteSuggestions(searchQuery, locationParam);
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, startLocation]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setIsGeocoding(true);
    setError(null);

    try {
      // Get place details using place ID
      const result = await getPlaceDetails(suggestion.placeId);
      
      const stop = {
        name: result.formattedAddress || suggestion.description,
        address: result.formattedAddress || suggestion.description,
        lat: result.lat,
        lng: result.lng,
        priority: 3,
        urgent: false
      };

      onAddStop(stop);
      
      // Add to recent addresses
      setRecentAddresses(prev => {
        const updated = [suggestion.description, ...prev.filter(addr => addr !== suggestion.description)].slice(0, 5);
        return updated;
      });
      
      setSearchQuery('');
    } catch (error) {
      // Fallback to regular geocoding
      try {
        const result = await geocodeAddress(suggestion.description);
        const stop = {
          name: result.formattedAddress || suggestion.description,
          address: result.formattedAddress || suggestion.description,
          lat: result.lat,
          lng: result.lng,
          priority: 3,
          urgent: false
        };
        onAddStop(stop);
        setSearchQuery('');
      } catch (fallbackError) {
        setError(fallbackError.response?.data?.error || fallbackError.message || 'Failed to find address');
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter an address');
      return;
    }

    // If there's a selected suggestion, use it
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      await handleSuggestionSelect(suggestions[selectedIndex]);
      return;
    }

    setIsGeocoding(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const result = await geocodeAddress(searchQuery);
      
      const stop = {
        name: result.formattedAddress || searchQuery,
        address: result.formattedAddress || searchQuery,
        lat: result.lat,
        lng: result.lng,
        priority: 3,
        urgent: false
      };

      onAddStop(stop);
      
      // Add to recent addresses (keep last 5)
      setRecentAddresses(prev => {
        const updated = [searchQuery, ...prev.filter(addr => addr !== searchQuery)].slice(0, 5);
        return updated;
      });
      
      setSearchQuery('');
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to find address');
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleRecentClick = (address) => {
    setSearchQuery(address);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="AddressSearchBar">
      <form onSubmit={handleSubmit} className="AddressSearchBar-form">
        <div className="AddressSearchBar-input-wrapper" ref={searchRef}>
          <input
            type="text"
            className="AddressSearchBar-input"
            placeholder="Enter address or place name (e.g., Walmart super center, ruston or 123 Main St)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            disabled={isGeocoding || isOptimizing}
            autoComplete="off"
          />
          <button
            type="submit"
            className="AddressSearchBar-button"
            disabled={isGeocoding || isOptimizing || !searchQuery.trim()}
            title="Add delivery address"
          >
            {isGeocoding ? (
              <span className="AddressSearchBar-spinner">⏳</span>
            ) : (
              <span>➕ Add</span>
            )}
          </button>
          
          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="AddressSearchBar-suggestions" ref={suggestionsRef}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.placeId || index}
                  className={`AddressSearchBar-suggestion-item ${
                    index === selectedIndex ? 'selected' : ''
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="AddressSearchBar-suggestion-main">
                    {suggestion.mainText}
                  </div>
                  {suggestion.secondaryText && (
                    <div className="AddressSearchBar-suggestion-secondary">
                      {suggestion.secondaryText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {error && (
          <div className="AddressSearchBar-error">
            ⚠️ {error}
          </div>
        )}
        {recentAddresses.length > 0 && !showSuggestions && (
          <div className="AddressSearchBar-recent">
            <small>Recent:</small>
            <div className="AddressSearchBar-recent-list">
              {recentAddresses.map((address, index) => (
                <button
                  key={index}
                  type="button"
                  className="AddressSearchBar-recent-item"
                  onClick={() => handleRecentClick(address)}
                  title="Click to use this address"
                >
                  {address}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddressSearchBar;

