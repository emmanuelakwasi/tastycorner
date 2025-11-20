# Learner Algorithm Pseudocode

## Route Optimization Learner Algorithm

This document provides the pseudocode for the Machine Learning (Learner) Algorithm that trains on route data to predict optimal delivery route orders.

---

## Algorithm Overview

The learner algorithm implements a **Neural Network** that learns to map input features (stop locations, priorities, traffic conditions) to optimal route orders through a training process.

---

## Main Training Algorithm

```
ALGORITHM: RouteOptimizationLearner.Train

INPUT: 
    trainingData - Array of examples, each containing:
        - input.features: Array of numerical features
        - output.optimalOrder: Array of stop indices in optimal order
        - output.orderVector: Vector representation of order
    epochs - Number of training iterations (default: 100)
    batchSize - Number of examples per batch (default: 10)
    learningRate - Step size for weight updates (default: 0.01)

OUTPUT:
    trainedModel - Neural network with learned weights
    trainingHistory - Array of loss values per epoch

BEGIN
    // Initialize neural network
    model = CREATE NeuralNetwork(
        inputSize = trainingData[0].input.features.length,
        hiddenSize = 16,
        outputSize = trainingData[0].output.orderVector.length
    )
    
    // Initialize weights randomly (Xavier initialization)
    model.weights1 = INITIALIZE_WEIGHTS(inputSize, hiddenSize)
    model.weights2 = INITIALIZE_WEIGHTS(hiddenSize, outputSize)
    model.bias1 = INITIALIZE_BIAS(hiddenSize)
    model.bias2 = INITIALIZE_BIAS(outputSize)
    
    trainingHistory = []
    
    // Training loop
    FOR epoch = 1 TO epochs DO
        totalLoss = 0
        batchCount = 0
        
        // Shuffle training data for better learning
        shuffledData = SHUFFLE(trainingData)
        
        // Process in batches
        FOR i = 0 TO shuffledData.length STEP batchSize DO
            batch = shuffledData[i TO i + batchSize]
            batchLoss = 0
            
            // Process each example in batch
            FOR EACH example IN batch DO
                // Forward propagation: Predict output
                features = example.input.features
                {hidden, predicted} = FORWARD_PROPAGATE(model, features)
                target = example.output.orderVector
                
                // Calculate error
                loss = CALCULATE_LOSS(predicted, target)
                batchLoss = batchLoss + loss
                
                // Backward propagation: Update weights (LEARNING STEP)
                BACKWARD_PROPAGATE(model, features, hidden, predicted, target)
            END FOR
            
            avgBatchLoss = batchLoss / batch.length
            totalLoss = totalLoss + avgBatchLoss
            batchCount = batchCount + 1
        END FOR
        
        avgLoss = totalLoss / batchCount
        trainingHistory[epoch] = {epoch, loss: avgLoss}
        
        // Log progress every 10 epochs
        IF epoch MOD 10 == 0 OR epoch == epochs THEN
            PRINT "Epoch", epoch, "Loss:", avgLoss
        END IF
    END FOR
    
    RETURN {model, trainingHistory}
END
```

---

## Forward Propagation (Prediction)

```
FUNCTION: FORWARD_PROPAGATE

INPUT:
    model - Neural network with weights and biases
    features - Input feature vector

OUTPUT:
    {hidden, output} - Hidden layer activations and output predictions

BEGIN
    // Input to hidden layer
    hidden = []
    FOR i = 0 TO model.hiddenSize DO
        sum = model.bias1[i]
        FOR j = 0 TO model.inputSize DO
            sum = sum + features[j] * model.weights1[j][i]
        END FOR
        hidden[i] = ReLU(sum)  // Apply ReLU activation
    END FOR
    
    // Hidden to output layer
    output = []
    FOR i = 0 TO model.outputSize DO
        sum = model.bias2[i]
        FOR j = 0 TO model.hiddenSize DO
            sum = sum + hidden[j] * model.weights2[j][i]
        END FOR
        output[i] = sum  // Linear output (no activation)
    END FOR
    
    RETURN {hidden, output}
END
```

---

## Backward Propagation (Learning)

