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
function callDataAPIVideos(request, source, callback, message) {
  gapi.client.youtube.videos.list(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
    })
    .catch(err => {
      console.error("Data API call error", err);
    });
}

// Calls the Sheets API for getting values with a request and returns response
// to callback
function callSheetsAPIGet(request, source, callback) {
  gapi.client.sheets.spreadsheets.values.get(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Google Sheets API call error", err);
    });
}

// Calls the Sheets API for updating values with a request and returns response
// to callback
function callSheetsAPIUpdate(request, source, callback) {
  gapi.client.sheets.spreadsheets.values.update(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Google Sheets API call error", err);
    });
}

function callDriveAPIFiles(request, source, callback, message) {
  gapi.client.drive.files.get(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
    })
    .catch(err => {
      console.error("Google Sheets API call error", err);
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
  var values = [
    ["Header 1", "Header 2", "Header 3"],
    ["Item 1", "Item 2", "Item 3"],
    ["Item 4", "Item 5", "Item 6"],
  ];
  var body = {
    "values": values
  };
  requestUpdateSheetData("1x4gi9zk8YXAAqoBwbURV9DWSR6NdbJbLOGdPs2eWQUE", "Sheet1", body);
  requestFileModifiedTime("1x4gi9zk8YXAAqoBwbURV9DWSR6NdbJbLOGdPs2eWQUE", "Video Stats");
  requestFileModifiedTime("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Categories");
  // requestVideoViewsByTrafficSource(thirtyDaysAgo, todayDate, "mXcDYoz1iMo");
  // requestViewsByDeviceType(joinDate, todayDate);
  // requestViewsByTrafficSource(joinDate, todayDate);
  // requestVideoPlaylist(uploadsPlaylistId, 50);
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
    realTimeStatsCalls();
    requestSpreadsheetData("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Sheet1");
    // updateCategoriesData();
    let date = new Date();
    date.setHours(6,0,0,0);
    localStorage.setItem("lastUpdatedOn", date.toString());
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

function updateCategoriesData() {
  let categoriesSheet = JSON.parse(localStorage.getItem("categoriesSheet"));
  let productCategoryIds = {}; // categoryId : category name
  let categoriesByVideoId = {}; // videoId : array of categoryIds its in
  let categoryTotals = {}; // categoryId : {views, likes, numVideos}
  let columns = {};
  let uploads = [];
  let columnHeaders = categoriesSheet[0];
  for (var i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (var i = 1; i < categoriesSheet.length; i++) {
    let videoId = categoriesSheet[i][columns["YouTube ID"]];
    let categoryId = categoriesSheet[i][columns["Sort"]];

    let level1Id = categoryId.slice(0, -3) + "000";
    let level2Id = categoryId.slice(0, -1) + "0";
    let level3Id = categoryId;
    if (categoriesSheet[i][columns["L3 Category"]] == "Productivity2000") {
      level3Id = categoryId.slice(0, -1) + "2";
    }
    let levelIds = new Set([level1Id, level2Id, level3Id]);

    // Initialize entries in productCategoryIds and 
    if (productCategoryIds[categoryId] == undefined) {
      let categoryName = "";
      let level1Name = categoriesSheet[i][columns["L1 Category"]];
      let level2Name = categoriesSheet[i][columns["L2 Category"]];
      let level3Name = categoriesSheet[i][columns["L3 Category"]];
      let levels = {
        "level1": {
          "id": level1Id,
          "name": level1Name
        }
      };
      if (level2Name == "") {
        categoryName = level1Name;
      } else if (level3Name == "") {
        categoryName = level1Name + "->>" + level2Name;
        levels["level2"] = {"id": level2Id, "name": categoryName};
      } else {
        categoryName = level1Name + "->>" + level2Name;
        levels["level2"] = {"id": level2Id, "name": categoryName};
        categoryName = level1Name + "->" + level2Name + "->>" + level3Name;
        levels["level3"] = {"id": level3Id, "name": categoryName};
      }
      for (var level in levels) {
        if (levels.hasOwnProperty(level)) {
          let levelId = levels[level].id;
          if (productCategoryIds[levelId] == undefined) {
            productCategoryIds[levelId] = levels[level].name;
            categoryTotals[levelId] = {
              "duration": 0,
              "likes": 0,
              "views": 0,
              "numVideos": 0
            };
          }
        }
      }
    }

    for (var levelId of levelIds) {
      categoryTotals[levelId]["numVideos"] = parseInt(categoryTotals[levelId]["numVideos"]) + 1;
    }

    // Add categories for the videoId to categoriesByVideoId
    if (categoriesByVideoId[videoId] == undefined) {
      let categories = [];
      for (var levelId of levelIds) {
        categories.push(levelId);
      }
      categoriesByVideoId[videoId] = categories;
    } else {
      let categories = categoriesByVideoId[videoId];
      for (var levelId of levelIds) {
        if (!categories.includes(levelId)) {
          categories.push(levelId);
        }
      }
      categoriesByVideoId[videoId] = categories;
    }
    // Add videoIds to uploads
    if (!uploads.includes(videoId)) {
      uploads.push(videoId);
    }

  }
  localStorage.setItem("productCategoryIds", JSON.stringify(productCategoryIds));
  localStorage.setItem("categoriesByVideoId", JSON.stringify(categoriesByVideoId));
  localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));
  localStorage.setItem("uploads", JSON.stringify(uploads));

  console.log("Product Category Ids: ", productCategoryIds);
  console.log("Categories By Video Id: ", categoriesByVideoId);
  console.log("Uploads: ", uploads);

  showUploadThumbnails();

  getAllVideoStats(uploads);
}

function calcCategoryStats() {
  let productCategoryIds = JSON.parse(localStorage.getItem("productCategoryIds"));
  let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));
  let categoryStats = [];
  for (var categoryId in productCategoryIds) {
    if (productCategoryIds.hasOwnProperty(categoryId)) {
      let categoryName = productCategoryIds[categoryId];
      let totals = categoryTotals[categoryId];
      let views = parseInt(totals.views);
      let likes = parseInt(totals.likes);
      let duration = parseInt(totals.duration);
      let numVideos = parseInt(totals.numVideos);
      let avgViews = views / numVideos;
      let avgLikes = likes / numVideos;
      let avgDuration = duration / numVideos;
      categoryStats.push({
        "avgDuration": avgDuration,
        "avgLikes": avgLikes,
        "avgViews": avgViews,
        "categoryId": categoryId,
        "duration": duration,
        "likes": likes,
        "name": categoryName,
        "numVideos": numVideos,
        "views": views
      });
    }
  }
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));

  console.log("Category Stats: ", categoryStats);

  categoryStats.sort(function(a, b) {
    return parseInt(b["avgViews"]) - parseInt(a["avgViews"]);
  });
  console.log("Stats Sorted by AvgViews: ", categoryStats);
  
  console.log("Top 10 Categories By Average Views Per Video");
  for (var i = 0; i < 10; i++) {
    console.log((i + 1) + ". " + categoryStats[i].name + " - ~" + Math.round(categoryStats[i].avgViews) + " views per video");
  }
  
  categoryStats.sort(function(a, b) {
    return parseInt(b["avgLikes"]) - parseInt(a["avgLikes"]);
  });
  console.log("Stats Sorted by AvgLikes: ", categoryStats);
  
  console.log("Top 10 Categories By Average Likes Per Video");
  for (var i = 0; i < 10; i++) {
    console.log((i + 1) + ". " + categoryStats[i].name + " - ~" + Math.round(categoryStats[i].avgLikes) + " likes per video");
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