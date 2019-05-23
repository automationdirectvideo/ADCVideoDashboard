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
  var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = date.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  return today;
}      

// Add commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}