function Chart(){
  let chart = this;

  // Identification
  this.id = Math.round(Math.random() * (allData.length - 1)); // called id for lack of a better name
  this.chartName = chartNames[this.id];

  // Per chart variables
  this.maxPrice;
  this.minPrice;
  this.maxVol;
  this.priceMultiplier;
  this.volMultiplier;

  // Per chart objects
  this.candle = [];
  this.ema = [];
  this.rsi = [];
  this.visual;

  // A candle object
  function Candle(){
    this.row; // Index of a row in a file
    this.time; // Date&time
    this.data; // Data from a file converted to an array
    this.normData = []; // Contains four prices and a volume (all normalized (within 0 and 1))

    this.height;
    this.leftTopCoords; // [x, y]
    this.wickHeight;
    this.wickTopCoords; // [x, y]
    this.color;

    this.draw = function(candleWidth){
      fill(this.color);
      line(this.wickTopCoords[0], this.wickTopCoords[1], this.wickTopCoords[0], this.wickTopCoords[1] + this.wickHeight);
      rect(this.leftTopCoords[0], this.leftTopCoords[1], candleWidth, this.height);
    }
  }

  // Randomly select a row in a file, get the data and normalize it
  this.getNewCandles = function(){
    // Index of the candle to be predicted is right after the last historical one
    let candleToPredict = historyLen;
    // Create the candles
    for(let i = 0; i < historyLen + futureLen; i++){
      this.candle[i] = new Candle();
    }
    // Pick a random line from the file
    this.candle[candleToPredict].row = Math.round(getRandomBetween(historyLen + 1, allData[this.id].length - futureLen));
    // this.candle[candleToPredict].row = allData[this.id].length - historyLen - futureLen - 38;
    // Initialize the candles
    this.getCandleData(candleToPredict);
    // Get min/max price of the chart and max volume
    this.getMinMax();
    // Calculate the multipliers
    this.getPriceAndVolMultipliers();

    // Get indicator data
    for(let i = 0; i < emaTimeframes.length; i++){
      for(let j = 0; j < emaSamples; j++){
        this.ema.push(ema(this.candle, emaTimeframes[i], this.candle.length - emaSamples + j));
      }
    }
    for(let i = 0; i < rsiTimeframes.length; i++){
      this.rsi.push(rsi(this.candle, rsiTimeframes[i], this.candle.length - 1));
    }
    for(let i = 0; i < 25; i++){
      // console.log(ema(this.candle, 54, this.candle.length - 1 - i));
      // console.log(rsi(this.candle, 14, this.candle.length - 1 - i));
    }

    // Normalize the candle data
    this.normalizeData();
  }

  // Get candle data from the file's row
  this.getCandleData = function(candleToPredict){
    for(let i = 0; i < historyLen + futureLen; i++){
      this.candle[i].row = this.candle[candleToPredict].row - historyLen - futureLen + i;
      this.candle[i].data = allData[this.id][this.candle[i].row];
      this.candle[i].time = convertUnixTime(this.candle[i].data[cols.time]);
      for(let j = 1; j < this.candle[i].data.length; j++){
        this.candle[i].data[j] = parseFloat(this.candle[i].data[j]);
      }
    }
  }

  // Get min/max price of the chart and max volume
  this.getMinMax = function(){
    this.minPrice = this.candle[0].data[cols.low];
    this.maxPrice = this.candle[0].data[cols.high];
    this.maxVol = this.candle[0].data[cols.volume];
    for(let i = 0; i < historyLen + futureLen; i++){
      if(this.candle[i].data[cols.low] < this.minPrice){
        this.minPrice = this.candle[i].data[cols.low];
      }
      if(this.candle[i].data[cols.high] > this.maxPrice){
        this.maxPrice = this.candle[i].data[cols.high];
      }
      if(this.candle[i].data[cols.volume] > this.maxVol){
        this.maxVol = this.candle[i].data[cols.volume];
      }
    }
  }

  // Calculate multipliers - numbers to multiply the data by to normalize it
  this.getPriceAndVolMultipliers = function(){
    this.priceMultiplier = 1 / (this.maxPrice - this.minPrice);
    this.volMultiplier = 1 / this.maxVol;
  }

  // Normalize the candle data
  this.normalizeData = function(){
    for(let i = 0; i < historyLen + futureLen; i++){
      for(let j = 1; j < 5; j++){
        this.candle[i].normData[j - 1] = (this.candle[i].data[j] - this.minPrice) * this.priceMultiplier;
      }
      this.candle[i].normData[cols.volume - 1] = this.candle[i].data[cols.volume] * this.volMultiplier;
    }
    for(let i = 0; i < this.rsi.length; i++){
      this.rsi[i] /= 100;
    }
    for(let i = 0; i < this.ema.length; i++){
      this.ema[i] = (this.ema[i] - this.minPrice) * this.priceMultiplier;
    }
  }

  this.addNewCandle = function(data){
    this.candle[this.candle.length] = new Candle();
    this.candle[this.candle.length - 1].data = data;
  }

  this.createVisual = function(){
    this.visual = new Visual();
  }

  function Visual(){
    // Settings
    const lineColor = 220;
    const cursorTextColor = [0, 0, 150];
    const minCandleHeight = 2; // Minimal height of one candle
    const priceLegendItems = 5; // How many horizontal lines (prices) to draw as the price legend
    const timeLegendItems = 5; // How many vertical lines (dates) to draw as the date&time legend
    const candleGap = 1;
    const candleWidth = chartWidth / (historyLen + futureLen); // Width of a candle including the gap
    const realCandleWidth = candleWidth - (2 * candleGap); // ... excluding the gap

    let visual = this;
    this.legend;

    this.drawChart = function(){
      // Color of each candle
      this.getCandleColor();
      // Get the coordinates of the candles on the canvas
      this.getCandleCoords();
      // Create a new legend
      this.legend = new Legend();
      // Draw price and date&time legend (text and lines)
      this.legend.drawLegend();
      // Draw the candles onto the canvas
      stroke(0);
      for(let i = 0; i < chart.candle.length; i++){
        chart.candle[i].draw(realCandleWidth); // - 2 to create a gap between candles
      }
      // Name of the chart
      textSize(16);
      fill(0);
      text(chart.chartName, chartMargin + 10, infoHeight + 20);
      textSize(12);
    }

    // Get the colors of the candles
    this.getCandleColor = function(){
      for(let i = 0; i < historyLen + futureLen; i++){
        if(chart.candle[i].data[cols.open] < chart.candle[i].data[cols.close]){
          chart.candle[i].color = [0, 255, 0];
        }else if(chart.candle[i].data[cols.open] > chart.candle[i].data[cols.close]){
          chart.candle[i].color = [255, 0, 0];
        }else{
          chart.candle[i].color = [255, 255, 255];
        }
        if(i == 101){
          console.log(chart.candle[101].color);
        }
      }
    }

    // Get coordinates of the candle, wick and their heights
    this.getCandleCoords = function(){
      let yMultiplier = chartHeight / (chart.maxPrice - chart.minPrice);
      let x;
      let y;
      for(let i = 0; i < chart.candle.length; i++){ // For all candles
        // Get candle height
        chart.candle[i].height = Math.abs(chart.candle[i].data[cols.open] - chart.candle[i].data[cols.close]) * yMultiplier;
        if(chart.candle[i].height < minCandleHeight){
          chart.candle[i].height = minCandleHeight;
        }

        // Get candle coords (of it's left top corner)
        x = Math.round(candleWidth * i) + 1; // +1 for the gap between candles
        if(chart.candle[i].data[cols.close] > chart.candle[i].data[cols.open]){
          y = Math.round((chart.candle[i].data[cols.close] - chart.minPrice) * yMultiplier);
        }else{
          y = Math.round((chart.candle[i].data[cols.open] - chart.minPrice) * yMultiplier);
        }
        chart.candle[i].leftTopCoords = [x + chartMargin, chartHeight - y + chartMargin + infoHeight];

        // Get wick height
        chart.candle[i].wickHeight = (chart.candle[i].data[cols.high] - chart.candle[i].data[cols.low]) * yMultiplier;

        // Get wick coordinates
        x += candleWidth / 2;
        y = Math.round((chart.candle[i].data[cols.high] - chart.minPrice) * yMultiplier);
        chart.candle[i].wickTopCoords = [x + chartMargin - 1, chartHeight - y + chartMargin + infoHeight];
      }
    }

    function Legend(){
      let legend = this;
 
      this.drawCursor = function(x, y){
        let candleIndex = Math.round((x - chartMargin) / candleWidth);
        if(candleIndex < historyLen + futureLen){
          let priceMultiplier = (chart.maxPrice - chart.minPrice) / chartHeight;

          // Draw a rectangle behind the price and then the price
          fill(backgroundColor);
          noStroke();
          rect(canvasWidth - priceLegendWidth, y - 16, priceLegendWidth, 16);
          fill(cursorTextColor);
          this.drawPrice(y, (chartHeight - y + chartMargin + infoHeight) * priceMultiplier + chart.minPrice);

          //Draw a rectangle behind the date&time and then the date&time
          fill(backgroundColor);
          noStroke();
          rect(x, chartHeight + chartMargin + infoHeight, 125, 16);
          fill(cursorTextColor);
          this.drawTime(candleIndex);
        }
      }

      this.drawLegend = function(){
        this.drawPriceLegend();
        this.drawTimeLegend();
      }
  
      this.drawPriceLegend = function(){
        let priceMultiplier = (chart.maxPrice - chart.minPrice) / chartHeight;
        fill(0);
        for(let y = 0; y <= chartHeight ; y += chartHeight / (priceLegendItems - 1)){ // - 1 because one will be at the start and at the end
          this.drawPrice(y + chartMargin + infoHeight, (chartHeight - y) * priceMultiplier + chart.minPrice);
        }
      }
  
      this.drawPrice = function(y, price){
        stroke(lineColor);
        line(0, y, canvasWidth, y);
        noStroke();
        textSize(12);
        text(price, canvasWidth - priceLegendWidth + 5, y - 5); // + 5 for some offset, - 5 so the number is above the line
      }
  
      this.drawTimeLegend = function(){
        let totalCandles = historyLen + futureLen;
        let step = totalCandles / timeLegendItems;
        fill(0);
        for(let x = 0; x < totalCandles; x = Math.round(x + step)){
          this.drawTime(x);
        }
      }
  
      this.drawTime = function(candleIndex){
        stroke(lineColor);
        strokeWeight(1);
        let leftTop = chart.candle[candleIndex].leftTopCoords[0] - 1; // -1 to draw it more in the center
        let halfCandleWidth = candleWidth / 2;
        line(leftTop + halfCandleWidth, infoHeight, leftTop + halfCandleWidth, canvasHeight + infoHeight);
        noStroke();
        textSize(12)
        text(chart.candle[candleIndex].time, leftTop + halfCandleWidth + 5, chartHeight + chartMargin + dateLegendHeight + infoHeight); // + 5 for some offset
      }
    }
  }
}
