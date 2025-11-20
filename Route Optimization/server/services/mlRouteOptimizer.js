/**
 * Machine Learning Route Optimizer
 * Learner Algorithm that trains on route data and predicts optimal route order
 * 
 * This implements the learner algorithm required by the lecturer:
 * - Training phase: Learns from examples (input-output pairs)
 * - Prediction phase: Predicts optimal route order for new inputs
 */

/**
 * Simple Neural Network for Route Optimization
 * This is a learner algorithm that maps input features to output route order
 */
class RouteOptimizationLearner {
  constructor(inputSize, hiddenSize = 16, outputSize) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    
    // Initialize weights randomly (Xavier initialization)
    this.weights1 = this.initializeWeights(inputSize, hiddenSize);
    this.weights2 = this.initializeWeights(hiddenSize, outputSize);
    this.bias1 = new Array(hiddenSize).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.bias2 = new Array(outputSize).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    
    this.learningRate = 0.001; // Reduced learning rate to prevent NaN
    this.trainingHistory = [];
  }
  
  /**
   * Initialize weights using Xavier initialization
   */
  initializeWeights(rows, cols) {
    const weights = [];
    const limit = Math.sqrt(2.0 / (rows + cols)); // He initialization (better for ReLU)
    
    for (let i = 0; i < rows; i++) {
      weights[i] = [];
      for (let j = 0; j < cols; j++) {
        const weight = (Math.random() * 2 - 1) * limit;
        weights[i][j] = isNaN(weight) || !isFinite(weight) ? 0 : weight;
      }
    }
    
    return weights;
  }
  
  /**
   * Sigmoid activation function
   */
  sigmoid(x) {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }
  
  /**
   * ReLU activation function
   */
  relu(x) {
    return Math.max(0, x);
  }
  
  /**
   * ReLU derivative
   */
  reluDerivative(x) {
    return x > 0 ? 1 : 0;
  }
  
  /**
   * Forward propagation: Predict output from input
   */
  forward(input) {
    // Validate input
    if (!input || input.length !== this.inputSize) {
      throw new Error(`Input size mismatch: expected ${this.inputSize}, got ${input ? input.length : 0}`);
    }
    
    // Input to hidden layer
    const hidden = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = this.bias1[i] || 0;
      for (let j = 0; j < this.inputSize; j++) {
        const weight = this.weights1[j] && this.weights1[j][i] ? this.weights1[j][i] : 0;
        const inputVal = isNaN(input[j]) || !isFinite(input[j]) ? 0 : input[j];
        sum += inputVal * weight;
      }
      // Clamp to prevent overflow
      sum = Math.max(-500, Math.min(500, sum));
      hidden[i] = this.relu(sum);
    }
    
    // Hidden to output layer
    const output = [];
    for (let i = 0; i < this.outputSize; i++) {
      let sum = this.bias2[i] || 0;
      for (let j = 0; j < this.hiddenSize; j++) {
        const weight = this.weights2[j] && this.weights2[j][i] ? this.weights2[j][i] : 0;
        const hiddenVal = isNaN(hidden[j]) || !isFinite(hidden[j]) ? 0 : hidden[j];
        sum += hiddenVal * weight;
      }
      // Clamp output
      output[i] = Math.max(-100, Math.min(100, sum));
    }
    
    return { hidden, output };
  }
  
  /**
   * Backward propagation: Update weights based on error
   * This is the "learning" part of the algorithm
   */
  backward(input, hidden, output, target, predicted) {
    // Calculate output error (Mean Squared Error derivative)
    const outputError = [];
    for (let i = 0; i < this.outputSize; i++) {
      const error = predicted[i] - target[i];
      outputError[i] = isNaN(error) || !isFinite(error) ? 0 : error;
    }
    
    // Calculate hidden layer error (backpropagate)
    const hiddenError = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let error = 0;
      for (let j = 0; j < this.outputSize; j++) {
        error += outputError[j] * this.weights2[i][j];
      }
      // ReLU derivative: 1 if hidden[i] > 0, else 0
      const derivative = this.reluDerivative(hidden[i]);
      hiddenError[i] = isNaN(error) || !isFinite(error) ? 0 : error * derivative;
    }
    
    // Update weights2 (hidden to output) - gradient descent
    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.outputSize; j++) {
        const gradient = outputError[j] * hidden[i];
        if (isNaN(gradient) || !isFinite(gradient)) continue;
        this.weights2[i][j] -= this.learningRate * gradient;
        // Clamp weights to prevent explosion
        this.weights2[i][j] = Math.max(-10, Math.min(10, this.weights2[i][j]));
      }
    }
    
    // Update bias2
    for (let i = 0; i < this.outputSize; i++) {
      if (isNaN(outputError[i]) || !isFinite(outputError[i])) continue;
      this.bias2[i] -= this.learningRate * outputError[i];
      this.bias2[i] = Math.max(-10, Math.min(10, this.bias2[i]));
    }
    
    // Update weights1 (input to hidden)
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        const gradient = hiddenError[j] * input[i];
        if (isNaN(gradient) || !isFinite(gradient)) continue;
        this.weights1[i][j] -= this.learningRate * gradient;
        // Clamp weights
        this.weights1[i][j] = Math.max(-10, Math.min(10, this.weights1[i][j]));
      }
    }
    
    // Update bias1
    for (let i = 0; i < this.hiddenSize; i++) {
      if (isNaN(hiddenError[i]) || !isFinite(hiddenError[i])) continue;
      this.bias1[i] -= this.learningRate * hiddenError[i];
      this.bias1[i] = Math.max(-10, Math.min(10, this.bias1[i]));
    }
    
    // Calculate and return loss (Mean Squared Error)
    let loss = 0;
    let validErrors = 0;
    for (let i = 0; i < this.outputSize; i++) {
      if (!isNaN(outputError[i]) && isFinite(outputError[i])) {
        loss += outputError[i] * outputError[i];
        validErrors++;
      }
    }
    loss = validErrors > 0 ? loss / validErrors : 0;
    
    return isNaN(loss) || !isFinite(loss) ? 0 : loss;
  }
  
  /**
   * Train the model on training data
   * This is the main training/learning process
   */
  train(trainingData, epochs = 100, batchSize = 10) {
    console.log(`Training model for ${epochs} epochs...`);
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      let batchCount = 0;
      
      // Shuffle training data
      const shuffled = [...trainingData].sort(() => Math.random() - 0.5);
      
      // Process in batches
      for (let i = 0; i < shuffled.length; i += batchSize) {
        const batch = shuffled.slice(i, i + batchSize);
        let batchLoss = 0;
        
        batch.forEach(example => {
          const { hidden, output: predicted } = this.forward(example.input.features);
          const target = example.output.orderVector;
          
          const loss = this.backward(
            example.input.features,
            hidden,
            predicted,
            target,
            predicted
          );
          
          batchLoss += loss;
        });
        
        totalLoss += batchLoss / batch.length;
        batchCount++;
      }
      
      const avgLoss = totalLoss / batchCount;
      this.trainingHistory.push({ epoch, loss: avgLoss });
      
      if (epoch % 10 === 0 || epoch === epochs - 1) {
        console.log(`Epoch ${epoch}: Loss = ${avgLoss.toFixed(6)}`);
      }
    }
    
    console.log('Training completed!');
    return this.trainingHistory;
  }
  
  /**
   * Predict optimal route order for new input
   */
  predict(features) {
    const { output } = this.forward(features);
    
    // Convert output to route order
    // Output is a vector where each element represents position in route
    const order = [];
    const sorted = output.map((value, index) => ({ index, value }))
                         .sort((a, b) => a.value - b.value);
    
    sorted.forEach(item => {
      order.push(item.index);
    });
    
    return order;
  }
  
  /**
   * Evaluate model on test data
   */
  evaluate(testData) {
    let correct = 0;
    let total = 0;
    let totalError = 0;
    
    testData.forEach(example => {
      const predicted = this.predict(example.input.features);
      const actual = example.output.optimalOrder;
      
      // Calculate accuracy (how many positions match)
      let matches = 0;
      predicted.forEach((pred, pos) => {
        if (pred === actual[pos]) matches++;
      });
      
      const accuracy = matches / predicted.length;
      correct += accuracy;
      total++;
      
      // Calculate mean squared error
      const predictedVector = this.forward(example.input.features).output;
      const actualVector = example.output.orderVector;
      const mse = predictedVector.reduce((sum, pred, i) => {
        return sum + Math.pow(pred - actualVector[i], 2);
      }, 0) / predictedVector.length;
      
      totalError += mse;
    });
    
    return {
      accuracy: correct / total,
      averageMSE: totalError / total
    };
  }
  
  /**
   * Save model to file
   */
  save(filepath) {
    const fs = require('fs');
    const modelData = {
      weights1: this.weights1,
      weights2: this.weights2,
      bias1: this.bias1,
      bias2: this.bias2,
      inputSize: this.inputSize,
      hiddenSize: this.hiddenSize,
      outputSize: this.outputSize,
      trainingHistory: this.trainingHistory
    };
    
    fs.writeFileSync(filepath, JSON.stringify(modelData, null, 2));
    console.log(`Model saved to ${filepath}`);
  }
  
  /**
   * Load model from file
   */
  static load(filepath) {
    const fs = require('fs');
    const modelData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    const model = new RouteOptimizationLearner(
      modelData.inputSize,
      modelData.hiddenSize,
      modelData.outputSize
    );
    
    model.weights1 = modelData.weights1;
    model.weights2 = modelData.weights2;
    model.bias1 = modelData.bias1;
    model.bias2 = modelData.bias2;
    model.trainingHistory = modelData.trainingHistory;
    
    console.log(`Model loaded from ${filepath}`);
    return model;
  }
}

