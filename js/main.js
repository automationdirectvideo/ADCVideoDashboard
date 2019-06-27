function loadDashboards() {
  var carouselInner = document.getElementsByClassName("carousel-inner")[0];
  var todayDate = getTodaysDate();
  if (carouselInner.children["real-time-stats"]) {
    loadRealTimeStats();
  }
  if (carouselInner.children["thumbnails"]) {
    requestChannelNumVideos();
  }
  if (carouselInner.children["platform"]) {
    platformDashboardCalls(joinDate, todayDate);
  }
  if (carouselInner.children["product-categories"]) {
    displayTopCategories();
  }
  if (carouselInner.children["top-ten"]) {
    displayTopTenThumbnails();
  }
  if (carouselInner.children["feedback"]) {
    requestSpreadsheetData("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM",
        "User Feedback List");
  }
  if (carouselInner.children["top-video-1"]) {
    let plcVideo = getTopVideoByCategory("20000", "views")[0];
    topVideoCalls(joinDate, todayDate, plcVideo, "top-video-1");
  }
  if (carouselInner.children["top-video-2"]) {
    let drivesVideo = getTopVideoByCategory("40000", "views")[0];
    topVideoCalls(joinDate, todayDate, drivesVideo, "top-video-2");
  }
  if (carouselInner.children["top-video-3"]) {
    let hmiVideo = getTopVideoByCategory("50000", "views")[0];
    topVideoCalls(joinDate, todayDate, hmiVideo, "top-video-3");
  }
  if (carouselInner.children["top-video-4"]) {
    let motionControlVideo = getTopVideoByCategory("80000", "views")[0];
    topVideoCalls(joinDate, todayDate, motionControlVideo, "top-video-4");
  }
  if (carouselInner.children["top-video-5"]) {
    let sensorsVideo = getTopVideoByCategory("100000", "views")[0];
    topVideoCalls(joinDate, todayDate, sensorsVideo, "top-video-5");
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
      "cumulative": {
        "views": "stat-views-cumulative",
        "estimatedMinutesWatched": "stat-minutes-cumulative",
        "netSubscribersGained": "stat-subs-cumulative"
      },
      "month": {
        "views": "stat-views-month",
        "estimatedMinutesWatched": "stat-minutes-month",
        "netSubscribersGained": "stat-subs-month"
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
        secondsToDurationMinSec(stats.cumulative.averageViewDuration);
    avgDurationOdometer.innerHTML = avgDurationCumulative;
    avgDurationOdometer.value = stats.cumulative.averageViewDuration;
    calcAvgVideoDuration(stats.cumulative.averageViewDuration);
  }

  
}

function calcAvgVideoDuration() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  if (allVideoStats) {
    let totalDuration = 0;
    for (var i = 0; i < allVideoStats.length; i++) {
      totalDuration += allVideoStats[i].duration;
    }
    let avgDuration = totalDuration / allVideoStats.length;
    let avgViewDuration = document.getElementById("stat-avg-duration").value;
    let avgViewPercentage = decimalToPercent(avgViewDuration / avgDuration);
    if (isNaN(avgViewPercentage)) {
      avgViewPercentage = 36.1;
    }
    document.getElementById("stat-avg-percentage").innerText =
        avgViewPercentage + "%";
  } else {
    // Default value if allVideoStats does not exist yet
    document.getElementById("stat-avg-percentage").innerText = "36.1%";
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

function getTopVideoByCategory(categoryId, type, numVideos) {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
    return parseInt(b[type]) - parseInt(a[type]);
  });
  if (numVideos == undefined || numVideos <= 0) {
    numVideos = 1;
  }
  let topVideos = [];
  let i = 0;
  let categoryFound = false;
  while (i < categoryStats.length && !categoryFound) {
    if (categoryStats[i]["categoryId"] == categoryId) {
      categoryFound = true;
      let videos = categoryStats[i]["videos"];
      let j = 0;
      let numFound = 0;
      while (j < allVideoStats.length && numFound < numVideos) {
        if (videos.includes(allVideoStats[j]["videoId"])) {
          topVideos.push(allVideoStats[j]["videoId"]);
          numFound++;
        }
        j++;
      }
    }
    i++;
  }
  return topVideos;
}

