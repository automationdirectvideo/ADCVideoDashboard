// Updates total views, likes, etc. for each category given all video stats
function updateCategoryTotals(allVideoStats) {
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));

  allVideoStats.forEach(videoInfo => {
    let videoId = videoInfo.videoId;
    let duration = videoInfo.duration;
    let viewCount = videoInfo.views;
    let likeCount = videoInfo.likes;

    statsByVideoId[videoId]["duration"] = duration;
    let categories = statsByVideoId[videoId]["categories"];
    for (let i = 0; i < categories.length; i++) {
      let categoryId = categories[i];
      if (categoryTotals[categoryId] == undefined) {
        categoryTotals[categoryId] = {};
        categoryTotals[categoryId]["videos"] = [];
      }
      let categoryViews = parseInt(categoryTotals[categoryId]["views"]);
      let categoryLikes = parseInt(categoryTotals[categoryId]["likes"]);
      let categoryDuration = parseInt(categoryTotals[categoryId]["duration"]);
      let categoryVideos = categoryTotals[categoryId]["videos"];
      categoryVideos.push(videoId);
      categoryTotals[categoryId]["views"] = categoryViews + viewCount;
      categoryTotals[categoryId]["likes"] = categoryLikes + likeCount;
      categoryTotals[categoryId]["duration"] = categoryDuration + duration;
      categoryTotals[categoryId]["videos"] = categoryVideos;
    }
  });
  localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));

  return categoryTotals;
}

// Calculate stats for each category given totals for each category
function calcCategoryStats(categoryTotals) {
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
  
  return categoryStats;
}

function updateDashboards() {
  const now = new Date();
  let requests = [];
  // checks that today is between Jan 10-20 ish
  if (now.getMonth() == 0 && now.getDate() >= 10 &&
      now.getDate <= 20) {
    let lastYear = now.getFullYear() - 1;
    requests.push(getYearlyCategoryViews(lastYear));
  }
  requests.push(getTopTenVideosForCurrMonth());
  requests.push(getCardPerformanceForCurrMonth());
  requests.push(realTimeStatsCalls());
  requests.push(updateVideoAndCategoryStats());
  return Promise.all(requests)
    .then(response => {
      console.log("Update Dashboards Complete", response);
      loadDashboards();
    })
    .catch(err => {
      console.error("Error occurred updating dashboards", err);
    });
}

function updateVideoAndCategoryStats() {
  const categoryPromise = getCategoryList();
  const videoPromise = getVideoList();
  return Promise.all([categoryPromise, videoPromise])
    .then(response => {
      let categoryTotals = response[0];
      let statsByVideoId = response[1][0];
      let uploads = response[1][1];
      console.log("categoryTotals:", categoryTotals);
      console.log("statsByVideoId:", statsByVideoId);
      console.log("uploads:", uploads);
      displayUploadThumbnails();
      getAllVideoStats(uploads);
    });
}

function getCategoryList() {
  return requestSpreadsheetData("Input Data", "Category List")
    .then(categoryList => {
      let categoryTotals = recordCategoryListData(categoryList);
      return categoryTotals;
    });
}

function getVideoList() {
  return requestSpreadsheetData("Input Data", "Video List")
    .then(videoList => {
      // returns [statsByVideoId, uploads]
      return recordVideoListData(videoList);
    });
}

function getCategoryStats() {
  return requestSpreadsheetData("Stats", "Category Stats")
    .then(categoriesSheet => {
      let categoryStats = recordCategoryStats(categoriesSheet);
      return categoryStats;
    });
}

function getVideoStats() {
  return requestSpreadsheetData("Stats", "Video Stats")
    .then(videoSheet => recordVideoData(videoSheet));
}

function loadChannelDemographics() {
  return requestSpreadsheetData("Stats", "Channel Demographics")
    .then(response => {
      var rows = JSON.parse(response[0][0]);
      var newResponse = {
        "result": {
          "rows": rows
        }
      };
      displayChannelDemographics(newResponse);
    });
}

function loadTopTenDashboard() {
  return requestSpreadsheetData("Stats", "Top Ten Videos")
    .then(topTenSheet => displayTopTenThumbnails(topTenSheet));
}

function loadUserFeedbackDashboard() {
  return requestSpreadsheetData("Input Data", "User Feedback List")
    .then(feedbackSheet => displayUserFeedback(feedbackSheet));
}

function loadCardPerformanceDashboard() {
  return requestSpreadsheetData("Stats", "Card Performance")
    .then(cardData => displayCardPerformanceCharts(cardData));
}

function loadRealTimeStatsDashboard() {
  return requestSpreadsheetData("Stats", "Real Time Stats")
    .then(realTimeStatsSheet => {
      let realTimeStats = recordRealTimeStatsFromSheets(realTimeStatsSheet);
      displayRealTimeStats(realTimeStats);
    });
}

function loadGraphsFromSheets() {
  return requestSpreadsheetData("Stats", "Graph Data")
    .then(graphData => recordGraphDataFromSheets(graphData));
}

function loadTopVideoStats() {
  return requestSpreadsheetData("Stats", "Top Video Stats")
    .then(topVideoStatsSheet => {
      recordTopVideoStatsFromSheets(topVideoStatsSheet);
    });
}

function loadCategoryCharts() {
  return requestSpreadsheetData("Stats", "Category Traces")
    .then(response => {
      let categoryTraces = JSON.parse(response[0][0]);
      displayCategoryViewsAreaCharts(categoryTraces);
    });
}