// Calls the Analytics API with a request and returns response to callback
function callAnalyticsAPI(request, source, callback, message) {
  gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
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
  realTimeStatsCalls();
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

// Handle carousel scrolling
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

// Load thumbnails in 1000 thumbnail dashboard
if (enabledOrder.includes("thumbnails")) {
  var uploadThumbnails = "";
  for (var i = 0; i < uploadIds.length; i++) {
    uploadThumbnails += `<img class="thumbnail" src="https://i.ytimg.com/vi/${uploadIds[i]}/default.jpg" alt="thumbnail">`;
  }
  var thumbnailContainer = document.getElementById("thumbnail-container");
  thumbnailContainer.innerHTML = uploadThumbnails;

  new AutoDivScroll("thumbnail-wrapper", 25, 1, 1);
}

if (enabledOrder.includes("real-time-stats")) {
  localStorage.setItem("statsUpdating", "false");
  loadRealTimeStats();
}

// Initialize real time stats in real time stats dashboard
function loadRealTimeStats() {
  let stats = JSON.parse(localStorage.getItem("realTimeStats"));
  if (stats.cumulative && stats.month && stats.today) {

    console.log("Real Time Stats: ", stats);
    
    var secondsPerIncrement = {};
    for (var key in stats.today) {
      if (stats.today.hasOwnProperty(key) && key != "averageViewDuration") {
        secondsPerIncrement[key] = Math.round(86400 / stats.today[key]);
      }
    }
    
    var recordDate = new Date(stats.date);
    var now = new Date();
    var diffInSeconds = Math.round((now - recordDate) / 1000);
    
    var viewsCumulative = document.getElementById("stat-views-cumulative");
    var viewsMonth = document.getElementById("stat-views-month");
    var minutesCumulative = document.getElementById("stat-minutes-cumulative");
    var minutesMonth = document.getElementById("stat-minutes-month");
    var commentsCumulative = document.getElementById("stat-comments-cumulative");
    var commentsMonth = document.getElementById("stat-comments-month");
    var likesCumulative = document.getElementById("stat-likes-cumulative");
    var likesMonth = document.getElementById("stat-likes-month");
    var subsCumulative = document.getElementById("stat-subs-cumulative");
    var subsMonth = document.getElementById("stat-subs-month");
    var avgDurationOdometer = document.getElementById("stat-avg-duration");
    var avgPercentageOdometer = document.getElementById("stat-avg-percentage");
    var odometerCategories = {
      "views": [viewsCumulative, viewsMonth],
      "estimatedMinutesWatched": [minutesCumulative, minutesMonth],
      "netSubscribersGained": [subsCumulative, subsMonth],
      "comments": [commentsCumulative, commentsMonth],
      "likes": [likesCumulative, likesMonth],
      "cumulative": {
        "views": viewsCumulative,
        "estimatedMinutesWatched": minutesCumulative,
        "netSubscribersGained": subsCumulative,
        "comments": commentsCumulative,
        "likes": likesCumulative
      },
      "month": {
        "views": viewsMonth,
        "estimatedMinutesWatched": minutesMonth,
        "netSubscribersGained": subsMonth,
        "comments": commentsMonth,
        "likes": likesMonth
      }
    };
    
    // Load data into odometers
    ["cumulative", "month"].forEach(category => {
      var odometers = odometerCategories[category];
      for (var key in odometers) {
        if (odometers.hasOwnProperty(key)) {
          var odometer = odometers[key];
          var value = stats[category][key];
          value += Math.round(diffInSeconds / secondsPerIncrement[key]);
          odometer.setAttribute("value", value);
          odometer.innerHTML = value;
        }
      }
    });
    var avgDurationCumulative =
        secondsToDuration(stats.cumulative.averageViewDuration);
    avgDurationOdometer.innerHTML = avgDurationCumulative;
    var avgPercentageCumulative =
        decimalToPercent(stats.cumulative.averageViewDuration / 
        averageVideoDuration);
    avgPercentageOdometer.innerHTML = avgPercentageCumulative + "%";
    
    // Updating
    if (localStorage.getItem("statsUpdating") == "false") {
      var updateStatsId = window.setInterval(updateStats, 1000);
      localStorage.setItem("statsUpdating", "true");
    }
    console.log(secondsPerIncrement);
  }

  // Update odometers in real time stats dashboard
  function updateStats() {
    let updateCount = Math.floor((new Date() - new Date(stats.date)) / 1000);
    console.log("Update");
    for (var key in secondsPerIncrement) {
      if (secondsPerIncrement.hasOwnProperty(key)) {
        if (updateCount % secondsPerIncrement[key] == 0) {
          var odometers = odometerCategories[key];
          odometers.forEach(odometer => {
            var newValue = parseInt(odometer.getAttribute("value")) + 1;
            odometer.innerHTML = newValue;
            odometer.setAttribute("value", newValue);
          });
        }
      }
    }
  }

}
