const chartMargin = 25;

const margin = 10;
const baseButtonY = 10;
const buttonHeight = 19;
const yStep = buttonHeight + margin;
const inputSize = 50;
const baseTextY = 23;

const canvasWidth = 1000;

const colWidth = (canvasWidth) / 4;
const buttonSize = colWidth - 2 * margin;

const priceLegendWidth = 100;
const chartWidth = canvasWidth - chartMargin - priceLegendWidth;

const canvasHeight = 600;
const infoHeight = 2 * margin + 5 * (yStep + margin);
const indicatorsHeight = 0;
const dateLegendHeight = 15;
const chartHeight = canvasHeight - chartMargin - indicatorsHeight - dateLegendHeight - infoHeight;

const backgroundColor = 255;

// Columns in the data file - enumeration
const cols = {
  time: 0,
  open: 1,
  high: 2,
  low: 3,
  close: 4,
  volume: 5
};

let allData = [[[]]]; // All loaded data in one 3D array

/*
 * TODO:
 * Automatically test after a training cycle
 */

let drawChartToggle = 1;

let training = 0;
let startTraining = 0;

let cycles = 0;
let cyclesTrained = 0;

let epochs = 50;
let chartsPerEpoch = 10000;

let testing = 0;
let chartsToTest = 1000;


let chartNames = [];

let chart = [];
let ai;

function setup(){
  frameRate(30);

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position(0, 0);

  textSize(12);

  // Get all market data
  allData = getData(); 
  if(checkData()){ 
    // Don't do anything if there's been an error
    noLoop();
  }else{
    // Get one new chart
    getNewCharts(1);
    // Create a new AI with a new model
    ai = new Ai();
    ai.newModel();
  }

  // Draw the buttons and inputs
  setupInfo();
}

function draw(){
  if(drawChartToggle){
    background(backgroundColor);
  }

  // Draw the info text
  drawInfo();

  if(startTraining){
    startTraining = 0;
    ai.train();
  }

  if(testing){
    ai.test(chartsToTest);
  }

  if(drawChartToggle){
    chart[0].visual.drawChart();
    // If the mouse is on the chart, draw a cursor
    if(mouseY > chartMargin + infoHeight && mouseY < chartHeight + chartMargin + infoHeight && mouseX < chartWidth + chartMargin && mouseX > chartMargin){
      chart[0].visual.legend.drawCursor(mouseX, mouseY);
    }
  }
}

function getNewCharts(amount){
  chart = [];
  for(let i = 0; i < amount; i++){
    chart[i] = new Chart();
    chart[i].getNewCandles();
  }
  if(drawChartToggle){
    chart[0].createVisual(); // Get the first chart ready to draw
  }
}