```
FUNCTION: BACKWARD_PROPAGATE

INPUT:
    model - Neural network
    input - Input features
    hidden - Hidden layer activations
    predicted - Predicted output
    target - Actual (target) output

OUTPUT:
    loss - Mean squared error

BEGIN
    // Calculate output layer error
    outputError = []
    FOR i = 0 TO model.outputSize DO
        outputError[i] = predicted[i] - target[i]
    END FOR
    
    // Calculate hidden layer error (backpropagate)
    hiddenError = []
    FOR i = 0 TO model.hiddenSize DO
        error = 0
        FOR j = 0 TO model.outputSize DO
            error = error + outputError[j] * model.weights2[i][j]
        END FOR
        // ReLU derivative: 1 if hidden[i] > 0, else 0
        hiddenError[i] = error * (hidden[i] > 0 ? 1 : 0)
    END FOR
    
    // Update weights2 (hidden to output layer)
    FOR i = 0 TO model.hiddenSize DO
        FOR j = 0 TO model.outputSize DO
            gradient = outputError[j] * hidden[i]
            model.weights2[i][j] = model.weights2[i][j] - learningRate * gradient
        END FOR
    END FOR
    
    // Update bias2
    FOR i = 0 TO model.outputSize DO
        model.bias2[i] = model.bias2[i] - learningRate * outputError[i]
    END FOR
    
    // Update weights1 (input to hidden layer)
    FOR i = 0 TO model.inputSize DO
        FOR j = 0 TO model.hiddenSize DO
            gradient = hiddenError[j] * input[i]
            model.weights1[i][j] = model.weights1[i][j] - learningRate * gradient
        END FOR
    END FOR
    
    // Update bias1
    FOR i = 0 TO model.hiddenSize DO
        model.bias1[i] = model.bias1[i] - learningRate * hiddenError[i]
    END FOR
    
    // Calculate loss (Mean Squared Error)
    loss = 0
    FOR i = 0 TO model.outputSize DO
        loss = loss + (outputError[i] * outputError[i])
    END FOR
    loss = loss / model.outputSize
    
    RETURN loss
END
```

---

## Prediction Algorithm

```
FUNCTION: PREDICT

INPUT:
    model - Trained neural network
    features - Input features for new route

OUTPUT:
    order - Predicted optimal order of stops

BEGIN
    // Forward propagate to get predictions
    {hidden, output} = FORWARD_PROPAGATE(model, features)
    
    // Convert output vector to route order
    // Output values represent "position scores" - lower score = earlier in route
    order = []
    sortedOutput = SORT_WITH_INDEX(output)  // Sort by value, keep original indices
    
    FOR EACH item IN sortedOutput DO
        order.APPEND(item.index)  // Add stop index to order
    END FOR
    
    RETURN order
END
```

---

## Feature Extraction

```
FUNCTION: EXTRACT_FEATURES

INPUT:
    stops - Array of delivery stops
    startLocation - Starting location {lat, lng}
    conditions - Current conditions {trafficLevel, weather, timeOfDay, timeOfDayHour}

OUTPUT:
    features - Feature vector for ML model

BEGIN
    features = []
    
    // For each stop, extract features
    FOR EACH stop IN stops DO
        // Distance from start location
        distance = HAVERSINE_DISTANCE(
            startLocation.lat, startLocation.lng,
            stop.lat, stop.lng
        )
        features.APPEND(distance)
        
        // Priority (normalized 0-1)
        priority = stop.priority / 3
        features.APPEND(priority)
        
        // Urgent flag (0 or 1)
        urgent = stop.urgent ? 1 : 0
        features.APPEND(urgent)
        
        // Time window urgency
        IF stop.timeWindow EXISTS THEN
            now = CURRENT_TIME()
            timeUntilStart = (stop.timeWindow.start - now) / 3600000  // hours
            urgency = MAX(0, 1 - timeUntilStart / 24)
            features.APPEND(urgency)
        ELSE
            features.APPEND(0)
        END IF
    END FOR
    
    // Traffic level encoding
    trafficEncoding = {low: 0, moderate: 0.5, high: 1}
    features.APPEND(trafficEncoding[conditions.trafficLevel])
    
    // Weather impact encoding
    weatherEncoding = {clear: 0, rain: 0.3, snow: 0.5, fog: 0.4}
    features.APPEND(weatherEncoding[conditions.weather])
    
    // Time of day (normalized 0-1)
    features.APPEND(conditions.timeOfDayHour / 24)
    
    // Rush hour indicator
    isRushHour = (conditions.timeOfDayHour >= 7 AND conditions.timeOfDayHour <= 9) OR
                 (conditions.timeOfDayHour >= 17 AND conditions.timeOfDayHour <= 19)
    features.APPEND(isRushHour ? 1 : 0)
    
    RETURN features
END
```

---

## Training Data Generation

```
FUNCTION: GENERATE_TRAINING_DATA

INPUT:
    numExamples - Number of training examples to generate

OUTPUT:
    trainingData - Array of training examples

BEGIN
    trainingData = []
    
    FOR i = 1 TO numExamples DO
        // Generate random scenario
        numStops = RANDOM(3, 7)  // 3 to 7 stops
        stops = GENERATE_RANDOM_STOPS(numStops)
        startLocation = GENERATE_RANDOM_LOCATION()
        conditions = GENERATE_RANDOM_CONDITIONS()
        
        // Calculate optimal order using traditional algorithm (ground truth)
        optimalOrder = CALCULATE_OPTIMAL_ORDER(stops, startLocation, conditions)
        
        // Extract features
        features = EXTRACT_FEATURES(stops, startLocation, conditions)
        
        // Convert order to vector
        orderVector = ORDER_TO_VECTOR(optimalOrder, numStops)
        
        // Create training example
        example = {
            input: {
                features: features,
                stops: stops,
                startLocation: startLocation,
                conditions: conditions
            },
            output: {
                optimalOrder: optimalOrder,
                orderVector: orderVector
            }
        }
        
        trainingData.APPEND(example)
    END FOR
    
    RETURN trainingData
END
```

