# Training Examples for Route Optimization Learner Algorithm

This document provides examples of training data used to train the Machine Learning model. Each example contains **input features** and **expected output** (optimal route order).

---

## Example Format

Each training example follows this structure:

```json
{
  "input": {
    "features": [/* numerical features */],
    "stops": [/* stop information */],
    "startLocation": {/* starting point */},
    "conditions": {/* traffic, weather, time */}
  },
  "output": {
    "optimalOrder": [/* indices in optimal order */],
    "orderVector": [/* vector representation */]
  }
}
```

---

## Example 1: Simple Distance-Based Route

**Scenario**: 3 stops, no special priorities, moderate traffic

**Input:**
```json
{
  "input": {
    "features": [
      // Stop 0 features
      2.5,    // distance from start (km)
      0.33,   // priority (1/3 = 0.33)
      0,      // not urgent
      0,      // no time window
      // Stop 1 features
      3.2,    // distance from start
      0.67,   // priority (2/3 = 0.67)
      0,      // not urgent
      0,      // no time window
      // Stop 2 features
      1.8,    // distance from start (closest!)
      0.33,   // priority
      0,      // not urgent
      0,      // no time window
      // Global conditions
      0.5,    // traffic: moderate
      0,      // weather: clear
      0.625,  // time: 3pm (15/24 = 0.625)
      0       // not rush hour
    ],
    "stops": [
      {"id": 0, "lat": 32.5, "lng": -92.7, "priority": 1},
      {"id": 1, "lat": 32.6, "lng": -92.8, "priority": 2},
      {"id": 2, "lat": 32.4, "lng": -92.6, "priority": 1}
    ],
    "startLocation": {"lat": 32.45, "lng": -92.65},
    "conditions": {
      "trafficLevel": "moderate",
      "weather": "clear",
      "timeOfDay": "afternoon",
      "timeOfDayHour": 15
    }
  },
  "output": {
    "optimalOrder": [2, 0, 1],
    "orderVector": [2, 3, 1]
  }
}
```

**Explanation**: 
- Stop 2 is closest (1.8 km), so it comes first
- Then Stop 0 (2.5 km)
- Finally Stop 1 (3.2 km, farthest)

**What the model learns**: "Prioritize closest stops first when all else is equal"

---

## Example 2: Priority-Based Route

**Scenario**: 4 stops with different priorities, one urgent

**Input:**
```json
{
  "input": {
    "features": [
      // Stop 0: High priority, urgent
      3.5,    // distance
      0.33,   // priority 1 (high)
      1,      // URGENT!
      0.8,    // time window urgency
      // Stop 1: Medium priority
      2.1,    // distance (closest)
      0.67,   // priority 2
      0,      // not urgent
      0,
      // Stop 2: Low priority
      2.8,    // distance
      1.0,    // priority 3 (low)
      0,      // not urgent
      0,
      // Stop 3: High priority
      4.2,    // distance (farthest)
      0.33,   // priority 1
      0,      // not urgent
      0.5,    // time window urgency
      // Global conditions
      0.5,    // moderate traffic
      0,      // clear weather
      0.5,    // noon (12/24 = 0.5)
      0       // not rush hour
    ],
    "stops": [
      {"id": 0, "lat": 32.5, "lng": -92.7, "priority": 1, "urgent": true},
      {"id": 1, "lat": 32.4, "lng": -92.6, "priority": 2},
      {"id": 2, "lat": 32.45, "lng": -92.65, "priority": 3},
      {"id": 3, "lat": 32.6, "lng": -92.8, "priority": 1}
    ],
    "startLocation": {"lat": 32.45, "lng": -92.65},
    "conditions": {
      "trafficLevel": "moderate",
      "weather": "clear",
      "timeOfDay": "afternoon",
      "timeOfDayHour": 12
    }
  },
  "output": {
    "optimalOrder": [0, 3, 1, 2],
    "orderVector": [1, 4, 3, 2]
  }
}
```

