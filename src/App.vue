<script setup lang="ts">
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { onMounted } from 'vue';

const plot = async(pointsArray, featureName) => {
  tfvis.render.scatterplot(
    {name: `${featureName} vs House Price`},
    {values: [pointsArray], series: ['Original']},
    {
      xLabel: featureName,
      yLabel: 'Price'
    }
    )
}

const normalise = (tensor) => {
  const min = tensor.min();
  const max = tensor.max();

  const normalisedTensor = tensor.sub(min).div(max.sub(min));

  return normalisedTensor;
} 

const createModel = () => {
  const model = tf.sequential();
  model.add(tf.layers.dense({
    units: 1, 
    useBias: true,
    activation: 'linear',
    inputDim: 1,
  }))
  return model;
}

const trainModel = async (model, trainingFeatureTensor, trainingLabelTensor) => {
  const {onBatchEnd, onEpochEnd} = tfvis.show.fitCallbacks(
    {name: 'Training performance'},
    ['loss']
  )
  return model.fit(trainingFeatureTensor, trainingLabelTensor, {
    batchSize: 32,
    epochs: 20,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd,
    }
  });
}
   
onMounted(async() => {
  const dataset = tf.data.csv('/data.csv');
  const pointsDataset = dataset.map(record => ({
    x: record.sqft_living,
    y: record.price,
  }));

  const points = await pointsDataset.toArray();
  if (points.length % 2 !== 0) {
    points.pop(); 
  }
  tf.util.shuffle(points);
  plot(points, 'sqft');

  const featureValues = points.map(p => p.x);
  const featureTensor = tf.tensor2d(featureValues, [featureValues.length, 1]);

  const labelValues = points.map(p => p.y);
  const labelTensor = tf.tensor2d(labelValues, [labelValues.length, 1])

  const normalisedFeature = normalise(featureTensor);
  const normalisedLabel = normalise(labelTensor);

  const [trainingFeatureTensor, testingFeatureTensor] = tf.split(normalisedFeature, 2);
  const [trainingLabelTensor, testingLabelTensor] = tf.split(normalisedLabel, 2);

  const model = createModel();

  tfvis.show.modelSummary({name: 'Model summary'}, model);
  const layer = model.getLayer(undefined, 0);
  tfvis.show.layer({name: 'Layer 1'}, layer);
  
  const optimizer = tf.train.sgd(0.1); 
  model.compile({
    loss: 'meanSquaredError', 
    optimizer, 
  })

  const result = await trainModel(model, trainingFeatureTensor, trainingLabelTensor);
  const trainingLoss = result.history.loss.pop();
  console.log(`Training set loss: ${trainingLoss}`)

  const validationLoss = result.history.val_loss.pop();
  console.log(`Validation set loss: ${validationLoss}`)

  const lossTensor = model.evaluate(testingFeatureTensor, testingLabelTensor);
  const loss = await lossTensor.dataSync();
  console.log(`Testing set loss: ${loss}`)
});
</script>

<template>
  <div>
    123
  </div>
</template>
