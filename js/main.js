function loadDashboards() {
  var carouselInner = document.getElementsByClassName("carousel-inner")[0];
  var todayDate = getTodaysDate();
  if (carouselInner.children.thumbnails) {
    requestChannelNumVideos();
  }
  if (carouselInner.children.platform) {
    platformDashboardCalls(joinDate, todayDate);
  }
  if (carouselInner.children["top-ten"]) {
    displayTopTenThumbnails();
  }
  if (carouselInner.children["top-video-1"]) {
    sortVideosByViews();
  }
}

function initializeUpdater() {
  var updateId = window.setInterval(updateStats, 1000);
}

function updateStats() {
  if (!localStorage.getItem("lastUpdatedOn")) {
    let oldDate = new Date(0);
    localStorage.setItem("lastUpdatedOn", oldDate.toString());
  }
  let lastUpdatedOn = localStorage.getItem("lastUpdatedOn");
  let updateCount = Math.floor((new Date() - new Date(lastUpdatedOn)) / 1000);
  if (updateCount >= 86400) {
    updateTopTenVideoSheet();
    realTimeStatsCalls();
    requestFileModifiedTime("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Video List");
  }
  if (enabledOrder.includes("real-time-stats")) {
    console.log("Update");
    updateRealTimeStats(updateCount);
  }
}

// Update odometers in real time stats dashboard
function updateRealTimeStats(updateCount) {
  let secondsPerIncrement = JSON.parse(localStorage.getItem("secondsPerIncrement"));
  let odometerCategories = JSON.parse(localStorage.getItem("odometerCategories"));
  for (var key in secondsPerIncrement) {
    if (secondsPerIncrement.hasOwnProperty(key)) {
      if (updateCount % secondsPerIncrement[key] == 0) {
        var odometers = odometerCategories[key];
        odometers.forEach(odometer => {
          var elemOdometer = document.getElementById(odometer);
          var newValue = parseInt(elemOdometer.getAttribute("value")) + 1;
          elemOdometer.innerHTML = newValue;
          elemOdometer.setAttribute("value", newValue);
        });
      }
    }
  }
}

// Initialize real time stats in real time stats dashboard
function loadRealTimeStats() {
  let stats = JSON.parse(localStorage.getItem("realTimeStats"));
  if (stats.cumulative && stats.month && stats.today) {

    console.log("Real Time Stats: ", stats);
    
    var secondsPerIncrement = {};
    for (var key in stats.today) {
      if (stats.today.hasOwnProperty(key) && key != "averageViewDuration") {
        secondsPerIncrement[key] = Math.round(43200 / stats.today[key]);
      }
    }
    console.log(secondsPerIncrement);
    localStorage.setItem("secondsPerIncrement", JSON.stringify(secondsPerIncrement));
    
    var recordDate = new Date(localStorage.getItem("lastUpdatedOn"));
    var now = new Date();
    var diffInSeconds = Math.round((now - recordDate) / 1000);
    
    var avgDurationOdometer = document.getElementById("stat-avg-duration");
    var avgPercentageOdometer = document.getElementById("stat-avg-percentage");
    var odometerCategories = {
      "views": ["stat-views-cumulative", "stat-views-month"],
      "estimatedMinutesWatched": ["stat-minutes-cumulative", "stat-minutes-month"],
      "netSubscribersGained": ["stat-subs-cumulative", "stat-subs-month"],
      "comments": ["stat-comments-cumulative", "stat-comments-month"],
      "likes": ["stat-likes-cumulative", "stat-likes-month"],
      "cumulative": {
        "views": "stat-views-cumulative",
        "estimatedMinutesWatched": "stat-minutes-cumulative",
        "netSubscribersGained": "stat-subs-cumulative",
        "comments": "stat-comments-cumulative",
        "likes": "stat-likes-cumulative"
      },
      "month": {
        "views": "stat-views-month",
        "estimatedMinutesWatched": "stat-minutes-month",
        "netSubscribersGained": "stat-subs-month",
        "comments": "stat-comments-month",
        "likes": "stat-likes-month"
      }
    };
    localStorage.setItem("odometerCategories", JSON.stringify(odometerCategories));
    
    // Load data into odometers
    ["cumulative", "month"].forEach(category => {
      var odometers = odometerCategories[category];
      for (var key in odometers) {
        if (odometers.hasOwnProperty(key)) {
          var odometer = odometers[key];
          var elemOdometer = document.getElementById(odometer);
          var value = stats[category][key];
          value += Math.round(diffInSeconds / secondsPerIncrement[key]);
          elemOdometer.setAttribute("value", value);
          elemOdometer.innerHTML = value;
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
  }

  
}

function updateTopTenVideoSheet() {
  let now = new Date();
  let firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (now - firstDayOfMonth > 432000000) {
    // Update for current month
    let lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    let startDate = getYouTubeDateFormat(firstDayOfMonth);
    let endDate = getYouTubeDateFormat(lastDayOfMonth);
    let month = startDate.substr(0, 7);
    requestMostWatchedVideos(startDate, endDate, 20, month);
  } else {
    // Update for previous month
    firstDayOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    let lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    let startDate = getYouTubeDateFormat(firstDayOfMonth);
    let endDate = getYouTubeDateFormat(lastDayOfMonth);
    let month = startDate.substr(0, 7);
    requestMostWatchedVideos(startDate, endDate, 20, month);
  }
}

function calcCategoryStats() {
  let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));
  let categoryStats = [];
  for (var categoryId in categoryTotals) {
    if (categoryTotals.hasOwnProperty(categoryId)) {
      let totals = categoryTotals[categoryId];
      let shortName = totals["shortName"];
      let name = totals["name"];
      let root = totals["root"];
      let leaf = totals["leaf"];
      let views = parseInt(totals["views"]);
      let likes = parseInt(totals["likes"]);
      let duration = parseInt(totals["duration"]);
      let videos = totals["videos"];
      let numVideos = videos.length;
      let avgViews = views / numVideos;
      let avgLikes = likes / numVideos;
      let avgDuration = duration / numVideos;
      categoryStats.push({
        "avgDuration": avgDuration,
        "avgLikes": avgLikes,
        "avgViews": avgViews,
        "categoryId": categoryId,
        "duration": duration,
        "leaf": leaf,
        "likes": likes,
        "name": name,
        "root": root,
        "shortName": shortName,
        "videos": videos,
        "views": views
      });
    }
  }
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));

  console.log("Category Stats: ", categoryStats);
  saveCategoryStatsToSheets();
  saveVideoStatsToSheets();
}

