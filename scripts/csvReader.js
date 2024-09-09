// Data is expected in: data/binance/data/PAIR/PAIR-INTERVAL.csv

function getData(){
  let data = [[[]]];
  const path = "data/binance/data"; // Path with the data
  const pairs = [
    "BTCUSDT", 
    "BNBUSDT", 
    "ETHUSDT",
    "ADAUSDT",
    "NEOUSDT",
    "XRPUSDT",
    "LTCUSDT",
    "ETCUSDT",
    "ADABTC", 
    "BNBBTC", 
    "ETHBTC", 
    "XRPBTC", 
    "XLMBTC",
    "NEOBTC", 
    "DGBBTC",
    "SCBTC",
    "LTCBTC",
    "BCHBTC",
    "ETCBTC",
    "XMRBTC"
  ]; // Pairs to train on
  const intervals = [
    "15m", 
    "30m",
    "1h", 
    "4h",
    "1d"
  ]; // Intervals to train on
  let charts = pairs.length * intervals.length;

  for(let i = 0; i < pairs.length; i++){
    for(let j = 0; j < intervals.length; j++){
      data[--charts] = readData(path + "/" + pairs[i] + "/" + pairs[i] + "-" + intervals[j] + ".csv");
      chartNames[charts] = pairs[i] + " - " + intervals[j];
      console.log("Chart " + pairs[i] + "-" + intervals[j] + " loaded.");
    }
  }
  return data;
}

function readData(path){
  let output = [[]];
  $.ajax({
    type: "GET",
    url: path,
    dataType: "text",
    async: false,
    success: function(data){
      let lines = data.split(/\r\n|\n/);
      for(let i = 0; i < lines.length; i++){
        output[i] = lines[i].split(',');
      }
    }
  });
  return output;
}

function checkData(){
  if(allData.length < 1){
    console.log("ERROR: No data loaded");
    return 1;
  }
  for(let i = 0; i < allData.length; i++){
    if(allData[i].length < historyLen + futureLen){
      console.log("ERROR: Not enough data in chart " + chartNames[i]);
      return 2;
    }
  }
  return 0;
}
