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
  if (carouselInner.children["top-video-6"]) {
    let sensorsVideo = getTopVideoByCategory("120000", "views")[0];
    topVideoCalls(joinDate, todayDate, sensorsVideo, "top-video-6");
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
    requestSpreadsheetData("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Category List");
  }
  var carouselInner = document.getElementsByClassName("carousel-inner")[0];
  if (carouselInner.children["real-time-stats"]) {
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
  var graphHeight = 0.8583;
  var graphWidth = 0.9528;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var values = [];
  var labels = [];
  var colors = [];
  var type = "views";
  var cutoff = 0.025;

  var labelConversion = {
    "Programmable Controllers": {
      "name": "Programmable<br>Controllers",
      "color": "#1f77b4",
    },
    "Drives": {
      "name": "Drives",
      "color": ""
    },
    "HMI": {
      "name": "HMI",
      "color": "#ff7f0e"
    },
    "Process Control & Measurement": {
      "name": "Process Control<br>& Measurement",
      "color": "#2ca02c"
    },
    "Motion Control": {
      "name": "Motion Control",
      "color": "#d62728"
    },
    "Cables": {
      "name": "Cables",
      "color": "#e77c7c"
    },
    "Sensors / Encoders": {
      "name": "Sensors/Encoders",
      "color": "#9467bd"
    },
    "Motors": {
      "name": "Motors",
      "color": "#8c564b"
    },
    "Motor Controls": {
      "name": "Motor Controls",
      "color": "#e377c2"
    },
    "Field I/O": {
      "name": "Field I/O",
      "color": ""
    },
    "Communications": {
      "name": "Communications",
      "color": ""
    },
    "Pneumatic Components": {
      "name": "Pneumatic<br>Components",
      "color": "#7f7f7f"
    },
    "Relays / Timers": {
      "name": "Relays/Timers",
      "color": "#c6aedc"
    },
    "Stacklights": {
      "name": "Stacklights",
      "color": ""
    },
    "Power Products": {
      "name": "Power Products",
      "color": "#c6aedc"
    },
    "Pushbuttons / Switches / Indicators": {
      "name": "Pushbuttons/<br>Switches/Indicators",
      "color": "#f4cce8"
    },
    "Circuit Protection": {
      "name": "Circuit<br>Protection",
      "color": "#f4cce8"
    },
    "Safety": {
      "name": "Safety",
      "color": "#b2b2b2"
    },
    "Tools & Test Equipment": {
      "name": "Tools & Test<br>Equipment",
      "color": "#bcbd22"
    },
    "Wiring Solutions": {
      "name": "Wiring Solutions",
      "color": "#bc8b81"
    },
    "Enclosures": {
      "name": "Enclosures",
      "color": "#103d5d"
    },
    "Terminal Blocks": {
      "name": "Terminal Blocks",
      "color": "#ffb574"
    },
    "Power Transmission": {
      "name": "Power<br>Transmission",
      "color": "#165016"
    }
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
    let include = category.root;
    if (include) {
      for (var j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      let value = Math.round(category[type]);
      if (value / total <= cutoff) {
        otherTotal += value;
      } else {
        values.push(value);
        labels.push(labelConversion[category.name].name);
        colors.push(labelConversion[category.name].color);
      }
    }
  }
  if (cutoff != undefined && cutoff > 0) {
    values.push(otherTotal);
    labels.push("Other");
    colors.push("#5fe0ed");
  }

  var data1 = {
    values: values,
    labels: labels,
    marker: {
      colors: colors
    },
    domain: {
      row: 0,
      column: 0
    },
    name: "Categories By<br>Total Views",
    title: {
      text: "Categories By<br>Total Views",
      font: {
        size: 30
      }
    },
    textinfo: "label",
    textposition: "inside",
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>%{value} views<br>%{percent}",
    sort: false,
    type: 'pie',
    rotation: 90
  };

  // Avg Views Graph

  total = 0;
  otherTotal = 0;
  values = [];
  labels = [];
  colors = [];
  type = "avgViews";
  cutoff = 0.025;

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
    let include = category.root;
    if (include) {
      for (var j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      let value = Math.round(category[type]);
      if (value / total <= cutoff) {
        otherTotal += value;
      } else {
        values.push(value);
        labels.push(labelConversion[category.name].name);
        colors.push(labelConversion[category.name].color);
      }
    }
  }
  if (cutoff != undefined && cutoff > 0) {
    values.push(otherTotal);
    labels.push("Other");
    colors.push("#5fe0ed");
  }

  var data2 = {
    values: values,
    labels: labels,
    marker: {
      colors: colors
    },
    domain: {
      row: 0,
      column: 1
    },
    name: "Categories By<br>Average Views Per Video",
    title: {
      text: "Categories By<br>Average Views Per Video",
      font: {
        size: 30
      }
    },
    textinfo: "label",
    textposition: "inside",
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>~%{value} views per video<br>%{percent}",
    sort: false,
    type: 'pie',
    rotation: 140
  };

  var data = [data2, data1];

  var layout = {
    height: height,
    width: width,
    font: {size: 30},
    automargin: true,
    autosize: true,
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: 20
      },
      y: 0.5
    },
    grid: {
      rows: 1,
      columns: 2
    },
    margin: {
      b:5,
      l:5,
      r:5,
      t:5
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
    if (currentSettings.dashboards[index].name == "product-categories") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  var graphId = "categories-double-views-chart";

  Plotly.newPlot(graphId, data, layout, config);

  recordGraphSize(graphId, graphHeight, graphWidth);
}

// Displays thumbnails with arrows on Top Ten Dashboard
function displayTopTenThumbnails() {
  let topTenSheet = JSON.parse(localStorage.getItem("topTenSheet"));
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let output = ``;
  for (var j = 1; j < topTenSheet.length; j++) {
    for (var i = 0; i < topTenSheet[0].length; i++) {
      if (i == 0) {
        output += `<div class="column-title"><h4>${topTenSheet[j][i]}</h4></div>`;
      } else {
        var videoId = topTenSheet[j][i];
        var videoTitle = "YouTube Video ID: " + videoId;
        if (statsByVideoId && statsByVideoId[videoId]) {
          videoTitle = statsByVideoId[videoId]["title"];
        }
        output += `
          <div class="top-ten-thumbnail-holder column-thumbnail">
            <a href="https://youtu.be/${videoId}" target="_blank" onclick="closeFullscreen()" alt="${videoTitle}">
              <img class="top-ten-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail" title="${videoTitle}">`;
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
  if (!autoScrollDivs.includes("top-ten-thumbnail-wrapper")) {
    new AutoDivScroll("top-ten-thumbnail-wrapper", 25, 1, 2);
    autoScrollDivs.push("top-ten-thumbnail-wrapper");
  }
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
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  var carouselInner = document.getElementsByClassName("carousel-inner")[0];
  if (carouselInner.children.thumbnails) {
    let uploads = JSON.parse(localStorage.getItem("uploads"));
    if (uploads) {
      var uploadThumbnails = "";
      for (var i = 0; i < uploads.length; i++) {
        var videoTitle = "YouTube Video ID: " + uploads[i];
        if (statsByVideoId && statsByVideoId[uploads[i]]) {
          videoTitle = statsByVideoId[uploads[i]]["title"];
        }
        uploadThumbnails += `
          <a href="https://youtu.be/${uploads[i]}" target="_blank" onclick="closeFullscreen()" alt="${videoTitle}">
            <img class="thumbnail" src="https://i.ytimg.com/vi/${uploads[i]}/default.jpg" alt="thumbnail" title="${videoTitle}">
          </a>`;
      }
      var thumbnailContainer = document.getElementById("thumbnail-container");
      thumbnailContainer.innerHTML = uploadThumbnails;

      if (!autoScrollDivs.includes("thumbnail-wrapper")) {
        new AutoDivScroll("thumbnail-wrapper", 25, 1, 1);
        autoScrollDivs.push("thumbnail-wrapper");
      }
    }
  }
}

function displayUserFeedback() {
  let feedbackSheet = JSON.parse(localStorage.getItem("feedbackSheet"));
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let output = ``;
  for (var i = 1; i < feedbackSheet.length; i++) {
    var videoId = feedbackSheet[i][0];
    var feedbackText = feedbackSheet[i][1];
    let videoTitle = "YouTube Video ID: " + videoId;
    if (statsByVideoId && statsByVideoId[videoId]) {
      videoTitle = statsByVideoId[videoId]["title"];
    }
    var thumbnail = `
      <div class="col-4">
        <a href="https://youtu.be/${videoId}" target="_blank" onclick="closeFullscreen()" alt="${videoTitle}">
          <img class="feedback-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail" title="${videoTitle}">
        </a>
      </div>`;
    var feedback = `<div class="col-8"><h1 class="feedback-text">"${feedbackText}"</h1></div>`;
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
  if (!autoScrollDivs.includes("feedback-wrapper")) {
    new AutoDivScroll("feedback-wrapper", 25, 1, 1);
    autoScrollDivs.push("feedback-wrapper");
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
  let viewportWidth = document.documentElement.clientWidth;
  for (var graphId in graphSizes) {
    let height = graphSizes[graphId].height * viewportHeight;
    let width = graphSizes[graphId].width * viewportWidth;
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
    if (e.ctrlKey || e.altKey) {
      goToCarouselItem(parseInt(e.key) + 9);
    } else {
      goToCarouselItem(parseInt(e.key) - 1);
    }
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
  if (endDashboard.getAttribute("theme") == "dark") {
    body.className = "dark";
    if (endDashboard.id == "platform") {
      document.getElementsByClassName("demographics-table")[0]
          .classList.add("table-dark");
    }
  } else {
    body.className = "";
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