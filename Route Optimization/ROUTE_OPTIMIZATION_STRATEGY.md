# Route Optimization Strategy

## Overview

The route optimization algorithm uses a **hybrid approach** that prioritizes the closest destination first, then optimizes the overall route for the remaining stops.

## Strategy

### Phase 1: First Stop Selection
**Goal:** Direct to the closest destination first

**How it works:**
- The algorithm identifies the closest destination from the start location
- Uses **pure distance-based selection** (vehicle distance)
- Only overrides if a stop is marked as urgent or has priority 1, and even then, distance is still heavily weighted (85%)

**Why:**
- Ensures efficient start to the route
- Minimizes initial travel time
- Gets the driver moving quickly

**Example:**
```
Start Location: (40.7128, -74.0060)
Stop A: 2.5 km away
Stop B: 5.0 km away
Stop C: 1.8 km away (urgent)

Result: Goes to Stop C first (closest, even though urgent)
```

### Phase 2: Subsequent Stop Optimization
**Goal:** Optimize overall route efficiency

**How it works:**
- After the first stop, uses **balanced optimization**
- Considers multiple factors:
  - **Distance** (50% weight): Vehicle distance to next stop
  - **Priority** (affects score): Higher priority = lower score
  - **Time Windows**: Penalties for being too early or late
  - **Urgency**: Urgent stops get 50% score reduction

**Why:**
- Balances efficiency with business priorities
- Ensures time-sensitive deliveries are handled appropriately
- Maintains overall route optimization

**Example:**
```
After visiting Stop C:
- Stop A: 3.2 km, Priority 2, No time window
- Stop B: 4.1 km, Priority 1, Time window ending soon

Result: May choose Stop B (higher priority, time-sensitive) even if slightly farther
```

## Algorithm Details

### Distance Calculation
- Uses **vehicle distance** (accounts for roads, not straight-line)
- Distance matrix applies 1.3x multiplier to approximate real road distances
- More accurate than straight-line distance for routing

### Scoring Formula

**First Stop:**
```javascript
if (isFirstStop) {
  if (urgent || priority === 1) {
    score = vehicleDistance * 0.85;
    if (urgent) score *= 0.9;
    if (priority === 1) score *= 0.95;
  } else {
    score = vehicleDistance; // Pure distance
  }
}
```

**Subsequent Stops:**
```javascript
score = vehicleDistance;
score *= (4 - priority) / 3;  // Priority adjustment
if (urgent) score *= 0.5;      // Urgency bonus
// Add time window penalties
```

## Benefits

1. **Efficient Start**: Always begins with closest destination
2. **Overall Optimization**: Remaining route is optimized considering all factors
3. **Flexibility**: Can still prioritize urgent/high-priority stops when needed
4. **Real-world Accuracy**: Uses vehicle distance (accounts for roads)

## Use Cases

### Scenario 1: All Stops Equal Priority
- First stop: Closest destination
- Remaining stops: Nearest neighbor (greedy algorithm)
- Result: Efficient route overall

### Scenario 2: Mixed Priorities
- First stop: Closest destination (unless urgent/priority 1)
- Remaining stops: Balanced by priority and distance
- Result: Efficient start + priority-aware routing

### Scenario 3: Time-Sensitive Deliveries
- First stop: Closest destination
- Remaining stops: Time windows heavily influence selection
- Result: Efficient start + on-time deliveries

---

**This strategy ensures drivers start efficiently while maintaining overall route optimization!** 🚚

