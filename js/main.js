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
function callSheetsAPIGet(request, source, callback, message) {
  gapi.client.sheets.spreadsheets.values.get(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
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

// Calls the Sheets API for appending values with a request and returns response
// to callback
function callSheetsAPIAppend(request, source, callback) {
  gapi.client.sheets.spreadsheets.values.append(request)
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
  // requestSubscribersGained(joinDate, todayDate);
  // topVideoCalls(joinDate, todayDate, "mXcDYoz1iMo");
  topVideoCalls(joinDate, todayDate, "tpXW6qWoJGA", "top-video-1");
  topVideoCalls(joinDate, todayDate, "mXcDYoz1iMo", "top-video-2");
  platformDashboardCalls(joinDate, todayDate);
  // requestVideoViewsByTrafficSource(thirtyDaysAgo, todayDate, "mXcDYoz1iMo");
  // requestViewsByDeviceType(joinDate, todayDate);
  // requestViewsByTrafficSource(joinDate, todayDate);
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
    requestFileModifiedTime("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Videos By Category");
    // getVideosByCategoryData();
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
  let firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (now - firstDayOfMonth > 432000000) {
      // Update for current month
      let lastDayOfMonth = new Date(now.getFullYear(), date.getMonth() + 1, 0);
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

function getVideosByCategoryData() {
  let categoriesSheet = JSON.parse(localStorage.getItem("videosByCategorySheet"));
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
  localStorage.removeItem("videosByCategorySheet");
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


  // Record AllVideoStats to Google Sheets
  var videoValues = [
    ["Video ID", "Views", "Duration (sec)", "Likes", "Dislikes", "Comments"]
  ];
  var allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  for (var i = 0; i < allVideoStats.length; i++) {
    var row = [];
    row.push(allVideoStats[i]["videoId"]);
    row.push(allVideoStats[i]["views"]);
    row.push(allVideoStats[i]["duration"]);
    row.push(allVideoStats[i]["likes"]);
    row.push(allVideoStats[i]["dislikes"]);
    row.push(allVideoStats[i]["comments"]);
    videoValues.push(row);
  }
  var videoBody= {
    "values": videoValues
  };
  requestUpdateSheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Video Stats", videoBody);

  // Record categoryStats to Google Sheets
  var categoryValues = [
    ["Category ID", "Name", "Views", "Duration (sec)", "Likes", "Number of Videos", "Average Video Duration", "Average Video Likes", "Average Video Views"]
  ];
  for (var i = 0; i < categoryStats.length; i++) {
    var row = [];
    row.push(categoryStats[i]["categoryId"]);
    row.push(categoryStats[i]["name"]);
    row.push(categoryStats[i]["views"]);
    row.push(categoryStats[i]["duration"]);
    row.push(categoryStats[i]["likes"]);
    row.push(categoryStats[i]["numVideos"]);
    row.push(categoryStats[i]["avgDuration"]);
    row.push(categoryStats[i]["avgLikes"]);
    row.push(categoryStats[i]["avgViews"]);
    categoryValues.push(row);
  }
  var categoryBody = {
    "values": categoryValues
  };
  requestUpdateSheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Category Stats", categoryBody);
}

// Records category data from Google Sheet to localStorage.categoryStats
function recordCategoryData() {
  let categoriesSheet = JSON.parse(localStorage.getItem("categoriesSheet"));
  let columns = {};
  let columnHeaders = categoriesSheet[0];
  for (var i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  let categoryStats = [];
  let productCategoryIds = {};
  for (var i = 1; i < categoriesSheet.length; i++) {
    let categoryId = categoriesSheet[i][columns["Category ID"]]
    let categoryName = categoriesSheet[i][columns["Name"]];
    let views = parseInt(categoriesSheet[i][columns["Views"]]);
    let duration = parseInt(categoriesSheet[i][columns["Duration (sec)"]]);
    let likes = parseInt(categoriesSheet[i][columns["Likes"]]);
    let numVideos = parseInt(categoriesSheet[i][columns["Number of Videos"]]);
    let avgViews = parseFloat(categoriesSheet[i][columns["Average Video Views"]]);
    let avgLikes = parseFloat(categoriesSheet[i][columns["Average Video Likes"]]);
    let avgDuration = parseFloat(categoriesSheet[i][columns["Average Video Duration"]]);
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
    productCategoryIds[categoryId] = categoryName;
  }
  localStorage.removeItem("categoriesSheet");
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  localStorage.setItem("productCategoryIds", JSON.stringify(productCategoryIds));
}

// Records video data from Google Sheet to localStorage.allVideoStats & .uploads
function recordVideoData() {
  let videoSheet = JSON.parse(localStorage.getItem("videoSheet"));
  let columns = {};
  let columnHeaders = videoSheet[0];
  for (var i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  let uploads = [];
  let allVideoStats = [];
  for (var i = 1; i < videoSheet.length; i++) {
    let videoId = videoSheet[i][columns["Video ID"]];
    let viewCount = parseInt(videoSheet[i][columns["Views"]]);
    let duration = parseInt(videoSheet[i][columns["Duration (sec)"]]);
    let likeCount = parseInt(videoSheet[i][columns["Likes"]]);
    let dislikeCount = parseInt(videoSheet[i][columns["Dislikes"]]);
    let commentCount = parseInt(videoSheet[i][columns["Comments"]]);
    let likesPerView = likeCount / viewCount;
    let commentsPerView = commentCount / viewCount;
    let row = {
      "videoId": videoId,
      "views": viewCount,
      "likes": likeCount,
      "dislikes": dislikeCount,
      "duration": duration,
      "comments": commentCount,
      "likesPerView": likesPerView,
      "commentsPerView": commentsPerView
    };
    allVideoStats.push(row);
    uploads.push(videoId);
  }
  localStorage.removeItem("videoSheet");
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  localStorage.setItem("uploads", JSON.stringify(uploads));
}

// Displays thumbnails with arrows on Top Ten Dashboard
function displayTopTenThumbnails() {
  let topTenSheet = JSON.parse(localStorage.getItem("topTenSheet"));
  let numMonths = 12
  let output = ``;
  for (var i = 0; i < topTenSheet[0].length; i++) {
    for (var j = topTenSheet.length - numMonths; j < topTenSheet.length; j++) {
      if (i == 0) {
        output += `<div class="col-1 px-0"><h4>${topTenSheet[j][i]}</h4></div>`;
      } else {
        var videoId = topTenSheet[j][i];
        output += `<div class="col-1 top-ten-thumbnail-holder"><img class="top-ten-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail">`;
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
        output += `</div>`;
      }
    }
  }
  let thumbnailContainer = document.getElementById("top-ten-thumbnail-container");
  thumbnailContainer.innerHTML = output;
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

function sortVideosByLikesPerView() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
    return parseFloat(b["likesPerView"]) - parseFloat(a["likesPerView"]);
  });
  console.log("Videos Sorted by LikesPerView: ", allVideoStats);
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  displayTopVideos();
}

function sortVideosByCommentsPerView() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
    return parseFloat(b["commentsPerView"]) - parseFloat(a["commentsPerView"]);
  });
  console.log("Videos Sorted by CommentsPerView: ", allVideoStats);
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  displayTopVideos();
}

function displayTopVideos() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  let todayDate = getTodaysDate();
  let advertisedVideos = ["vio9VoZRkbQ", "dqkUlrFoZY4", "rNOoyOGBFK4", "Eyvv66xYwS8", "YfrmIjwDvXo"];
  let index = 0;
  let dashboardNum = 1;
  while (dashboardNum <= 10) {
    let videoId = allVideoStats[index]["videoId"];
    if (!advertisedVideos.includes(videoId)) {
      if (dashboardNum <= 5) {
        topVideoCalls(joinDate, todayDate, videoId, "top-video-" + dashboardNum);
      }
      // Display on top ten dashboard
      var thumbnail = document.getElementById("top-ten-" + dashboardNum + "-thumbnail");
      var viewsText = document.getElementById("top-ten-" + dashboardNum + "-views");
      viewsText.innerText = numberWithCommas(allVideoStats[index]["views"]) + " views";
      thumbnail.innerHTML = `<img class="top-video-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail">`;
      requestVideoTitle(videoId, "top-ten-" + dashboardNum);
      dashboardNum++;
    }
    index++;
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
    requestChannelNumVideos();
  }
}
showUploadThumbnails();

if (enabledOrder.includes("real-time-stats")) {
  loadRealTimeStats();
}