/* Helpful utility functions */

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

// Searches input text for URLs and returns list of found URLs
function searchForURLs(inputText) {
  var findURLs = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  var links = [];
  var match;
  do {
      match = findURLs.exec(inputText);
      if (match) {
          links.push(match[0]);
      }
  } while (match);
  return links;
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

function sheetNameToId(sheetName) {
  if (sheetName == "Stats") {
    return "1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ";
  } else if (sheetName == "Input Data") {
    return "1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg";
  } else {
    return "";
  }
}

// Reloads thumbnail with lower quality if max resolution thumbnail throws 404
function thumbnailCheck(e, highQuality) {
  var thumbnailURL = e.attr("src");
  if (e[0].naturalWidth == 120 && e[0].naturalHeight == 90) {
    if (highQuality === true) {
      // Keeps higher resolution but adds black bars across top and bottom
      e.attr("src", thumbnailURL.replace("maxresdefault", "hqdefault"));
    } else {
      // Lower resolution but no black bars
      e.attr("src", thumbnailURL.replace("maxresdefault", "mqdefault"));
    }
  }
}

/* Error Handling Functions */

function retry(fn, maxRetries) {
  try {
    fn();
  } catch (err) {
    if (maxRetries <= 0) {
      throw err;
    } else {
      window.setTimeout(function () {
        retry(fn, maxRetries - 1);
      }, 1500);
    }
  }
}