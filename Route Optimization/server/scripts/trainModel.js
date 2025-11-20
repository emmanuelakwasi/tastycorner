/**
 * Training Script for ML Route Optimizer
 * Run this to train the learner algorithm on route data
 * 
 * Usage: node server/scripts/trainModel.js
 */

const path = require('path');
const {
  generateTrainingData,
  saveTrainingData,
  loadTrainingData
} = require('../services/trainingDataGenerator');
const { trainModel } = require('../services/mlRouteOptimizer');

async function main() {
  console.log('=== ML Route Optimizer Training ===\n');
  
  // Step 1: Generate or load training data
  const dataFile = path.join(__dirname, '..', 'data', 'training_data.json');
  let trainingData;
  
  try {
    console.log('Loading existing training data...');
    trainingData = loadTrainingData();
    console.log(`Loaded ${trainingData.length} training examples\n`);
  } catch (error) {
    console.log('No existing training data found. Generating new data...');
    trainingData = generateTrainingData(200); // Generate 200 examples
    saveTrainingData(trainingData);
    console.log(`Generated ${trainingData.length} training examples\n`);
  }
  
  // Step 2: Train the model
  console.log('Starting model training...\n');
  const model = await trainModel(trainingData, {
    epochs: 150,
    batchSize: 10,
    hiddenSize: 16,
    learningRate: 0.01
  });
  
  // Step 3: Save the trained model
  const modelFile = path.join(__dirname, '..', 'data', 'trained_model.json');
  model.save(modelFile);
  
  console.log('\n=== Training Complete ===');
  console.log(`Model saved to: ${modelFile}`);
  console.log(`Training examples: ${trainingData.length}`);
  console.log(`Final loss: ${model.trainingHistory[model.trainingHistory.length - 1].loss.toFixed(6)}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = main;

