# Brief

As I slowly continue studying artificial intelligence, I often catch myself
wondering if it is possible to train a neural network to predict market prices.
Plan is to only use limited price history and maybe some indicators. There are
huge amounts of data freely available on the internet to train the network, so
that's convenient. Also, this will probably be written in JavaScript using the
p5.js library and either TensorFlow.js or ml5 libraries, so it will run in the
browser.

Note that this project might not be finished. Ever. It's just something I have
wanted to try for a while now. However, if everything goes well with
TensorFlow.js and maybe if I reach something like 70-80% accuracy (of 
predicting if the next candle's close price will be higher or lower than the 
previous one), I might try essentially the same thing in python using 
TensorFlow.

Update: This does not seem to work, so I am abandoning this project. I might
get back to this in the future, but I probably won't. Note that this is not
finished (the program works, but needs refactoring and since the accuracy is
horrible, I won't waste my time).

If you're interested in knowing the accuracy (of predicting if the price goes
up or down): 
After training for about an hour (the loss hasn't really decreased in a while,
it just oscilates), testing results of 10000 charts per test: 
53.32%, 
53.87%, 
51.25%, 
54.12%, 
53.82%. 
This is actually not that bad, but I can't call it a success.

# Screenshots

![Alt text](./img/screenshot.png?raw=true "Screenshot of the training process")

# Data

Data is expected in csv format, these are the columns (dates are in unix time):
Open time, open price, high price, low price, close price, volume, close time

I myself will be using data from binance and for that I've written a little
script: https://github.com/sktedro/binance_market_data_downloader

It is by default in the data/binance/binance_market_data_downloader folder and 
downloads data to data/binance/data folder. You can change where should the
application search for the data and what pairs and intervals should it learn
from in 'scripts/csvReader.js'

# More info

First I tried giving the AI 100 historical candle data (open, high, low, close
and volume) and had it to predict the next candle (open, high, low, close).
That didn't really seem to work, but I didn't expect it to without the
indicators.
I added RSI and EMA indicators and tried different outputs. This final version
predicts the % change of the future candle, but it's still not accurate at all.
I wanted it to at least predict if the candle will be 'green or red' with 60%
accuracy or more. That did not happen.
Of course, the AI could use more indicators, it should know the timeframe of
the chart it is trying to predict, volatility and whatnot... However, since
this doesn't seem to work at all, adding those would not help.

When training or testing, the first chart of the batch is drawn on the site and
the expected (true) output and predicted (by AI) output is logged to the
console. Also, the last green/red candle on the chart is the one the AI is
trying to predict and the blue one shows what the AI predicted it to look like
(representing only the % change, not actual candle values).

To train, it is enough to push the button "Start/stop training", which starts
training until it is stopped. The default settings are 100 epochs and 10000
charts per epoch. You can save your trained model to your browser and load it
back even after restarting your computer. No idea how that works, though.

For information about the training process, watch the console.

Since this is not working, I'm not going to clean it up too much. The 'Draw the
chart?' button doesn't seem to work, I can't remember why. Also, I couldn't get
'Load model from the local storage' to work. The 'Status' barely works as well.
The 'Average prediction error...' should be ignored.

# Credits and sources

TensorFlow.js: https://www.tensorflow.org/js

p5.js: https://p5js.org/
