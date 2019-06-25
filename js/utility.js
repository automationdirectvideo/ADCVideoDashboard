// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Converts a decimal to a percent with 1 decimal place
function decimalToPercent(decimal) {
  return Math.round(decimal * 1000) / 10;
}

// Get date from numDaysAgo from today in the form YYYY-MM-DD
function getDateFromDaysAgo(numDaysAgo) {
  var today = new Date();
  var priorDate = new Date().setDate(today.getDate() - numDaysAgo);
  priorDate = new Date(priorDate);
  return getYouTubeDateFormat(priorDate);
}

// Get date from first day of current month in the form YYYY-MM-DD
function getFirstDayOfMonth() {
  var today = new Date();
  var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return getYouTubeDateFormat(firstDay);
}

// Get today's date in the form YYYY-MM-DD
function getTodaysDate() {
  return getYouTubeDateFormat(new Date());
}    

// Get a date in the form YYYY-MM-DD
function getYouTubeDateFormat(date) {
  var dd = String(date.getDate()).padStart(2, "0");
  var mm = String(date.getMonth() + 1).padStart(2, "0");
  var yyyy = date.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  return today;
}      

// Converts ISO-8601 duration to seconds (e.g. PT5M25S -> 325 seconds)
function isoDurationToSeconds(duration) {
  duration = duration.replace("PT","").replace("H",":").replace("M",":")
      .replace("S","");
  durationArr = duration.split(":");
  let seconds;
  if (durationArr.length == 3) {
    seconds = Number(durationArr[0]) * 3600 + 
        Number(durationArr[1]) * 60 + Number(durationArr[2]);
  } else if (durationArr.length == 2) {
    seconds = Number(durationArr[0]) * 60 + Number(durationArr[1]);
  } else {
    seconds = duration;
  }
  return seconds;
}

// Get number of months between two dates (ignoring the day of the month)
function monthDiff(dateFrom, dateTo) {
  return dateTo.getMonth() - dateFrom.getMonth() + 
    (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
 }

// Add commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Converts seconds to duration in the form M:SS
function secondsToDuration(seconds) {
  let minutes = Math.floor(seconds / 60);
  let durationSeconds = ('00' + seconds % 60).substr(-2);
  return minutes + ":" + durationSeconds;
}

function secondsToDurationMinSec(seconds) {
  let minutes = Math.floor(seconds / 60);
  let durationSeconds = ("00" + seconds % 60).substr(-2);
  return minutes + " min " + durationSeconds + " sec";
}