// Displays thumbnails with arrows on Top Ten Dashboard
function displayTopTenThumbnails() {
  let topTenSheet = JSON.parse(localStorage.getItem("topTenSheet"));
  let output = ``;
  for (var j = 1; j < topTenSheet.length; j++) {
    for (var i = 0; i < topTenSheet[0].length; i++) {
      if (i == 0) {
        output += `<div class="column-title"><h4>${topTenSheet[j][i]}</h4></div>`;
      } else {
        var videoId = topTenSheet[j][i];
        output += `<div class="top-ten-thumbnail-holder column-thumbnail"><img class="top-ten-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail">`;
        if (j != 1) {
          var currPosition = i;
          var prevPosition = topTenSheet[j - 1].indexOf(videoId);
          if (prevPosition == -1) {
            // Add + up arrow
            output += `<span class="oi oi-arrow-thick-top arrow-green"></span><span class="arrow-text-black">+</span>`;
          } else if (prevPosition != currPosition) {
            var change = prevPosition - currPosition;
            if (change < 0) {
              // Add down arrow
              output += `<span class="oi oi-arrow-thick-bottom arrow-red"></span><span class="arrow-text-white">${Math.abs(change)}</span>`;
            } else if(change > 0) {
              // Add up arrow
              output += `<span class="oi oi-arrow-thick-top arrow-green"></span><span class="arrow-text-black">${change}</span>`;
            }
          }
        }
        output += `</div>`;
      }
    }
  }
  let thumbnailContainer = document.getElementById("top-ten-thumbnail-container");
  thumbnailContainer.innerHTML = output;
  let thumbnailWrapper = document.getElementById("top-ten-thumbnail-wrapper");
  thumbnailWrapper.scrollLeft = thumbnailWrapper.scrollWidth;
  new AutoDivScroll("top-ten-thumbnail-wrapper", 25, 1, 2);
}

function sortCategoriesByViews() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["views"]) - parseInt(a["views"]);
  });
  console.log("Stats Sorted by views: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("views");
}

function sortCategoriesByLikes() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["likes"]) - parseInt(a["likes"]);
  });
  console.log("Stats Sorted by likes: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("likes");
}

function sortCategoriesByAvgViews() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["avgViews"]) - parseInt(a["avgViews"]);
  });
  console.log("Stats Sorted by AvgViews: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("avgViews");
}

function sortCategoriesByAvgLikes() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["avgLikes"]) - parseInt(a["avgLikes"]);
  });
  console.log("Stats Sorted by AvgLikes: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("avgLikes");
}

