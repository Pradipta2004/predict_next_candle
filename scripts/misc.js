function convertUnixTime(input){
  let date = new Date(input * 1); // No idea why that * 1 is necessary. It doesn't work without it tho
  let hours = String(date.getHours());
  let minutes = date.getMinutes();
  date = date.toLocaleDateString('en-US'); // To format MM/DD/YYYY
  if(minutes < 10){
    minutes = "0" + String(minutes);
  }else{
    minutes = String(minutes);
  }
  // console.log("Data before returning unix time;" + allData[0][allData[0].length - 100]);
  return date + " " + hours + ":" + minutes; // Time is in format HH:MM
}

function getRandomBetween(min, max){ // call Math.round() to make an integer
  return min + Math.random() * (max - min);
}
