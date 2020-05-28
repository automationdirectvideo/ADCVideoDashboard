/* Helpful utility functions */

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Creates an HTML element given the inner HTML and element type (e.g. "DIV")
function createElement(innerHTML, type) {
  var elem = document.createElement(type);
  elem.innerHTML = innerHTML;
  return elem;
}

// Converts a decimal to a percent with 1 decimal place
function decimalToPercent(decimal) {
  return Math.round(decimal * 1000) / 10;
}

// Get month data for the most recent month with data in the YouTube API which
// is usually the current month
function getCurrMonth() {
  let now = new Date();
  let firstDayOfMonth = undefined;
  let lastDayOfMonth = undefined;
  if (now - firstDayOfMonth > 432000000) {
    // Update for current month
    firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    // Update for previous month
    firstDayOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  }
  let startDate = getYouTubeDateFormat(firstDayOfMonth);
  let endDate = getYouTubeDateFormat(lastDayOfMonth);
  let month = startDate.substr(0, 7);
  return [startDate, endDate, month];
}

// Detects the user browser
// From https://stackoverflow.com/a/9851769
function detectBrowser() {
  // Opera 8.0+
  const isOpera = (!!window.opr && !!opr.addons) || !!window.opera ||
    navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]" 
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
    return p.toString() === "[object SafariRemoteNotification]";
  })(!window['safari'] || (typeof safari !== 'undefined' &&
    safari.pushNotification));

  // Internet Explorer 6-11
  const isIE = /*@cc_on!@*/ false || !!document.documentMode;

  // Edge 20+
  const isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1 - 79
  const isChrome = !!window.chrome && (!!window.chrome.webstore ||
    !!window.chrome.runtime);

  return isChrome ? "Chrome" :
    isEdge ? "Edge" :
    isIE ? "Internet Explorer" :
    isFirefox ? "Firefox" :
    isSafari ? "Safari" :
    isOpera ? "Opera" :
    "Unknown";
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
  duration = duration.replace("PT", "").replace("H", ":").replace("M", ":")
    .replace("S", "");
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

// Checks if current Google user is the AutomationDirect.com account
function isUserADC() {
  const currUserId = gapi.auth2.getAuthInstance().currentUser.get().getId();
  const userIdADC = "106069978891008555071";
  return currUserId == userIdADC;
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

// Adds newChildElem as first child of parentElem
function prependElement(parentElem, newChildElem) {
  parentElem.insertBefore(newChildElem, parentElem.firstChild);
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
  } else if (sheetName == "Logs") {
    return "1zHxNYT1DFlTbulypfFf4jjLZsZAv_6kxh-oNQpuLqEc";
  } else if (sheetName == "Reports") {
    return "1hrUqR3Z3sPhm9zfDnkLkuFMpMZehKKpgFEHxptSNmtY";
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

function retry(fn, maxRetries, timeout) {
  try {
    fn();
  } catch (err) {
    if (maxRetries <= 0) {
      recordError(err, "Function exceeded max retries: ");
      throw err;
    } else {
      window.setTimeout(function () {
        retry(fn, maxRetries - 1, timeout);
      }, timeout);
    }
  }
}

function recordError(err, additionalMessage) {
  const spreadsheetId = sheetNameToId("Logs");
  const range = "Error Log";
  const errTime = new Date().toLocaleString();
  const browser = detectBrowser();
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  let message = "";
  if (additionalMessage) {
    message = additionalMessage;
  }
  if (err.message) {
    message += err.message;
  }
  try {
    // If variable err is thrown from gapi
    let gapiMsg = err.result.error.errors[0].message;
    if (gapiMsg) {
      message += gapiMsg;
    }
  } catch (checkGapiError) {
    // err is not from gapi - do nothing
  }
  console.log(message);
  console.log(err);
  let values = [
    [
      errTime,
      browser,
      isSignedIn,
      message,
      err.name,
      err.stack
    ]
  ];
  if (!err.stack) {
    values[0].push(JSON.stringify(err));
  }
  const body = {
    values: values
  };
  const request = {
    "spreadsheetId": spreadsheetId,
    "range": range,
    "valueInputOption": "RAW",
    "resource": body
  };
  return gapi.client.sheets.spreadsheets.values.append(request)
    .then(response => {
      console.log("Recorded Error to Sheets");
    })
    .catch(gapiError => {
      console.error("Unable to record error to sheets", gapiError);
    });
}

function recordUpdate(message) {
  const spreadsheetId = sheetNameToId("Logs");
  const range = "Update Log";
  const time = new Date().toLocaleString();
  const browser = detectBrowser();
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  let values = [
    [
      time,
      browser,
      isSignedIn,
      message,
    ]
  ];
  console.log(values);
  const body = {
    values: values
  };
  const request = {
    "spreadsheetId": spreadsheetId,
    "range": range,
    "valueInputOption": "RAW",
    "resource": body
  };
  return gapi.client.sheets.spreadsheets.values.append(request)
    .then(response => {
      console.log("Recorded Update");
    })
    .catch(err => {
      const errorMsg = "Unable to record update log to sheets: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}