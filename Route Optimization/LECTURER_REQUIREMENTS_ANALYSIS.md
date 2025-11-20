# Lecturer Requirements Analysis

## What Your Lecturer Wants

### Key Requirements from Announcements:

1. **Learner Algorithm (Machine Learning)**
   - NOT a traditional algorithm
   - Must be a **training/ML process** where the algorithm learns from data
   - "Training/ML is the process whereby the learner algorithm maps a flexible function to the data"

2. **Training Examples**
   - "Provide a learner algorithm with all sorts of examples of the desired inputs and results expected from those inputs"
   - Need input-output pairs for training

3. **Pseudocode/Flowchart**
   - Algorithm representation
   - What you've done (implementation)

4. **Scope Document**
   - What you plan to do
   - Project scope

5. **Team Roles**
   - Division of responsibilities

---

## The Problem: Mismatch with Current Project

### What We Built:
- ✅ Traditional route optimization (TSP, Nearest Neighbor)
- ✅ Deterministic algorithms (same input = same output)
- ✅ Rule-based system
- ❌ **NO Machine Learning component**

### What Lecturer Wants:
- ❌ Machine Learning / Learner Algorithm
- ❌ Training data with examples
- ❌ Model that learns from patterns
- ❌ Flexible function that adapts to data

---

## Solution: Add Machine Learning Component

### Option 1: ML-Based Route Optimization (Recommended)

**Idea**: Train a model to predict optimal route order based on historical delivery data.

**Training Data Examples:**
```
Input: [start_location, stop1, stop2, stop3, traffic_conditions, time_of_day, priority]
Output: [optimal_order: 2, 1, 3]  (which order to visit stops)
```

**Learner Algorithm:**
- Use supervised learning (e.g., Neural Network, Random Forest)
- Train on historical delivery routes
- Learn patterns: "When traffic is heavy, prioritize closest stops first"
- Learn from successful routes

**Implementation:**
1. Collect training data (historical routes with known optimal orders)
2. Train model to predict route order
3. Use model predictions instead of (or combined with) traditional algorithm

### Option 2: ML-Based Time Estimation

**Idea**: Train a model to predict delivery time based on route characteristics.

**Training Data Examples:**
```
Input: [distance, traffic_level, weather, time_of_day, number_of_stops]
Output: [estimated_time: 45 minutes]
```

**Learner Algorithm:**
- Regression model (Linear Regression, Neural Network)
- Learns from actual delivery times
- Improves predictions over time

### Option 3: ML-Based Priority Learning

**Idea**: Learn which stops should be prioritized based on customer behavior.

**Training Data Examples:**
```
Input: [customer_history, order_value, time_since_order, location]
Output: [priority_score: 0.85]
```

**Learner Algorithm:**
- Classification or regression
- Learns customer patterns
- Adapts priority scoring

---

## Recommended Approach: Hybrid System

### Combine Traditional Algorithm + ML

1. **Traditional Algorithm** (What we have):
   - Base route optimization
   - Deterministic calculations
   - Works without training data

2. **ML Component** (What to add):
   - **Route Order Predictor**: Learns optimal stop order from historical data
   - **Time Estimator**: Predicts delivery time more accurately
   - **Traffic Predictor**: Learns traffic patterns

### Training Data Structure:

```python
# Example training data
training_examples = [
    {
        "input": {
            "stops": [
                {"lat": 32.5, "lng": -92.7, "priority": 1},
                {"lat": 32.6, "lng": -92.8, "priority": 2},
                {"lat": 32.4, "lng": -92.6, "priority": 3}
            ],
            "start_location": {"lat": 32.5, "lng": -92.7},
            "traffic_level": "moderate",
            "time_of_day": "14:30",
            "weather": "clear"
        },
        "output": {
            "optimal_order": [1, 3, 2],  # Stop order
            "total_time": 35,  # minutes
            "total_distance": 12.5  # km
        }
    },
    # ... more examples
]
```

### Learner Algorithm Pseudocode:

```
ALGORITHM: RouteOptimizationLearner

1. INITIALIZE model (Neural Network / Random Forest)
2. LOAD training_data (historical routes with optimal orders)
3. 
4. FOR each epoch:
5.     FOR each example in training_data:
6.         input_features = extract_features(example.input)
7.         predicted_order = model.predict(input_features)
8.         actual_order = example.output.optimal_order
9.         loss = calculate_loss(predicted_order, actual_order)
10.        model.update_weights(loss)  // Learn from error
11.    END FOR
12. END FOR
13.
14. RETURN trained_model
```

---

## What You Need to Do

### 1. Add ML Component to Project

**Files to Create:**
- `server/services/mlRouteOptimizer.js` - ML-based optimizer
- `server/services/trainingDataGenerator.js` - Generate training examples
- `server/models/routeModel.js` - ML model (TensorFlow.js or similar)