function sortCategoriesByAvgDuration() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["avgDuration"]) - parseInt(a["avgDuration"]);
  });
  console.log("Stats Sorted by AvgDuration: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("avgDuration");
}

function displayTopCategories(type) {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  let index = 0;
  let categoryNum = 1;
  console.log("Top 10 Categories By " + type);
  while (categoryNum <= 5) {
    let category = categoryStats[index];
    if (!category.name.includes("SPECIAL CATEGORIES")) {
      console.log(categoryNum + ". " + category.name + " - ~" + numberWithCommas(Math.round(category[type])) + " " + type);
      categoryNum++;
    }
    index++;
  }
}

function sortVideosByViews() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
    return parseInt(b["views"]) - parseInt(a["views"]);
  });
  console.log("Videos Sorted by Views: ", allVideoStats);
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  displayTopVideos();
}

function sortVideosByLikes() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
    return parseInt(b["likes"]) - parseInt(a["likes"]);
  });
  console.log("Videos Sorted by Likes: ", allVideoStats);
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  displayTopVideos();
}

function displayTopVideos() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  let todayDate = getTodaysDate();
  let advertisedVideos = ["vio9VoZRkbQ", "dqkUlrFoZY4", "rNOoyOGBFK4", "Eyvv66xYwS8", "YfrmIjwDvXo"];
  let index = 0;
  let dashboardNum = 1;
  while (dashboardNum <= 5) {
    let videoId = allVideoStats[index]["videoId"];
    if (!advertisedVideos.includes(videoId)) {
      topVideoCalls(joinDate, todayDate, videoId, "top-video-" + dashboardNum);
      dashboardNum++;
    }
    index++;
  }
}

function recordGraphSize(graphId, graphHeight, graphWidth, automargin) {
  if (!localStorage.getItem("graphSizes")) {
    localStorage.setItem("graphSizes", JSON.stringify({}));
  }
  let graphSizes = JSON.parse(localStorage.getItem("graphSizes"));
  graphSizes[graphId] = {
    height: graphHeight,
    width: graphWidth
  };
  if (automargin) {
    graphSizes[graphId]["automargin"] = automargin;
  }
  localStorage.setItem("graphSizes", JSON.stringify(graphSizes));
}

function resizeGraphs() {
  this.console.log("Resize");
  let graphSizes = JSON.parse(this.localStorage.getItem("graphSizes"));
  let viewportHeight = document.documentElement.clientHeight;
  for (var graphId in graphSizes) {
    let height = graphSizes[graphId].height * viewportHeight;
    let width = graphSizes[graphId].width * viewportHeight;
    let update = {
      height: height,
      width: width
    };
    Plotly.relayout(graphId, update);
  }
}

function fixGraphMargins() {
  let graphSizes = JSON.parse(this.localStorage.getItem("graphSizes"));
  for (var graphId in graphSizes) {
    let automargin = graphSizes[graphId]["automargin"];
    if (automargin) {
      Plotly.relayout(graphId, automargin);
    }
  }
}

function carouselNext() {
  $(".carousel").carousel("next");
  fixGraphMargins()
}

function carouselPrev() {
  $(".carousel").carousel("prev");
  fixGraphMargins()
}

function goToCarouselItem(index) {
  $(".carousel").carousel(index);
  fixGraphMargins()
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
function showUploadThumbnails() {
  var carouselInner = document.getElementsByClassName("carousel-inner")[0];
  if (carouselInner.children.thumbnails) {
    let uploads = JSON.parse(localStorage.getItem("uploads"));
    if (uploads) {
      var uploadThumbnails = "";
      for (var i = 0; i < uploads.length; i++) {
        uploadThumbnails += `<img class="thumbnail" src="https://i.ytimg.com/vi/${uploads[i]}/default.jpg" alt="thumbnail">`;
      }
      var thumbnailContainer = document.getElementById("thumbnail-container");
      thumbnailContainer.innerHTML = uploadThumbnails;

      new AutoDivScroll("thumbnail-wrapper", 25, 1, 1);
    }
  }
}
showUploadThumbnails();

if (enabledOrder.includes("real-time-stats")) {
  loadRealTimeStats();
}


function getTopTenVideosByMonth() {
  var startDate = new Date("2010-07-1");
  var endDate = new Date("2019-06-30");
  while (endDate - startDate > 0) {
    let firstDay = getYouTubeDateFormat(startDate);
    let lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0));
    let month = firstDay.substr(0, 7);
    requestMostWatchedVideos(firstDay, lastDay, 20, month);
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  }
}

window.addEventListener('resize', resizeGraphs, true);