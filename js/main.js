// Calls the Analytics API with a request and returns response to callback
function callAnalyticsAPI(request, source, callback) {
  gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Analytics API call error", err);
    });
}

// Calls the Data API for channels with a request and returns response to 
// callback
function callDataAPIChannels(request, source, callback) {
  gapi.client.youtube.channels.list(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Data API call error", err);
    });
}

// Calls the Data API for playlists with a request and returns response to 
// callback
function callDataAPIPlaylists(request, source, callback) {
  gapi.client.youtube.playlistItems.list(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    });
}

// Tests calls to the API
function testAPICalls() {
  var todayDate = getTodaysDate();
  var thirtyDaysAgo = getDateFromDaysAgo(30);
  // requestBasicVideoStats(joinDate, todayDate);
  requestImpressions("2019-04-01", "2019-04-30");
  // requestMostWatchedVideos(thirtyDaysAgo, todayDate, 25);
  // requestSubscribersGained(joinDate, todayDate);
  // requestVideoViewsByTrafficSource(thirtyDaysAgo, todayDate, "mXcDYoz1iMo");
  // requestViewsByDeviceType(joinDate, todayDate);
  // requestViewsByTrafficSource(joinDate, todayDate);
}

// Display channel data
function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;

}

function carouselNext() {
  $(".carousel").carousel("next");
}

function carouselPrev() {
  $(".carousel").carousel("prev");
}

function goToCarouselItem(index) {
  $(".carousel").carousel(index);
}

// Get current settings
if (!localStorage.getItem("settings")) {
  localStorage.setItem("settings", JSON.stringify(defaultSettings));
}
var currentSettings = JSON.parse(localStorage.getItem("settings"));
console.log("Current Settings: ", currentSettings);

// Initialize carousel
var dashboardCarouselInner = 
    document.getElementById("dashboard-carousel-inner");
const cycleSpeed = currentSettings.cycleSpeed * 1000;
$(".carousel").carousel({
  interval: cycleSpeed
});

// Set order of dashboards
var enabledOrder = new Array(currentSettings.numEnabled);
for (var i = 0; i < currentSettings.dashboards.length; i++) {
  var dashboard = currentSettings.dashboards[i];
  if (dashboard.index >= 0) {
    enabledOrder.splice(dashboard.index, 1, dashboard.name);
  }
}
for (var i = 0; i < enabledOrder.length; i++) {
  var dashboardItem = document.getElementById(enabledOrder[i]);
  if (i == 0) {
    dashboardItem.classList.add("active");
  }
  dashboardItem.remove();
  dashboardCarouselInner.appendChild(dashboardItem);
}

document.addEventListener("keydown", function (e) {
  console.log("Keypress: ", e.key);
  if (e.key == "ArrowLeft") {
    carouselPrev();
  } else if (e.key == "ArrowRight") {
    carouselNext();
  } else if (!isNaN(e.key)) {
    goToCarouselItem(parseInt(e.key) - 1);
  }
});