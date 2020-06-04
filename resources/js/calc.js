// Updates total views, likes, etc. for each category given all video stats
function updateCategoryTotals(allVideoStats) {
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));

  allVideoStats.forEach(videoInfo => {
    let videoId = videoInfo.videoId;
    let duration = videoInfo.duration;
    let viewCount = videoInfo.views;
    let likeCount = videoInfo.likes;
    let strength = videoInfo.strength;

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
      let categoryStrength = parseFloat(categoryTotals[categoryId]["strength"]);
      let categoryVideos = categoryTotals[categoryId]["videos"];
      categoryVideos.push(videoId);
      categoryTotals[categoryId]["views"] = categoryViews + viewCount;
      categoryTotals[categoryId]["likes"] = categoryLikes + likeCount;
      categoryTotals[categoryId]["duration"] = categoryDuration + duration;
      categoryTotals[categoryId]["strength"] = categoryStrength + strength;
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
      let totalStrength = parseFloat(totals["strength"]);
      let videos = totals["videos"];
      let numVideos = videos.length;
      let avgViews = views / numVideos;
      let avgLikes = likes / numVideos;
      let avgDuration = duration / numVideos;
      let avgStrength = totalStrength / numVideos;
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
        "totalStrength": totalStrength,
        "avgStrength": avgStrength,
        "videos": videos,
        "views": views
      });
    }
  }
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));

  return categoryStats;
}

function updateDashboards() {
  // Prevent multiple simultaneous load/update dashboard calls
  if (!isLoading && !isUpdating) {
    isUpdating = true;
    showUpdatingText();
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
        recordUpdate("Dashboards Updated");
        hideUpdatingText();
        isUpdating = false;
        return loadDashboards();
      })
      .catch(err => {
        recordUpdate("Update Failed");
        const errorMsg = "Error occurred updating dashboards: ";
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      })
      .finally(response => {
        hideUpdatingText();
        isUpdating = false;
      });
  }
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
      return getAllVideoStats(uploads);
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