function displayTopCategories() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  var excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

  var total = 0;
  let otherTotal = 0;
  var height = 0.458 * document.documentElement.clientHeight;
  var width = 0.535 * document.documentElement.clientHeight;
  var values = [];
  var sortedCategories = [];
  var labels = [];
  var graphId = "categories-views-chart";
  var type = "views";
  var cutoff = 0.025;

  var labelConversion = {
    "Programmable Controllers": "Programmable<br>Controllers",
    "Drives": "Drives",
    "HMI": "HMI",
    "Process Control & Measurement": "Process Control<br>& Measurement",
    "Motion Control": "Motion Control",
    "Cables": "Cables",
    "Sensors / Encoders": "Sensors/<br>Encoders",
    "Motors": "Motors",
    "Motor Controls": "Motor Controls",
    "Field I/O": "Field I/O",
    "Communications": "Communications",
    "Pneumatic Components": "Pneumatic<br>Components",
    "Relays / Timers": "Relays/Timers",
    "Stacklights": "Stacklights",
    "Power Products": "Power Products",
    "Pushbuttons / Switches / Indicators": "Pushbuttons/<br>Switches/<br>Indicators",
    "Circuit Protection": "Circuit<br>Protection",
    "Safety": "Safety",
    "Tools & Test Equipment": "Tools & Test<br>Equipment",
    "Wiring Solutions": "Wiring<br>Solutions",
    "Enclosures": "Enclosures",
    "Terminal Blocks": "Terminal Blocks",
    "Power Transmission": "Power<br>Transmission"
  };

  for (var i = 0; i < categoryStats.length; i++) {
    let category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (var j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      total += Math.round(category[type]);
    }
  }
  for (var i = 0; i < categoryStats.length; i++) {
    let category = categoryStats[i];
    let include = true;
    for (var j = 0; j < excludeKeys.length; j++) {
      if (category.name.includes(excludeKeys[j])) {
        include = false;
      }
    }
    if (include) {
      let value = Math.round(category[type]);
      if (value / total <= cutoff) {
        otherTotal += value;
      } else {
        values.push(value);
        labels.push(labelConversion[category.name]);
        sortedCategories.push({
          "value": value,
          "name": category.name,
          "numVideos": category.videos.length
        });
      }
    }
  }
  if (cutoff != undefined && cutoff > 0) {
    values.push(otherTotal);
    labels.push("Other");
  }
  sortedCategories.sort(function(a, b) {
    return parseInt(b["value"]) - parseInt(a["value"]);
  });

  var data = [{
    values: values,
    labels: labels,
    textinfo: "label+percent",
    textposition: "auto",
    sort: false,
    type: 'pie',
    rotation: -20
  }];

  var layout = {
    height: height,
    width: width,
    font: {size: 18},
    automargin: true,
    autosize: true,
    showlegend: false,
    margin: {
      b:100,
      l:70,
      r:0,
      t:0
    }
  };

  var config = {
    staticPlot: true,
    responsive: true
  };

  var currentSettings = JSON.parse(localStorage.getItem("settings"));
  var theme = "";
  var index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == "platform") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
  }

  Plotly.newPlot(graphId, data, layout, config);

  for (var i = 1; i < 9; i++) {
    var title = document.getElementById("category-title-" + i);
    var views = document.getElementById("category-views-" + i);
    var videos = document.getElementById("category-videos-" + i);
    title.innerText = sortedCategories[i - 1]["name"];
    views.innerText = numberWithCommas(sortedCategories[i - 1]["value"]) +
        " Total Views";
    videos.innerText = numberWithCommas(sortedCategories[i - 1]["numVideos"]) +
        " Videos";
  }

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
        output += `
          <div class="top-ten-thumbnail-holder column-thumbnail">
            <a href="https://youtu.be/${videoId}" target="_blank" alt="YouTube Video ID: ${videoId}">
              <img class="top-ten-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail" title="YouTube Video ID: ${videoId}">`;
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
        output += `</a></div>`;
      }
    }
  }
  let thumbnailContainer = document.getElementById("top-ten-thumbnail-container");
  thumbnailContainer.innerHTML = output;
  let thumbnailWrapper = document.getElementById("top-ten-thumbnail-wrapper");
  thumbnailWrapper.scrollLeft = thumbnailWrapper.scrollWidth;
  new AutoDivScroll("top-ten-thumbnail-wrapper", 25, 1, 2);
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

// Load thumbnails in 1000 thumbnail dashboard
function displayUploadThumbnails() {
  var carouselInner = document.getElementsByClassName("carousel-inner")[0];
  if (carouselInner.children.thumbnails) {
    let uploads = JSON.parse(localStorage.getItem("uploads"));
    if (uploads) {
      var uploadThumbnails = "";
      for (var i = 0; i < uploads.length; i++) {
        uploadThumbnails += `
          <a href="https://youtu.be/${uploads[i]}" target="_blank" alt="YouTube Video ID: ${uploads[i]}">
            <img class="thumbnail" src="https://i.ytimg.com/vi/${uploads[i]}/default.jpg" alt="thumbnail" title="YouTube Video ID: ${uploads[i]}">
          </a>`;
      }
      var thumbnailContainer = document.getElementById("thumbnail-container");
      thumbnailContainer.innerHTML = uploadThumbnails;

      new AutoDivScroll("thumbnail-wrapper", 25, 1, 1);
    }
  }
}