**Libraries to Add:**
- TensorFlow.js (for browser/Node.js ML)
- Or scikit-learn (Python backend)
- Or use a simple neural network library

### 2. Create Training Data

**Generate Examples:**
- Historical delivery routes
- Simulated optimal routes
- Input-output pairs

### 3. Train Model

**Process:**
- Split data: training (80%) / testing (20%)
- Train model on training data
- Validate on test data
- Measure accuracy

### 4. Integrate with Existing System

**Hybrid Approach:**
- Use ML model to predict route order
- Use traditional algorithm as fallback
- Combine both for best results

---

## Presentation Requirements

### What to Include:

1. **Learner Algorithm Pseudocode**
   - Training process
   - Prediction process
   - Learning mechanism

2. **Training Examples**
   - Show 5-10 input-output pairs
   - Explain what model learns from each

3. **Scope Document**
   - Project goals
   - ML component description
   - Traditional algorithm (as baseline)

4. **Team Roles**
   - Who works on ML component
   - Who works on frontend
   - Who works on integration

---

## Quick Implementation Plan

### Week 1: Add ML Component
- [ ] Install TensorFlow.js or ML library
- [ ] Create training data generator
- [ ] Design model architecture
- [ ] Implement training algorithm

### Week 2: Train & Integrate
- [ ] Generate training examples
- [ ] Train model
- [ ] Integrate with existing route optimizer
- [ ] Test hybrid system

### Week 3: Documentation
- [ ] Write pseudocode for learner algorithm
- [ ] Document training examples
- [ ] Update scope document
- [ ] Prepare presentation

---

## Example Learner Algorithm Pseudocode

```
ALGORITHM: MLRouteOptimizer

// Training Phase
FUNCTION train_model(training_data):
    model = initialize_neural_network()
    
    FOR epoch = 1 to MAX_EPOCHS:
        total_loss = 0
        
        FOR each example in training_data:
            // Extract features
            features = [
                example.distances,
                example.priorities,
                example.traffic_level,
                example.time_of_day
            ]
            
            // Predict
            predicted_order = model.predict(features)
            
            // Compare with actual optimal order
            actual_order = example.optimal_order
            loss = calculate_order_loss(predicted_order, actual_order)
            
            // Update model (learn from error)
            model.backpropagate(loss)
            total_loss += loss
        END FOR
        
        // Log progress
        PRINT "Epoch", epoch, "Loss:", total_loss / training_data.length
    END FOR
    
    RETURN model
END FUNCTION

// Prediction Phase
FUNCTION predict_optimal_route(stops, start_location, conditions):
    // Extract features from current route
    features = extract_features(stops, start_location, conditions)
    
    // Use trained model to predict
    predicted_order = trained_model.predict(features)
    
    // Return optimized route order
    RETURN predicted_order
END FUNCTION

// Feature Extraction
FUNCTION extract_features(stops, start_location, conditions):
    features = []
    
    FOR each stop in stops:
        distance = calculate_distance(start_location, stop)
        features.append(distance)
        features.append(stop.priority)
        features.append(stop.urgent ? 1 : 0)
    END FOR
    
    features.append(conditions.traffic_level)
    features.append(conditions.time_of_day)
    features.append(conditions.weather_score)
    
    RETURN features
END FUNCTION
```

---

## Training Examples Format

### Example 1:
```
INPUT:
- Stops: [A(priority:1), B(priority:2), C(priority:3)]
- Start: Location X
- Traffic: Moderate
- Time: 14:30
- Weather: Clear

OUTPUT:
- Optimal Order: [A, C, B]  // Priority 1 first, then closest
- Total Time: 35 minutes
- Total Distance: 12.5 km
```

### Example 2:
```
INPUT:
- Stops: [A(urgent:true), B(priority:1), C(priority:2)]
- Start: Location Y
- Traffic: Heavy
- Time: 17:00 (rush hour)
- Weather: Rain

OUTPUT:
- Optimal Order: [A, B, C]  // Urgent first, then priority
- Total Time: 52 minutes
- Total Distance: 15.3 km
```

---

## Next Steps

1. **Decide on ML Approach**: Which component to add ML to?
2. **Choose ML Library**: TensorFlow.js, Brain.js, or Python scikit-learn
3. **Generate Training Data**: Create examples
4. **Implement Training**: Write learner algorithm
5. **Integrate**: Combine with existing system
6. **Document**: Write pseudocode and examples

---

## Summary

**Current Status**: ✅ Traditional algorithm (meets optimization requirements)
**Missing**: ❌ Machine Learning component (required by lecturer)
**Solution**: Add ML-based route prediction that learns from training examples
**Timeline**: 2-3 weeks to implement and train

The good news: Your existing project is excellent! We just need to add an ML layer on top of it to meet the lecturer's requirements.