**Explanation**:
- Stop 0 is urgent, so it comes FIRST (even though it's not closest)
- Stop 3 has high priority, comes second
- Stop 1 is closest but lower priority, comes third
- Stop 2 has lowest priority, comes last

**What the model learns**: "Urgent stops override distance, priority matters more than distance"

---

## Example 3: Heavy Traffic Route

**Scenario**: 5 stops, heavy traffic, rush hour

**Input:**
```json
{
  "input": {
    "features": [
      // Stop 0
      4.5, 0.33, 0, 0,
      // Stop 1
      2.3, 0.67, 0, 0,
      // Stop 2
      1.9, 0.33, 0, 0,  // closest
      // Stop 3
      3.1, 1.0, 0, 0,
      // Stop 4
      2.7, 0.33, 0, 0,
      // Global conditions
      1.0,    // traffic: HIGH
      0.3,    // weather: rain
      0.375,  // time: 9am (9/24 = 0.375) - RUSH HOUR
      1       // RUSH HOUR!
    ],
    "stops": [
      {"id": 0, "lat": 32.5, "lng": -92.7, "priority": 1},
      {"id": 1, "lat": 32.4, "lng": -92.6, "priority": 2},
      {"id": 2, "lat": 32.45, "lng": -92.65, "priority": 1},
      {"id": 3, "lat": 32.5, "lng": -92.7, "priority": 3},
      {"id": 4, "lat": 32.46, "lng": -92.66, "priority": 1}
    ],
    "startLocation": {"lat": 32.45, "lng": -92.65},
    "conditions": {
      "trafficLevel": "high",
      "weather": "rain",
      "timeOfDay": "morning",
      "timeOfDayHour": 9
    }
  },
  "output": {
    "optimalOrder": [2, 4, 1, 0, 3],
    "orderVector": [3, 4, 2, 1, 5]
  }
}
```

**Explanation**:
- In heavy traffic + rush hour, prioritize CLOSEST stops
- Stop 2 is closest (1.9 km), comes first
- Then Stop 4 (2.7 km), Stop 1 (2.3 km)
- Farther stops (0, 3) come later

**What the model learns**: "In heavy traffic, distance becomes more important than priority"

---

## Example 4: Time Window Constraint

**Scenario**: 3 stops with time windows, one approaching deadline

**Input:**
```json
{
  "input": {
    "features": [
      // Stop 0: Time window starting soon
      3.2, 0.33, 0, 0.9,  // high time window urgency
      // Stop 1: No time window
      2.1, 0.67, 0, 0,    // closest, no constraint
      // Stop 2: Time window later
      2.8, 0.33, 0, 0.2,  // low urgency
      // Global conditions
      0.5, 0, 0.5, 0
    ],
    "stops": [
      {
        "id": 0,
        "lat": 32.5, "lng": -92.7,
        "priority": 1,
        "timeWindow": {
          "start": Date.now() + 1800000,  // 30 minutes from now
          "end": Date.now() + 5400000     // 1.5 hours from now
        }
      },
      {"id": 1, "lat": 32.4, "lng": -92.6, "priority": 2},
      {
        "id": 2,
        "lat": 32.45, "lng": -92.65,
        "priority": 1,
        "timeWindow": {
          "start": Date.now() + 7200000,  // 2 hours from now
          "end": Date.now() + 10800000
        }
      }
    ],
    "startLocation": {"lat": 32.45, "lng": -92.65},
    "conditions": {
      "trafficLevel": "moderate",
      "weather": "clear",
      "timeOfDay": "afternoon",
      "timeOfDayHour": 12
    }
  },
  "output": {
    "optimalOrder": [0, 1, 2],
    "orderVector": [1, 2, 3]
  }
}
```

**Explanation**:
- Stop 0 has urgent time window (starting soon), so it comes first
- Stop 1 is closest with no constraint, comes second
- Stop 2 has later time window, comes last

**What the model learns**: "Time window urgency can override distance"

---

## Example 5: Complex Scenario

**Scenario**: 6 stops, mix of priorities, urgent, time windows, heavy traffic

**Input:**
```json
{
  "input": {
    "features": [
      // Stop 0: Urgent, high priority
      3.5, 0.33, 1, 0.7,
      // Stop 1: Closest, low priority
      1.2, 1.0, 0, 0,
      // Stop 2: Medium distance, high priority
      2.8, 0.33, 0, 0.5,
      // Stop 3: Far, urgent
      5.1, 0.67, 1, 0.8,
      // Stop 4: Medium, no special features
      2.5, 0.67, 0, 0,
      // Stop 5: Close, high priority
      1.8, 0.33, 0, 0,
      // Global: Heavy traffic, rush hour
      1.0, 0.3, 0.375, 1
    ],
    "stops": [
      {"id": 0, "lat": 32.5, "lng": -92.7, "priority": 1, "urgent": true},
      {"id": 1, "lat": 32.4, "lng": -92.6, "priority": 3},
      {"id": 2, "lat": 32.45, "lng": -92.65, "priority": 1},
      {"id": 3, "lat": 32.6, "lng": -92.8, "priority": 2, "urgent": true},
      {"id": 4, "lat": 32.46, "lng": -92.66, "priority": 2},
      {"id": 5, "lat": 32.44, "lng": -92.64, "priority": 1}
    ],
    "startLocation": {"lat": 32.45, "lng": -92.65},
    "conditions": {
      "trafficLevel": "high",
      "weather": "rain",
      "timeOfDay": "morning",
      "timeOfDayHour": 9
    }
  },
  "output": {
    "optimalOrder": [0, 3, 5, 2, 1, 4],
    "orderVector": [1, 2, 3, 4, 5, 6]
  }
}
```

**Explanation**:
- Stop 0: Urgent + high priority → FIRST
- Stop 3: Urgent (but far) → SECOND (urgency overrides distance in this case)
- Stop 5: Close + high priority → THIRD
- Stop 2: High priority → FOURTH
- Stop 1: Closest but low priority → FIFTH
- Stop 4: No special features → LAST

**What the model learns**: "Complex balancing of urgency, priority, and distance, with traffic considerations"

---

## Feature Encoding Reference

### Distance Features (per stop)
- **Range**: 0-10 km (typical delivery range)
- **Meaning**: Straight-line distance from start location

### Priority Features (per stop)
- **0.33** = Priority 1 (High)
- **0.67** = Priority 2 (Medium)
- **1.0** = Priority 3 (Low)

### Urgent Flag (per stop)
- **0** = Not urgent
- **1** = Urgent

### Time Window Urgency (per stop)
- **0** = No time window
- **0.0-1.0** = Urgency score (higher = more urgent)
  - 0.9 = Time window starting very soon
  - 0.5 = Time window starting in a few hours
  - 0.2 = Time window starting later

### Traffic Level
- **0** = Low traffic
- **0.5** = Moderate traffic
- **1.0** = High traffic

### Weather Impact
- **0** = Clear
- **0.3** = Rain
- **0.4** = Fog
- **0.5** = Snow

### Time of Day
- **0-1** = Normalized hour (0 = midnight, 1 = 11:59 PM)
- Example: 0.375 = 9 AM

### Rush Hour Flag
- **0** = Not rush hour
- **1** = Rush hour (7-9 AM or 5-7 PM)

---

## Training Data Statistics

**Total Examples Generated**: 200

**Distribution**:
- 3 stops: 20%
- 4 stops: 30%
- 5 stops: 30%
- 6 stops: 15%
- 7 stops: 5%

**Scenarios**:
- Simple distance-based: 30%
- Priority-based: 25%
- Urgent stops: 20%
- Time windows: 15%
- Heavy traffic: 10%

---

## What the Model Learns from These Examples

1. **Distance Patterns**: Closer stops generally come first
2. **Priority Patterns**: High priority stops get preference
3. **Urgency Patterns**: Urgent stops override other factors
4. **Traffic Patterns**: In heavy traffic, distance becomes more important
5. **Time Patterns**: Rush hour affects route decisions
6. **Complex Patterns**: How to balance multiple factors simultaneously

---

## Expected Learning Outcomes

After training on these examples, the model should be able to:

1. **Generalize**: Predict routes for new, unseen scenarios
2. **Balance Factors**: Weigh distance, priority, urgency appropriately
3. **Adapt to Conditions**: Adjust strategy based on traffic/weather
4. **Handle Edge Cases**: Deal with urgent stops, time windows, etc.

---

## Usage

These examples are used during training:

1. **Forward Pass**: Model predicts route order
2. **Compare**: Compare prediction to optimal order
3. **Calculate Error**: Measure how wrong the prediction was
4. **Backward Pass**: Update weights to reduce error
5. **Repeat**: Over many epochs, model learns patterns

The model learns by seeing many examples and adjusting its internal weights to minimize prediction error.