/**
 * Train the ML model
 */
async function trainModel(trainingData, options = {}) {
  const {
    epochs = 100,
    batchSize = 10,
    hiddenSize = 16,
    learningRate = 0.01
  } = options;
  
  // Determine input and output sizes from first example
  const firstExample = trainingData[0];
  const inputSize = firstExample.input.features.length;
  const outputSize = firstExample.output.orderVector.length;
  
  // Create and train model
  const model = new RouteOptimizationLearner(inputSize, hiddenSize, outputSize);
  model.learningRate = learningRate;
  
  // Split data: 80% training, 20% testing
  const splitIndex = Math.floor(trainingData.length * 0.8);
  const trainSet = trainingData.slice(0, splitIndex);
  const testSet = trainingData.slice(splitIndex);
  
  console.log(`Training set: ${trainSet.length} examples`);
  console.log(`Test set: ${testSet.length} examples`);
  
  // Train model
  model.train(trainSet, epochs, batchSize);
  
  // Evaluate on test set
  const evaluation = model.evaluate(testSet);
  console.log(`\nModel Evaluation:`);
  console.log(`  Accuracy: ${(evaluation.accuracy * 100).toFixed(2)}%`);
  console.log(`  Average MSE: ${evaluation.averageMSE.toFixed(6)}`);
  
  return model;
}

/**
 * Use ML model to optimize route
 */
function optimizeRouteWithML(stops, startLocation, conditions, model, extractFeatures) {
  // Extract features
  const features = extractFeatures(stops, startLocation, conditions);
  
  // Predict optimal order
  const predictedOrder = model.predict(features);
  
  // Reorder stops based on prediction
  const optimizedStops = predictedOrder.map(index => stops[index]);
  
  return {
    order: predictedOrder,
    route: optimizedStops,
    method: 'ML'
  };
}

module.exports = {
  RouteOptimizationLearner,
  trainModel,
  optimizeRouteWithML
};

