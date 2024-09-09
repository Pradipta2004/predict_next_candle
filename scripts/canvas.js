// Info: line 1
let trainButton;
let cyclesInput;
let epochsInput;
let chartsPerEpochInput;
// Line 2
let testButton;
let testInput;
// Line 3
let upDownAccuracy;
let avgAccuracy;
// Line 4
let drawChartButton;
// Line 5
let saveBrowserButton;
let saveLocalButton;
let loadBrowserButton;
let loadLocalButton;


function Button(row, col, text, fn){
  this.button = createButton(text);
  this.button.position(margin + (col - 1) * colWidth, baseButtonY + ((row - 1) * yStep));
  this.button.size(buttonSize);
  this.button.mousePressed(fn);
}

function Input(row, col, textToDraw, defaultVal, fn){
  this.input = createInput(defaultVal);
  this.input.position((col - 1) * colWidth + colWidth - inputSize - margin, baseButtonY + ((row - 1) * yStep));
  this.input.size(inputSize);
  this.input.input(fn)
  this.drawText = function(){
    text(textToDraw, margin + (col - 1) * colWidth, baseTextY + (row - 1) * yStep);
  }
}


function setupInfo(){
  // Info: line 1
  trainButton = new Button(1, 1, "Start/stop training", trainButtonFn);
  cyclesInput = new Input(1, 2, "Training cycles (#) (0 for inf):", "", cyclesInputFn);
  epochsInput = new Input(1, 3, "Train for epochs (#):", "", epochsInputFn);
  chartsPerEpochInput = new Input(1, 4, "Charts per epoch (#):", "", chartsPerEpochInputFn);
  // Line 2
  testButton = new Button(2, 1, "Test", testButtonFn);
  testInput = new Input(2, 2, "Test charts (#):", "", testInputFn);
  testOnceButton = new Button(2, 4, "Generate and test one chart", testOnceButtonFn);
  // Line 4
  drawChartButton = new Button(4, 4, "Draw the chart?", drawChartButtonFn);
  // Line 5
  saveBrowserButton = new Button(5, 1, "Save model to the browser", saveBrowserButtonFn);
  saveLocalButton = new Button(5, 2, "Save model to the local storage", saveLocalButtonFn);
  loadBrowserButton = new Button(5, 3, "Load model from the browser", loadBrowserButtonFn);
  loadLocalButton = new Button(5, 4, "Load model from the local storage", saveLocalButtonFn);
}

function drawInfo(){
  // Draw over the old info
  fill(backgroundColor);
  noStroke();
  rect(0, 0, canvasWidth, infoHeight)

  fill(0);
  // Info: line 1
  cyclesInput.drawText();
  epochsInput.drawText();
  chartsPerEpochInput.drawText();
  // Line 2
  testInput.drawText();
  // Line 4
  if(training){
    fill(155, 0, 0);
    drawText(4, 1, "Status: TRAINING");
  }else if(testing){
    fill(0, 0, 155);
    drawText(4, 1, "Status: TESTING");
  }else{
    fill(0, 155, 0);
    drawText(4, 1, "Status: IDLE");
  }
  // Line 3
  fill(0);
  drawText(3, 1, "Up or down prediction accuracy (last testing): " + upDownAccuracy + "%");
  drawText(3, 3, "Average prediction error of candle's close, high and low (last testing): " + avgAccuracy + "%");
}

function drawText(row, col, textToDraw){
  text(textToDraw, margin + (col - 1) * colWidth, baseTextY + (row - 1) * yStep);
}


function trainButtonFn(){
  training = !training;
  startTraining = 1;
}

function cyclesInputFn(){
  cycles = parseFloat(this.value());
}

function epochsInputFn(){
  epochs = parseFloat(this.value());
}

function chartsPerEpochInputFn(){
  chartsPerEpoch = parseFloat(this.value());
}

async function saveBrowserButtonFn(){
  const saveResult = await ai.model.save('localstorage://model');
  console.log("Result of the save process: ");
  console.log(saveResult);
}
async function saveLocalButtonFn(){
  const saveResult = await ai.model.save('downloads://model');
  console.log("Result of the save process: ");
  console.log(saveResult);
}

function testButtonFn(){
  testing = !testing;
}

function testInputFn(){
  chartsToTest = parseFloat(this.value());
}

function testOnceButtonFn(){
  ai.test(1);
}

async function loadBrowserButtonFn(){
  ai.model = await tf.loadLayersModel('localstorage://model');
  ai.compileModel();
  console.log("Model was loaded from the browser");
}
async function loadLocalButtonFn(){
  ai.model = await tf.loadLayersModel('http://localhost:8080/model.json');
  ai.compileModel();
  console.log("???");
}

function drawChartButtonFn(){
  drawChartToggle = !drawChartToggle;
  // let col = color(200 - drawChartToggle * 200, drawChartToggle * 200, 0, 255);
  // drawChartButton.button.style('background-color', col);
}
