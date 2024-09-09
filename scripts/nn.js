// How many previous candles are needed to calculate all needed data (for example, for EMA200 we need 200 candles...)
// Needs to be at least historyLen + 1
const neededHistoryLen = 200;
// How many previous candles to give to the NN (does not include the predicted candle)
// TODO doesn't need to be that high... 50 would definitely suffice
const historyLen = 100;
// How many candles should the NN predict
const futureLen = 1;

function Ai(){
  /*
  * Inputs (all values should be normalized - range within 0 and 1):
  *
  * TODO this probably needs to change. I could give it:
  *   Percentual change of a candle from the previous - high, low and close
  *     0 would be -100%, 0.5 would be 0%, 1.0 would be 100% or something like
  *     that? Or just map min and max of the chart to 0 and 1 and then map the
  *     nn's output back?
  *   And volume, of course -- maybe only for the last candle? (last candle
  *   volume / max volume of the chart)
  * For every candle:
  *   Open price -- is this needed??
  *   High price
  *   Low price
  *   Close price
  *   Volume
  * Indicators:
  *   EMA
  *   RSI
  *
  * -- To implement:
  * Time (minutes from 00:00) - for example 01:30 = 1*60 + 30
  * Day of the week
  * Timeframe (interval of candles) - I guess it could be 0.1 for 1m, 0.2 for
  *   5m, 0.3 for 15m, 0.4 for 30m, 0.5 for 1h, 0.6 for 4h, 0.7 for 1d or
  *   something like that
  * Volatility - average candle % change of candle open and close
  * Volatility - average candle % change of candle low and high
  * ...
  */
  const inputs = emaTimeframes.length * emaSamples + rsiTimeframes.length + candleSamples * 5;

  /*
  * Outputs:
  *   Percent change of the future candle relative to the last historical
  *   candle
  */

  const outputs = 1;

  this.model;
  this.learningRate = 0.01;

  this.newModel = function(){
    // Initialise the model as a sequential neural network
    this.model = tf.sequential();
    // Add desired layers to the model
    this.model.add(tf.layers.dense({
      units: 192,
      activation: "relu",
      inputShape: [inputs]
    }));
    this.model.add(tf.layers.dense({
      units: 128,
      activation: "relu"
    }));
    this.model.add(tf.layers.dense({
      units: 64,
      activation: "relu"
    }));
    this.model.add(tf.layers.dense({
      units: 32,
      activation: "relu"
    }));
    this.model.add(tf.layers.dense({
      units: outputs
    }));
    // Compile the model
    this.compileModel();
    return model;
  }

  this.compileModel = function(){
    this.model.compile({
      optimizer: tf.train.sgd(this.learningRate),
      loss: 'meanSquaredError'
    });
  }

  this.test = async function(chartsAmount){
    let accuracySum = 0;
    let singlePriceAccuracy;

    let upDownAccuracySum = 0;

    console.log("Generating " + chartsAmount + " new data");
    let io = await this.getNewTrainingData(chartsAmount); // Inputs and outputs of the neural net (almost. They need to be converted to tensors)

    console.log("Testing with new data started");
    let xs = tf.tensor2d(io[0], [chartsAmount, inputs]);
    let ys = tf.tensor2d(io[1], [chartsAmount, outputs]);

    for(let i = 0; i < chartsAmount; i++){
      // Expected output is the percent change of the future candle's close
      // relative to the last historical candle's close
      // Note: This is copied from function getNewTrainingData
      let lastClose = chart[i].candle[historyLen - 1].data[cols.close]; // Close value of last historical candle
      let futureClose = chart[i].candle[historyLen].data[cols.close]; // Close value of the future candle
      let expectedOutput = (futureClose - lastClose) / lastClose; // Percentage change of the price (but divided by 100: 10% = 0.1)
      expectedOutput += 0.5; // We don't want the output to be negative
      // -50% will be equal to 0, 50% will be equal to 1. This probably won't work well. Something like inverse tangent function would be nice

      let predictedOutput = this.model.predict(tf.tensor2d(io[0][0], [1, inputs])).dataSync();

      if(i == 0){ // If this is the first chart from the ones being tested, also print the data
        this.printTestData(expectedOutput, predictedOutput);
        this.drawTestPrediction(predictedOutput);
      }

      if(expectedOutput >= 0.5 && predictedOutput >= 0.5 || expectedOutput <= 0.5 && predictedOutput <= 0.5){
        upDownAccuracySum += 1;
      }

      accuracySum += Math.abs((1 / (expectedOutput / predictedOutput)) - 1);
    }
    xs.dispose();
    ys.dispose();

    upDownAccuracy = ((upDownAccuracySum / chartsAmount) * 100).toFixed(8);

    // SHOULD BE CALCULATED DIFFERENTLY?
    avgAccuracy = ((accuracySum / chartsAmount) * 100).toFixed(8);

    testing = 0;
  }

  this.drawTestPrediction = function(predictedOutput){
    let candleIndex = historyLen + futureLen;
    let data = [];
    data[0] = 0;
    data[cols.open] = chart[0].candle[historyLen - 1].data[cols.close]; // The predicted candle's open price will be last historical candle's close price
    data[cols.low] = data[cols.high] = data[cols.open]; // We don't need the wick
    data[cols.close] = data[cols.open] * (predictedOutput[0] + 0.5); // Convert the predicted output to a multiplier and multiply the open price by that
    chart[0].addNewCandle(data);
    chart[0].candle[candleIndex].color = [0, 0, 255];
  }

  this.printTestData = function(expectedOutput, predictedOutput){
    console.log("\tExpected output for chart with index = 0:");
    console.log("\t\t" + (expectedOutput));
    console.log("\tPredicted output:");
    console.log("\t\t" + (predictedOutput));
  }

  this.train = async function(){
    while(training && (cycles == 0 || (cycles - cyclesTrained) != 0)){
      console.log("================================================================================");
      console.log("New training cycle starting");
      console.log("Generating " + chartsPerEpoch + " new data");
      let io = await this.getNewTrainingData(chartsPerEpoch); // Inputs and outputs of the neural net (almost. They need to be converted to tensors)

      console.log("Testing with one sample. The blue candle on the chart is AI's prediction of the last candle");
      let predictedOutput = this.model.predict(tf.tensor2d(io[0][0], [1, inputs])).dataSync();
      this.drawTestPrediction(predictedOutput);
      this.printTestData(io[1][0], predictedOutput);

      console.log("Training with new data started");
      let xs = tf.tensor2d(io[0], [chartsPerEpoch, inputs]);
      let ys = tf.tensor2d(io[1], [chartsPerEpoch, outputs]);
      await this.trainingFn(xs, ys);
      xs.dispose();
      ys.dispose();


      if(cycles - cyclesTrained != 0){
        cyclesTrained++;
      }
    }
    training = 0;
    cyclesTrained = 0;
  }

  this.getNewTrainingData = async function(amount){
    await getNewCharts(amount);
    let xs = [];
    let ys = [];
    for(let i = 0; i < amount; i++){
      let inputData = [];
      inputData = chart[i].rsi.concat(chart[i].ema); // The RSI and EMA are one of the inputs
      for(let j = historyLen - candleSamples; j < historyLen; j++){
        for(let k = 0; k < 5; k++){ // We give the nn 5 numbers per candle
          inputData.push(chart[i].candle[j].normData[k]); // Also give some historical candles as inputs
        }
      }

      // Expected output is the percent change of the future candle's close
      // relative to the last historical candle's close
      let lastClose = chart[i].candle[historyLen - 1].data[cols.close]; // Close value of last historical candle
      let futureClose = chart[i].candle[historyLen].data[cols.close]; // Close value of the future candle
      let outputData = (futureClose - lastClose) / lastClose; // Percentage change of the price (but divided by 100: 10% = 0.1)
      outputData += 0.5; // We don't want the output to be negative
      // -50% will be equal to 0, 50% will be equal to 1. This probably won't work well. Something like inverse tangent function would be nice

      xs[i] = inputData;
      ys[i] = outputData;
    }
    return [xs, ys];
  }

  this.trainingFn = async function(xs, ys){
    const result = await this.model.fit(xs, ys, {
      batchSize: chartsPerEpoch,
      epochs: epochs,
      shuffle: true,
      verbose: 2
    });
    console.log("Loss of this training cycle: " + result.history.loss[0]);
  }
}