---

## Complete Training Process Flowchart

```
START
  │
  ├─> Load or Generate Training Data
  │     │
  │     ├─> IF training_data.json EXISTS
  │     │     └─> LOAD training_data.json
  │     │
  │     └─> ELSE
  │           └─> GENERATE_TRAINING_DATA(200)
  │                 └─> SAVE training_data.json
  │
  ├─> Initialize Neural Network
  │     ├─> inputSize = features.length
  │     ├─> hiddenSize = 16
  │     ├─> outputSize = orderVector.length
  │     └─> INITIALIZE_WEIGHTS (random)
  │
  ├─> Split Data (80% train, 20% test)
  │
  ├─> FOR epoch = 1 TO 100 DO
  │     │
  │     ├─> Shuffle Training Data
  │     │
  │     ├─> FOR EACH batch IN trainingData DO
  │     │     │
  │     │     ├─> FOR EACH example IN batch DO
  │     │     │     │
  │     │     │     ├─> FORWARD_PROPAGATE
  │     │     │     │     └─> Get prediction
  │     │     │     │
  │     │     │     ├─> CALCULATE_LOSS
  │     │     │     │     └─> Compare prediction vs target
  │     │     │     │
  │     │     │     └─> BACKWARD_PROPAGATE
  │     │     │           └─> UPDATE_WEIGHTS (LEARNING)
  │     │     │
  │     │     └─> END FOR
  │     │
  │     └─> END FOR
  │
  ├─> EVALUATE on Test Data
  │     └─> Calculate Accuracy and MSE
  │
  ├─> SAVE trained_model.json
  │
  └─> END
```

---

## Key Learning Concepts

### 1. **Training Process**
- The algorithm learns by comparing predictions to actual optimal orders
- Errors (differences) are used to update weights
- Over many epochs, the model learns patterns in the data

### 2. **Learning Mechanism**
- **Forward Pass**: Input → Hidden Layer → Output (Prediction)
- **Backward Pass**: Error → Update Weights (Learning)
- **Gradient Descent**: Adjusts weights to minimize error

### 3. **What the Model Learns**
- Distance patterns: "Closer stops should come first"
- Priority patterns: "High priority stops should come earlier"
- Traffic patterns: "In heavy traffic, prioritize closest stops"
- Time patterns: "Rush hour affects route order"

### 4. **Flexible Function Mapping**
- The neural network is a flexible function that can learn complex patterns
- Unlike fixed algorithms, it adapts to the training data
- Can discover non-obvious relationships between features and optimal routes

---

## Example Training Iteration

```
Example 1:
  Input Features: [2.5, 0.33, 0, 0, 0.5, 0, 0.625, 0]
  Target Order: [0, 2, 1]  // Stop 0 first, then 2, then 1
  Predicted Order (initial): [1, 0, 2]  // Wrong!
  Error: High
  → Update weights to reduce error

Example 2:
  Input Features: [1.8, 0.67, 1, 0.3, 1.0, 0.3, 0.75, 1]
  Target Order: [1, 0, 2]  // Urgent stop first
  Predicted Order: [1, 0, 2]  // Correct!
  Error: Low
  → Small weight adjustment

... (many more examples)

After 100 epochs:
  Model has learned patterns
  Can predict route order for new inputs
```

---

## Mathematical Formulation

### Forward Propagation
```
h = ReLU(W1 · x + b1)
y = W2 · h + b2
```
Where:
- `x` = input features
- `W1`, `W2` = weight matrices
- `b1`, `b2` = bias vectors
- `h` = hidden layer
- `y` = output prediction

### Loss Function
```
L = (1/n) Σ (y_pred - y_target)²
```
Mean Squared Error (MSE)

### Weight Update (Gradient Descent)
```
W = W - α · ∇L
```
Where:
- `α` = learning rate
- `∇L` = gradient of loss function

---

## Summary

This learner algorithm:
1. **Learns from examples** (training data with input-output pairs)
2. **Maps flexible function** (neural network) to route data
3. **Improves over time** (reduces error through training)
4. **Generalizes** (can predict optimal routes for new inputs)
5. **Adapts** (learns patterns that traditional algorithms might miss)

This meets the lecturer's requirement for a "learner algorithm" that learns from training examples and maps a flexible function to data.

