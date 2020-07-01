/**
 * @fileoverview Useful utility functions that can be used by many pages.
 */

/**
 * Capitalize the first letter of a string
 *
 * @param {String} string String to capitalize
 * @returns {String} Original string with first letter capitalized
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Creates an HTML element given the inner HTML and element type (e.g. "DIV")
 *
 * @param {String} innerHTML The inner HTML of the desired element
 * @param {String} type The HTML tag of the desired element
 * @returns {HTMLElement} The desired element
 */
function createElement(innerHTML, type) {
  const elem = document.createElement(type);
  elem.innerHTML = innerHTML;
  return elem;
}

/**
 * Get a date in the form MM/DD/YYYY
 *
 * @param {String|Date} date A `Date`
 * @returns {String} The `date` written as MM/DD/YYYY
 */
function dateToMMDDYYYY(date) {
  const day = new Date(date);
  const dd = String(day.getUTCDate()).padStart(2, "0");
  const mm = String(day.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = day.getUTCFullYear();
  return mm + "/" + dd + "/" + yyyy;
}

/**
 * Converts a decimal to a percent with 1 decimal place
 *
 * @param {Number} decimal A float number to turn into a percent
 * @returns {Number} The same number times 100 with one decimal place precision
 */
function decimalToPercent(decimal) {
  return Math.round(decimal * 1000) / 10;
}

/**
 * Delays script execution by `milliseconds`
 *
 * @param {Number} milliseconds The number of milliseconds to delay
 * @returns {Promise} A default promise that resolves after the provided number
 *  number of milliseconds
 */
function delay(milliseconds) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Detects the user browser. Taken from
 * [StackOverflow](https://stackoverflow.com/a/9851769)
 *
 * @returns {String} The user's browser
 */
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

/**
 * Creates a helper object for reading from a Google Sheet
 *
 * @param {Array} sheet The body from a Google Sheet API response
 * @returns {Object} An object with keys as spreadsheet column titles and value
 *    is index in the sheet that corresponds to that column
 */
function getColumnHeaders(sheet) {
  let columns = {};
  const columnHeaders = sheet[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  return columns;
}

/**
 * Gets the theme of a dashboard from settings
 *
 * @param {String} dashboardId The ID of the desired dashboard
 * @returns {String} The theme of the dashboard
 */
function getCurrentDashboardTheme(dashboardId) {
  const currentSettings = lsGet("settings");
  let theme = "";
  let index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == dashboardId) {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  return theme;
}

/**
 * Get month data for the most recent month with data in the YouTube API which
 * is usually the current month
 *
 * @returns {Array} First and last day of the month (YYYY-MM-DD) and the month
 *    (YYYY-MM)
 */
function getCurrMonth() {
  const now = new Date();
  let firstDayOfMonth = undefined;
  let lastDayOfMonth = undefined;
  if (now.getDate() >= 5) {
    // Update for current month
    firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    // Update for previous month
    firstDayOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  }
  const startDate = getYouTubeDateFormat(firstDayOfMonth);
  const endDate = getYouTubeDateFormat(lastDayOfMonth);
  const month = startDate.substr(0, 7);
  return [startDate, endDate, month];
}

/**
 * Get date from `numDaysAgo` from today in the form YYYY-MM-DD
 *
 * @param {Number} numDaysAgo An integer
 * @returns {String} The desired day written as YYYY-MM-DD
 */
function getDateFromDaysAgo(numDaysAgo) {
  const today = new Date();
  var priorDate = new Date().setDate(today.getDate() - numDaysAgo);
  priorDate = new Date(priorDate);
  return getYouTubeDateFormat(priorDate);
}

/**
 * Gets a list of all months as "YYYY-MM" between the provided month and the
 * current month inclusive
 *
 * @param {Number} year The starting year
 * @param {Number} month The ending month (1-12)
 * @returns {Array<String>} List of months
 */
function getMonthsSince(year, month) {
  let monthIter = new Date(year, month - 1);
  monthIter.setDate(1);
  const endDate = new Date();
  let months = [];
  while (endDate - monthIter >= 0) {
    months.push(getYouTubeDateFormat(monthIter).substr(0,7));
    monthIter = new Date(monthIter.getFullYear(), monthIter.getMonth() + 1);
  }
  return months;
}

/**
 * Get the number of days from today to the `oldDate` in the form YYYY-MM-DD
 *
 * @param {String|Date} oldDate A date from the past
 * @returns {Number} The number of days between today and the `oldDate`
 */
function getNumberDaysSince(oldDate) {
  const now = new Date();
  const old = new Date(oldDate);
  const diff = Math.floor((now - old) / 86400000);
  return diff;
}

/**
 * Get today's date in the form YYYY-MM-DD
 *
 * @returns {String} Today's date written as YYYY-MM-DD
 */
function getTodaysDate() {
  return getYouTubeDateFormat(new Date());
}

/**
 * Get a date in the form YYYY-MM-DD
 *
 * @param {String|Date} date A `Date`
 * @returns {String} The `date` written as YYYY-MM-DD
 */
function getYouTubeDateFormat(date) {
  const day = new Date(date);
  const dd = String(day.getDate()).padStart(2, "0");
  const mm = String(day.getMonth() + 1).padStart(2, "0");
  const yyyy = day.getFullYear();
  const today = yyyy + "-" + mm + "-" + dd;
  return today;
}

/**
 * Converts ISO-8601 duration to seconds (e.g. PT5M25S -> 325 seconds)
 *
 * @param {String} duration A duration in ISO-8601 format
 * @returns {Number} The duration in seconds
 */
function isoDurationToSeconds(duration) {
  duration = duration.replace("PT", "").replace("H", ":").replace("M", ":")
    .replace("S", "");
  const durationArr = duration.split(":");
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

/**
 * Checks if current Google user is the AutomationDirect.com account
 *
 * @returns {Boolean} True if user is ADC. False otherwise
 */
function isUserADC() {
  const currUserId = gapi.auth2.getAuthInstance().currentUser.get().getId();
  const userIdADC = "106069978891008555071";
  return currUserId == userIdADC;
}

/**
 * Gets an item from local storage
 *
 * @param {String} name Variable name
 * @param {Boolean} parse Whether JSON.parse should be applied to the variable
 *    before returning it. Defaults to true
 * @returns {*} Variable from local storage with name `name`
 */
function lsGet(name, parse) {
  parse = parse || true;
  if (parse) {
    return JSON.parse(localStorage.getItem(name));
  } else {
    return localStorage.getItem(name);
  }
}

/**
 * Saves an item to local storage
 *
 * @param {String} name Variable name
 * @param {*} value The variable itself
 * @param {Boolean} stringify Whether JSON.stringify should be applied to the
 *    variable before saving it. Defaults to true
 */
function lsSet(name, value, stringify) {
  stringify = stringify || true;
  if (stringify) {
    localStorage.setItem(name, JSON.stringify(value));
  } else {
    localStorage.setItem(name, value);
  }
}

/**
 * Get number of months between two dates (ignoring the day of the month)
 *
 * @param {Date} dateFrom Starting date
 * @param {Date} dateTo Ending date
 * @returns {Number} The number of months between `dateFrom` and `dateTo`
 */
function monthDiff(dateFrom, dateTo) {
  return dateTo.getMonth() - dateFrom.getMonth() +
    (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

/**
 * Add commas to number for thousands, millions, etc.
 *
 * @param {Number} num An integer
 * @returns {String} The number as String with commas every three digits
 */
function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Adds `newChildElem` as first child of `parentElem`
 *
 * @param {HTMLElement} parentElem The element to add to
 * @param {HTMLElement} newChildElem The element to be added
 */
function prependElement(parentElem, newChildElem) {
  parentElem.insertBefore(newChildElem, parentElem.firstChild);
}

/**
 * Behaves like `Float.toFixed(numDigits)` but removes trailing zeros after the
 * decimal
 *
 * @param {Number} float The number to round
 * @param {Number} numDigits The number of digits after the decimal to round to
 * @returns {Number} `float` rounded to the desired number of digits without
 *    trailing zeros
 */
function roundTo(float, numDigits) {
  return +float.toFixed(numDigits);
}

/**
 * Converts seconds to duration in the form M:SS
 *
 * @param {Number} seconds An integer
 * @returns {String} The number of seconds written as M:SS
 */
function secondsToDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const durationSeconds = ('00' + seconds % 60).substr(-2);
  return minutes + ":" + durationSeconds;
}

/**
 * Converts seconds to duration in the form "H hrs M min"
 *
 * @param {Number} seconds An integer
 * @returns {String} The number of seconds written as "H hrs M min"
 */
function secondsToDurationHrsMin(seconds) {
  let minutes = Math.floor(seconds / 60) % 60;
  let hours = Math.floor(seconds / 3600);
  if (minutes == 0) {
    return `${hours} hrs`;
  } else {
    return `${hours} hrs ${minutes} min`;
  }
}

/**
 * Converts seconds to duration in one of the following forms:
 * - "H hrs M min"
 * - "M min S sec"
 * - "S sec"
 *
 * @param {*} seconds An integer
 * @returns The number of seconds written with labels
 */
function secondsToDurationLabeled(seconds) {
  if (seconds >= 3600) {
    return secondsToDurationHrsMin(seconds);
  } else if (seconds >= 60) {
    return secondsToDurationMinSec(seconds);
  } else {
    return seconds + " sec";
  }
}

/**
 * Converts seconds to duration in the form "M min S sec"
 *
 * @param {Number} seconds An integer
 * @returns {String} The number of seconds written as "M min S sec"
 */
function secondsToDurationMinSec(seconds) {
  let minutes = Math.floor(seconds / 60);
  let durationSeconds = ("00" + seconds % 60).substr(-2);
  if (durationSeconds == 0) {
    return `${minutes} min`;
  } else {
    return `${minutes} min ${durationSeconds} sec`;
  }
}

/**
 * Converts the spreadsheet's common name to the Google Sheet ID
 *
 * @param {String} sheetName The sheet's common name
 * @returns {String} The sheet's ID
 */
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

/**
 * Checks if the YouTube thumbnail is a 404 image and replaces it with a
 * different quality thumbnail
 *
 * @param {Element} e The JQuery img object of the thumbnail
 * @param {Boolean} highQuality Decides the backup quality of the thumbnail
 */
function thumbnailCheck(e, highQuality) {
  const thumbnailURL = e.attr("src");
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

/**
 * Retries the function `fn` on error `maxRetries` number of times with a
 * `timeout` millisecond timeout
 *
 * @param {Function} fn The function to retry upon error
 * @param {Number} maxRetries The maximum number of times to retry the function
 * @param {Number} timeout The integer timeout in milliseconds between failed
 *    attempts
 */
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

/**
 * Records an error to the Error Log Google Sheet
 *
 * @param {Error} err The caught error
 * @param {String} additionalMessage An extra message to give the error more
 *    context in the log
 * @returns {Promise} Status update
 */
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
    const gapiMsg = err.result.error.errors[0].message;
    if (gapiMsg) {
      message += gapiMsg;
    }
  } catch (checkGapiError) {
    try {
      // Another error message format from a gapi error
      const gapiMsg = err.result.error.message;
      if (gapiMsg) {
        message += gapiMsg;
      }
    } catch (checkGapiError2) {
      // err is not from gapi - do nothing
    }
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
    "range": range,
    "resource": body,
    "spreadsheetId": spreadsheetId,
    "valueInputOption": "RAW"
  };
  return gapi.client.sheets.spreadsheets.values.append(request)
    .then(response => {
      console.log("Recorded Error to Sheets");
    })
    .catch(gapiError => {
      console.error("Unable to record error to sheets", gapiError);
    });
}

/**
 * Record an update to the Update Log Google Sheet
 *
 * @param {String} message The update message to log
 * @returns {Promise} Status update
 */
function recordUpdate(message) {
  const spreadsheetId = sheetNameToId("Logs");
  const range = "Update Log";
  const time = new Date().toLocaleString();
  const browser = detectBrowser();
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  const values = [
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
    "range": range,
    "resource": body,
    "spreadsheetId": spreadsheetId,
    "valueInputOption": "RAW"
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