function displayUserFeedback() {
  let feedbackSheet = JSON.parse(localStorage.getItem("feedbackSheet"));
  let output = ``;
  for (var i = 1; i < feedbackSheet.length; i++) {
    var videoId = feedbackSheet[i][0];
    var feedbackText = feedbackSheet[i][1];
    var thumbnail = `
      <div class="col-4">
        <a href="https://youtu.be/${videoId}" target="_blank" alt="YouTube Video ID: ${videoId}">
          <img class="feedback-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail" title="YouTube Video ID: ${videoId}">
        </a>
      </div>`;
    var feedback = `<div class="col-8"><h1 class="overflow-auto">${feedbackText}</h1></div>`;
    var spacer = `<div class="col-12"><hr></div>`;
    if (i % 2 == 0) {
      output += feedback + thumbnail;
    } else {
      output += thumbnail + feedback;
    }
    if (i != feedbackSheet.length - 1) {
      output += spacer;
    }
  }
  let feedbackContainer = document.getElementById("feedback-container");
  feedbackContainer.innerHTML = output;
  new AutoDivScroll("feedback-wrapper", 25, 1, 1);
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

if (currentSettings.footer == "show") {
  document.getElementsByTagName("footer")[0].classList.remove("d-none");
  document.getElementById("main-container").style.paddingBottom = "5rem";
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
var themeOrder = new Array(currentSettings.numEnabled);
var enabledOrder = new Array(currentSettings.numEnabled);
for (var i = 0; i < currentSettings.dashboards.length; i++) {
  var dashboard = currentSettings.dashboards[i];
  if (dashboard.index >= 0) {
    enabledOrder.splice(dashboard.index, 1, {
      "name": dashboard.name,
      "icon": dashboard.icon,
      "theme": dashboard.theme,
      "title": dashboard.title
    });
  }
}
for (var i = 0; i < enabledOrder.length; i++) {
  var dashboardItem = document.getElementById(enabledOrder[i].name);
  var indicator = document.getElementById("indicator").cloneNode();
  if (enabledOrder[i].name.includes("top-video-")) {
    dashboardItem = document.getElementById("top-video-#").cloneNode(true);
    dashboardText = dashboardItem.outerHTML;
    dashboardText = dashboardText.replace(/top-video-#/g, enabledOrder[i].name);
    dashboardText = dashboardText.replace(/TITLE PLACEHOLDER/, enabledOrder[i].title);
    var template = document.createElement("template");
    template.innerHTML = dashboardText;
    dashboardItem = template.content.firstChild;
  } else {
    dashboardItem.remove();
  }
  document.createElement("div",dashboardItem.outerText)
  dashboardItem.setAttribute("theme", enabledOrder[i].theme);
  indicator.id = "indicator-" + i;
  indicator.setAttribute("onclick", "goToCarouselItem("+ i +")");
  indicator.className = enabledOrder[i].icon + " indicator";
  carouselInner.appendChild(dashboardItem);
  indicatorList.appendChild(indicator);
  if (i == 0) {
    dashboardItem.classList.add("active");
    indicator.classList.add("active");
    updateTheme(i);
  }
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
  window.setTimeout(function(){
    fixGraphMargins();
    updateTheme(e.to);
  }, 250);
});
$(".carousel").on("slid.bs.carousel", function (e) {
  fixGraphMargins();
})

function updateTheme(dashboardIndex) {
  var endDashboard = 
      document.getElementsByClassName("carousel-item")[dashboardIndex];
  var body = document.getElementsByTagName("body")[0];
  var navbar = document.getElementsByClassName("navbar")[0];
  if (endDashboard.getAttribute("theme") == "dark") {
    body.className = "dark";
    navbar.className = "navbar navbar-expand-lg navbar-dark bg-dark";
    if (endDashboard.id == "platform") {
      document.getElementsByClassName("demographics-table")[0]
          .classList.add("table-dark");
    }
  } else {
    body.className = "";
    navbar.className = "navbar navbar-expand-lg navbar-light bg-light";
  }
}

if (carouselInner.children["real-time-stats"]) {
  loadRealTimeStats();
}

displayUploadThumbnails();

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

window.addEventListener('resize', function () {
  resizeGraphs();
  let topTenDashboard = document.getElementById("top-ten");
  if (topTenDashboard.classList.contains("active")) {
    let thumbnailContainer = document.getElementById("top-ten-thumbnail-container");
    thumbnailContainer.style.display = "none";
    this.window.setTimeout(function () {
      thumbnailContainer.style.display = "flex";
    }, 500);
  }
}, true);