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

// Calls the Data API for videos with a request and returns response to callback
function callDataAPIVideos(request, source, callback) {
  gapi.client.youtube.videos.list(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Data API call error", err);
    });
}

// Tests calls to the API
function testAPICalls() {
  var todayDate = getTodaysDate();
  var thirtyDaysAgo = getDateFromDaysAgo(30);
  // requestBasicVideoStats(joinDate, todayDate);
  // requestImpressions("2019-04-01", "2019-04-30");
  // requestMostWatchedVideos(thirtyDaysAgo, todayDate, 25);
  // requestSubscribersGained(joinDate, todayDate);
  // topVideoCalls(joinDate, todayDate, "mXcDYoz1iMo");
  topVideoCalls(joinDate, todayDate, "tpXW6qWoJGA");
  requestRealTimeStats(joinDate, todayDate);
  requestRealTimeStatsByDay(getDateFromDaysAgo(32), todayDate);
  // requestVideoViewsByTrafficSource(thirtyDaysAgo, todayDate, "mXcDYoz1iMo");
  // requestViewsByDeviceType(joinDate, todayDate);
  // requestViewsByTrafficSource(joinDate, todayDate);
  // requestVideoPlaylist(uploadsPlaylistId, 50);
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

if (currentSettings.footer == "hide") {
  document.getElementsByTagName("footer")[0].classList.add("d-none");
  document.getElementById("main-container").style.paddingBottom = "0px";
}

// Initialize carousel
var carouselInner = document.getElementsByClassName("carousel-inner")[0];
var indicatorList = 
    document.getElementsByClassName("indicator-list")[0];
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
  var indicator = document.getElementById("indicator").cloneNode();
  if (i == 0) {
    dashboardItem.classList.add("active");
    indicator.classList.add("active");
  }
  indicator.id = "indicator-" + i;
  indicator.setAttribute("data-slide-to", i);
  dashboardItem.remove();
  carouselInner.appendChild(dashboardItem);
  indicatorList.appendChild(indicator);
}

document.addEventListener("keydown", function (e) {
  if (e.key == "ArrowLeft") {
    carouselPrev();
  } else if (e.key == "ArrowRight") {
    carouselNext();
  } else if (!isNaN(e.key)) {
    goToCarouselItem(parseInt(e.key) - 1);
  }
});

$(".carousel").on("slide.bs.carousel", function (e) {
  var startIndicator = document.getElementById("indicator-" + e.from);
  var endIndicator = document.getElementById("indicator-" + e.to);
  startIndicator.classList.remove("active");
  endIndicator.classList.add("active");
})

var uploadThumbnails = "";
for (var i = 0; i < uploadIds.length; i++) {
  uploadThumbnails += `<img class="thumbnail" src="https://i.ytimg.com/vi/${uploadIds[i]}/default.jpg" alt="thumbnail">`;
}
var thumbnailContainer = document.getElementById("thumbnail-container");
thumbnailContainer.innerHTML = uploadThumbnails;

new AutoDivScroll("thumbnail-wrapper", 25, 1, 1);

localStorage.setItem("dateStamp", new Date.toString());

console.log("Date Stamp", localStorage.getItem("dateStamp"));
console.log("Real Time Stats Response", localStorage.getItem("realTimeStatsResponse"));
console.log("Real Time Stats By Day Response", localStorage.getItem("realTimeStatsByDayResponse"));
