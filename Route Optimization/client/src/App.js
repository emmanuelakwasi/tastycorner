import React, { useState, useEffect } from 'react';
import './App.css';
import RouteMap from './components/RouteMap';
import StopList from './components/StopList';
import RouteControls from './components/RouteControls';
import RouteStats from './components/RouteStats';
import RouteExport from './components/RouteExport';
import NavigationInstructions from './components/NavigationInstructions';
import WeatherAlerts from './components/WeatherAlerts';
import AutoReoptimize from './components/AutoReoptimize';
import AddressSearchBar from './components/AddressSearchBar';
import MobileSidebarToggle from './components/MobileSidebarToggle';
import NextStopBanner from './components/NextStopBanner';
import DriverChatBot from './components/DriverChatBot';
import LiveDirections from './components/LiveDirections';
import RealTimeTracker from './components/RealTimeTracker';
import WeatherEffects from './components/WeatherEffects';
import EnhancedLocation from './components/EnhancedLocation';
import ThemeToggle from './components/ThemeToggle';
import TrafficConditions from './components/TrafficConditions';
import { optimizeRoute, getRouteWeather } from './services/api';

function App() {
  const [stops, setStops] = useState([]);
  const [startLocation, setStartLocation] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [options, setOptions] = useState({
    enableClustering: false,
    clusterDistance: 2
  });
  const [weather, setWeather] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [completedStops, setCompletedStops] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleOptimize = async () => {
    if (!startLocation || stops.length === 0) {
      alert('Please set a start location and add at least one stop');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeRoute(stops, startLocation, { ...options, includeInstructions: true });
      setOptimizedRoute(result);
      
      // Load weather conditions for the route
      if (result.route) {
        try {
          const weatherData = await getRouteWeather(result.route);
          setWeather(weatherData);
        } catch (error) {
          console.error('Weather load error:', error);
        }
      }
    } catch (error) {
      console.error('Optimization error:', error);
      alert('Failed to optimize route. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRouteUpdate = (newRoute) => {
    setOptimizedRoute(newRoute);
    // Update weather for new route
    if (newRoute.route) {
      getRouteWeather(newRoute.route).then(setWeather).catch(console.error);
    }
  };

  const handleAddStop = (stop) => {
    // Check if stop already exists (prevent duplicates)
    const existingStop = stops.find(s => 
      Math.abs(s.lat - stop.lat) < 0.0001 && 
      Math.abs(s.lng - stop.lng) < 0.0001
    );
    
    if (existingStop) {
      console.log('Stop already exists at this location');
      return;
    }
    
    setStops([...stops, {
      ...stop,
      id: stop.id || Date.now(), // Use provided ID or generate new one
      priority: stop.priority || 3,
      urgent: stop.urgent || false
    }]);
  };

  const handleRemoveStop = (id) => {
    setStops(stops.filter(s => s.id !== id));
    if (optimizedRoute) {
      setOptimizedRoute(null);
    }
  };

  const handleUpdateStop = async (id, updates) => {
    const updatedStops = stops.map(s => s.id === id ? { ...s, ...updates } : s);
    setStops(updatedStops);
    
    // Auto-optimize if route was already optimized
    if (optimizedRoute && startLocation) {
      setIsOptimizing(true);
      try {
        const result = await optimizeRoute(updatedStops, startLocation, options);
        setOptimizedRoute(result);
      } catch (error) {
        console.error('Auto-optimization error:', error);
        setOptimizedRoute(null);
      } finally {
        setIsOptimizing(false);
      }
    } else {
      setOptimizedRoute(null);
    }
  };

  const handleSetStartLocation = async (location) => {
    setStartLocation(location);
    
    // Auto-optimize if route was already optimized
    if (optimizedRoute && stops.length > 0) {
      setIsOptimizing(true);
      try {
        const result = await optimizeRoute(stops, location, options);
        setOptimizedRoute(result);
      } catch (error) {
        console.error('Auto-optimization error:', error);
        setOptimizedRoute(null);
      } finally {
        setIsOptimizing(false);
      }
    } else {
      setOptimizedRoute(null);
    }
  };

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
  };

  const handleCompleteStop = (stopId) => {
    setCompletedStops([...completedStops, stopId]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚚 Route Optimizer</h1>
      </header>
      
      <AddressSearchBar 
        onAddStop={handleAddStop}
        isOptimizing={isOptimizing}
        startLocation={startLocation}
      />
      
      {/* Weather Visual Effects */}
      <WeatherEffects weatherData={weather} />
      
      {/* Next Stop Banner - Shows first destination prominently */}
      <NextStopBanner 
        optimizedRoute={optimizedRoute}
        startLocation={startLocation}
      />
      
      {/* Real-Time Tracker - Automatically starts when route is optimized */}
      {optimizedRoute && (
        <RealTimeTracker
          optimizedRoute={optimizedRoute}
          onLocationUpdate={(location) => {
            handleLocationUpdate(location);
            setCurrentLocation(location);
          }}
        />
      )}
      
      {/* Enhanced Location Precision */}
      {currentLocation && (
        <EnhancedLocation
          currentLocation={currentLocation}
          onLocationRefined={handleLocationUpdate}
        />
      )}
      
      {/* Live Directions - Large, visible turn-by-turn */}
      {optimizedRoute && currentLocation && (
        <LiveDirections
          optimizedRoute={optimizedRoute}
          currentLocation={currentLocation}
          onCompleteStop={handleCompleteStop}
        />
      )}
      
      <div className="App-container">
        <div className={`App-sidebar ${sidebarOpen ? 'expanded' : ''}`}>
          <RouteControls
            onAddStop={handleAddStop}
            onSetStartLocation={handleSetStartLocation}
            startLocation={startLocation}
            onOptimize={handleOptimize}
            isOptimizing={isOptimizing}
            options={options}
            onOptionsChange={setOptions}
          />
          
          {optimizedRoute && (
            <>
              <RouteStats statistics={optimizedRoute.statistics} />
              <WeatherAlerts route={optimizedRoute.route} />
              <AutoReoptimize
                optimizedRoute={optimizedRoute}
                startLocation={startLocation}
                onRouteUpdate={handleRouteUpdate}
                options={options}
              />
              <RouteExport 
                optimizedRoute={optimizedRoute} 
                startLocation={startLocation}
              />
              <NavigationInstructions
                instructions={optimizedRoute.instructions}
                simpleInstructions={optimizedRoute.simpleInstructions}
                summary={optimizedRoute.summary}
              />
            </>
          )}
          
          <StopList
            stops={stops}
            onRemoveStop={handleRemoveStop}
            onUpdateStop={handleUpdateStop}
            currentLocation={currentLocation}
          />
        </div>
        
        <div className="App-map">
          <RouteMap
            stops={stops}
            startLocation={startLocation}
            optimizedRoute={optimizedRoute}
            currentLocation={currentLocation}
            isDarkMode={isDarkMode}
            onSetStartLocation={handleSetStartLocation}
            onAddStop={handleAddStop}
            onUpdateStop={handleUpdateStop}
          />
        </div>
        
        <MobileSidebarToggle 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
      </div>
      
      {/* Theme Toggle */}
      <ThemeToggle 
        isDark={isDarkMode} 
        onToggle={() => setIsDarkMode(!isDarkMode)} 
      />
      
      {/* Traffic & Conditions Monitor */}
      {optimizedRoute && startLocation && (
        <TrafficConditions
          optimizedRoute={optimizedRoute}
          startLocation={startLocation}
          onConditionsUpdate={(conditions) => {
            // Handle conditions update (e.g., trigger re-optimization if needed)
            if (conditions?.safety?.overall === 'poor') {
              console.log('Poor conditions detected, consider re-optimizing');
            }
          }}
        />
      )}
      
      {/* Driver ChatBot - Voice-enabled route assistant */}
      <DriverChatBot 
        optimizedRoute={optimizedRoute}
        startLocation={startLocation}
      />
    </div>
  );
}

export default App;