function getCategoryAndVideoStats() {
  const categoryPromise = getCategoryStats();
  const videoPromise = getVideoStats();
  return Promise.all([categoryPromise, videoPromise]);
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
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (isSignedIn) {
    try {
      displayRealTimeStats();
      return Promise.resolve("Displayed Real Time Stats");
    } catch (err) {
      recordError(err);
      return realTimeStatsCalls();
    }
  } else {
    return requestSpreadsheetData("Stats", "Real Time Stats")
      .then(realTimeStatsSheet => {
        let realTimeStats = recordRealTimeStatsFromSheets(realTimeStatsSheet);
        displayRealTimeStats(realTimeStats);
      });
  }
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

function loadProductCategoriesDashboard() {
  displayTopCategoriesGraphOne();
  displayTopCategoriesGraphTwo();
  displayTopCategoriesGraphThree();
  return Promise.resolve("Displayed Product Categories Dashboard");
}

function loadThumbnailDashboard() {
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (isSignedIn) {
    const numVideosRequest = requestChannelNumVideos();
    const thumbnailsRequest = displayUploadThumbnails();
    return Promise.all([numVideosRequest, thumbnailsRequest]);
  } else {
    return displayUploadThumbnails();
  }
}

function loadTopVideoDashboards() {
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  const todayDate = getTodaysDate();
  let topVideoList = [];
  let dashboardIds = {};
  if (carouselInner.children["top-video-1"]) {
    let plcVideo = getTopVideoByCategory("B", "views")[0];
    if (plcVideo != undefined) {
      dashboardIds[plcVideo] = "top-video-1";
      topVideoList.push(plcVideo);
    }
  }
  if (carouselInner.children["top-video-2"]) {
    let drivesVideo = getTopVideoByCategory("C", "views")[0];
    if (drivesVideo != undefined) {
      dashboardIds[drivesVideo] = "top-video-2";
      topVideoList.push(drivesVideo);
    }
  }
  if (carouselInner.children["top-video-3"]) {
    let hmiVideo = getTopVideoByCategory("D", "views")[0];
    if (hmiVideo != undefined) {
      dashboardIds[hmiVideo] = "top-video-3";
      topVideoList.push(hmiVideo);
    }
  }
  if (carouselInner.children["top-video-4"]) {
    let motionControlVideo = getTopVideoByCategory("F", "views")[0];
    if (motionControlVideo != undefined) {
      dashboardIds[motionControlVideo] = "top-video-4";
      topVideoList.push(motionControlVideo);
    }
  }
  if (carouselInner.children["top-video-5"]) {
    let sensorsVideo = getTopVideoByCategory("H", "views")[0];
    if (sensorsVideo != undefined) {
      dashboardIds[sensorsVideo] = "top-video-5";
      topVideoList.push(sensorsVideo);
    }
  }
  if (carouselInner.children["top-video-6"]) {
    let motorsVideo = getTopVideoByCategory("I", "views")[0];
    if (motorsVideo != undefined) {
      dashboardIds[motorsVideo] = "top-video-6";
      topVideoList.push(motorsVideo);
    }
  }
  if (topVideoList.length == 0) {
    return null;
  }
  const topVideosStr = topVideoList.join(",");
  return topVideoCalls(joinDate, todayDate, topVideosStr, dashboardIds);
}


/* Statistics Functions */

// Calculates the average for a list of numerical data
function average(data) {
  let sum = data.reduce((sum, value) => {
    return sum + value;
  }, 0);

  let avg = sum / data.length;
  return avg;
}
// Calculates the standard deviation for a list of numerical data
function standardDeviation(data, avg) {
  let squareDiffs = data.map(value => {
    let diff = value - avg;
    let squareDiff = diff ** 2;
    return squareDiff;
  });
  let avgSquareDiff = average(squareDiffs);
  let stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

// Calculates the z-score of a value given data's average and standard deviation
function zScore(value, avg, stdDev) {
  let diff = value - avg;
  let z = diff / stdDev;
  return z;
}

// Calculates the z-score for every value in the list of numerical data
function zScoreForList(data) {
  let avg = average(data);
  let stdDev = standardDeviation(data, avg);
  let zScores = data.map((value) => {
    return zScore(value, avg, stdDev);
  });
  return zScores;
}

// This function was designed to be used with a list of objects
// e.g. stats = [{x: 2, y: 3}, {x: 1, y: 5}]
// Creates a list of zScores corresponding to a key (propertyName) in each
// element of stats like "x" or "y" in the example above
function zScoreByPropertyName(stats, propertyName) {
  let data = stats.map((value) => {return value[propertyName]});
  let zScores = zScoreForList(data);
  let zScoresUpdated = zScores.map((value) => {
    if (value > 4) {
      return 4;
    } else if (value < -4) {
      return -4;
    } else {
      return value;
    }
  });
  return zScoresUpdated;
}

// Calculates the "strength" of each video
// See https://stats.stackexchange.com/q/154888 for concepts used to combine
// multiple metrics into a single metric (strength)
function calcVideoStrength(allVideoStats) {
  // Normalizes each metric individually across all videos
  let zScoreData = {
    videoIds: allVideoStats.map((video) => {return video["videoId"]}),
    views: zScoreByPropertyName(allVideoStats, "views"),
    avgViewsPerDay: zScoreByPropertyName(allVideoStats, "avgViewsPerDay"),
    duration: zScoreByPropertyName(allVideoStats, "duration"),
    comments: zScoreByPropertyName(allVideoStats, "comments"),
    likesPerView: zScoreByPropertyName(allVideoStats, "likesPerView"),
    dislikesPerView: zScoreByPropertyName(allVideoStats, "dislikesPerView"),
    subscribersGained: zScoreByPropertyName(allVideoStats, "subscribersGained"),
    avgViewDuration: zScoreByPropertyName(allVideoStats, "avgViewDuration"),
    avgViewPercentage: zScoreByPropertyName(allVideoStats, "avgViewPercentage"),
    daysSincePublished: zScoreByPropertyName(allVideoStats,
      "daysSincePublished")
  };
  for (let index = 0; index < zScoreData.videoIds.length; index++) {
    const videoId = zScoreData.videoIds[index];
    const views = zScoreData.views[index];
    const avgViewsPerDay = zScoreData.avgViewsPerDay[index];
    const duration = zScoreData.duration[index];
    const comments = zScoreData.comments[index];
    const likesPerView = zScoreData.likesPerView[index];
    const dislikesPerView = zScoreData.dislikesPerView[index];
    const subscribersGained = zScoreData.subscribersGained[index];
    const avgViewDuration = zScoreData.avgViewDuration[index];
    const avgViewPercentage = zScoreData.avgViewPercentage[index];
    const daysSincePublished = zScoreData.daysSincePublished[index];
    // Change the integers (weights) to balance each metric's contribution
    let strength =
      (1.5 * views) +
      (1 * avgViewsPerDay) +
      (0.5 * comments) +
      (0.5 * likesPerView) +
      (1.5 * subscribersGained) +
      (1 * avgViewPercentage) -
      (0.5 * dislikesPerView);
    allVideoStats[index].strength = strength;
  }
  allVideoStats.sort(function (a,b) {
    return a.strength - b.strength;
  });
  let zScoreStrengths = zScoreByPropertyName(allVideoStats, "strength");
  let length = zScoreStrengths.length;
  let lowPercentile = Math.floor(length * 0);
  let highPercentile = Math.floor(length - 1);
  let min = zScoreStrengths[lowPercentile]
  let range = zScoreStrengths[highPercentile] - min;
  if (range == 0) {
    // Avoid a divide by zero error later on
    range = 1;
  }
  // Normalize all strength values to between 0-100
  for (let index = 0; index < allVideoStats.length; index++) {
    let strength = zScoreStrengths[index];
    let normalizedStrength = (((strength - min) / range) * 100);
    allVideoStats[index].strength = normalizedStrength;
  }
  return allVideoStats;
}

function getTopVideosByStrength(numVideos) {
  let statsByVideoId = JSON.parse(localStorage.statsByVideoId);
  let allVideoStats = JSON.parse(localStorage.allVideoStats);
  allVideoStats.sort(function (a, b) {
    return b.strength - a.strength;
  });
  for (let index = 0; index < numVideos; index++) {
    const video = allVideoStats[index];
    const videoId = video.videoId;
    const strength = video.strength;
    const title = statsByVideoId[videoId].title;
    console.log(`${index + 1}. ${strength} - ${videoId}: ${title}`);
  }
}