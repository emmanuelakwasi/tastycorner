/**
 * Navigation Service
 * Provides turn-by-turn navigation instructions
 */

/**
 * Generate turn-by-turn navigation instructions
 */
function generateNavigationInstructions(route, startLocation) {
  const instructions = [];
  
  // Start instruction
  instructions.push({
    type: 'start',
    instruction: `Start at ${startLocation.name || 'your location'}`,
    distance: 0,
    duration: 0,
    location: startLocation
  });

  // Instructions for each stop
  route.forEach((stop, index) => {
    const isLast = index === route.length - 1;
    
    // Vehicle route instruction
    if (stop.vehicleDistance) {
      instructions.push({
        type: 'drive',
        instruction: `Drive ${stop.vehicleDistance.toFixed(2)} km to parking near ${stop.name}`,
        distance: stop.vehicleDistance,
        duration: stop.estimatedVehicleTime || 0,
        location: stop.parkingLocation || { lat: stop.lat, lng: stop.lng },
        stopNumber: stop.order,
        stopName: stop.name
      });
    }

    // Parking instruction
    if (stop.parkingLocation) {
      instructions.push({
        type: 'park',
        instruction: `Park at ${stop.parkingLocation.name || 'parking location'}`,
        distance: 0,
        duration: 0,
        location: stop.parkingLocation,
        stopNumber: stop.order,
        stopName: stop.name
      });
    }

    // Walking instruction
    if (stop.walkingDistance) {
      instructions.push({
        type: 'walk',
        instruction: `Walk ${stop.walkingDistance.toFixed(2)} km (${(stop.walkingDistance * 1000).toFixed(0)} m) to ${stop.name}`,
        distance: stop.walkingDistance,
        duration: stop.estimatedWalkingTime || 0,
        location: { lat: stop.lat, lng: stop.lng },
        stopNumber: stop.order,
        stopName: stop.name
      });
    }

    // Delivery instruction
    instructions.push({
      type: 'deliver',
      instruction: `Deliver to ${stop.name}${stop.address ? ` at ${stop.address}` : ''}`,
      distance: 0,
      duration: 0,
      location: { lat: stop.lat, lng: stop.lng },
      stopNumber: stop.order,
      stopName: stop.name,
      priority: stop.priority,
      urgent: stop.urgent
    });

    // Continue instruction (if not last)
    if (!isLast) {
      instructions.push({
        type: 'continue',
        instruction: 'Return to vehicle and continue to next stop',
        distance: 0,
        duration: 0,
        location: stop.parkingLocation || { lat: stop.lat, lng: stop.lng }
      });
    }
  });

  // End instruction
  instructions.push({
    type: 'end',
    instruction: 'Route complete! All deliveries finished.',
    distance: 0,
    duration: 0,
    location: route[route.length - 1]?.parkingLocation || route[route.length - 1]
  });

  return instructions;
}

/**
 * Generate simplified instructions for driver display
 */
function generateSimpleInstructions(route, startLocation) {
  const instructions = [];
  
  route.forEach((stop, index) => {
    instructions.push({
      step: index + 1,
      stop: stop.order,
      name: stop.name,
      drive: stop.vehicleDistance ? `${stop.vehicleDistance.toFixed(2)} km` : null,
      driveTime: stop.estimatedVehicleTime ? `${Math.round(stop.estimatedVehicleTime)} min` : null,
      walk: stop.walkingDistance ? `${(stop.walkingDistance * 1000).toFixed(0)} m` : null,
      walkTime: stop.estimatedWalkingTime ? `${Math.round(stop.estimatedWalkingTime)} min` : null,
      parking: stop.parkingLocation?.name || 'Park nearby',
      address: stop.address || `${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}`,
      priority: stop.priority,
      urgent: stop.urgent
    });
  });

  return instructions;
}

/**
 * Generate text summary of route
 */
function generateRouteSummary(route, statistics) {
  const summary = [];
  
  summary.push(`Route Summary:`);
  summary.push(`Total Stops: ${statistics.totalStops}`);
  summary.push(`Total Distance: ${statistics.totalDistance.toFixed(2)} km`);
  summary.push(`Vehicle Distance: ${statistics.totalVehicleDistance?.toFixed(2) || 'N/A'} km`);
  summary.push(`Walking Distance: ${statistics.totalWalkingDistance?.toFixed(2) || 'N/A'} km`);
  summary.push(`Estimated Time: ${Math.round(statistics.estimatedTime)} minutes`);
  summary.push(`Vehicle Time: ${Math.round(statistics.estimatedVehicleTime || 0)} minutes`);
  summary.push(`Walking Time: ${Math.round(statistics.estimatedWalkingTime || 0)} minutes`);
  summary.push('');
  summary.push('Stops:');
  
  route.forEach((stop, index) => {
    summary.push(`${index + 1}. ${stop.name}`);
    if (stop.vehicleDistance) {
      summary.push(`   Drive: ${stop.vehicleDistance.toFixed(2)} km (${Math.round(stop.estimatedVehicleTime || 0)} min)`);
    }
    if (stop.walkingDistance) {
      summary.push(`   Walk: ${(stop.walkingDistance * 1000).toFixed(0)} m (${Math.round(stop.estimatedWalkingTime || 0)} min)`);
    }
    if (stop.parkingLocation) {
      summary.push(`   Park: ${stop.parkingLocation.name || 'Near delivery'}`);
    }
  });

  return summary.join('\n');
}

module.exports = {
  generateNavigationInstructions,
  generateSimpleInstructions,
  generateRouteSummary
};

