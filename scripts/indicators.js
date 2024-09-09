const emaTimeframes = [5, 9, 12, 21, 26, 54/*, 200*/]; 
const emaSamples = 5; // 5 samples for one timeframe (like data for 5 candles)
const rsiTimeframes = [5, 14, 20, 50]; // 1 sample for one timeframe
const candleSamples = 50;

/*
 * Indicators:
 *
 * MACD: 5?
 * Stoch (5, 3, 3): 1
 * Stoch (14, 7, 3): 1
 * Stoch (21, 7, 7): 1
 * Volatility: 2 (average percent change - candle open to candle close & candle low to candle high)
 * Ichimoku: ??
 * Bollinger bands (20, 2): 1 ??
 * OBV: ??
 */

// Tried to make it the same as on tradingview, but could not.. Hope it's good
// enough
function ema(candle, timeframe, candleIndex){
  const multiplier = 2 / (1 + timeframe);

  let prevEma = candle[candleIndex - timeframe + 1].data[cols.close];
  let ema;
  for(let i = candleIndex - timeframe + 2; i < candleIndex + 1; i++){
    ema = (candle[i].data[cols.close] - prevEma) * multiplier + prevEma;
    prevEma = ema;
  }

  return ema;
}

// Tried to make it the same as on tradingview, but could not.. Hope it's good
// enough
function rsi(candle, timeframe, candleIndex){
  let input = []; 
  for(let i = 0; i < timeframe; i++){
    input[i] = candle[candleIndex - timeframe + i + 1].data[cols.close];
  }

  let up = 0;
  let down = 0;

  for(let i = 0; i < timeframe; ++i){
    up += input[i] > input[i - 1] ? input[i] - input[i - 1] : 0;
    down += input[i] < input[i - 1] ? input[i - 1] - input[i] : 0;
  }

  up /= timeframe;
  if(up == 0){
    up = Number.MIN_VALUE;
  }
  down /= timeframe;

  return 100.0 * (up / (up + down));
}

function macd(candle){

}

function stoch(candle){

}
