/* Handles recording data from Google Sheets and saving data to Google Sheets */

// Records category IDs/names from Google Sheet
// Eventually initiates recordVideoListData()
function recordCategoryListData() {
  let categoryList = JSON.parse(localStorage.getItem("categoryListSheet"));
  let categoryTotals = {}; // categoryId : {shortName, name, root, leaf, views, likes, duration, numVideos}
  let columns = {};
  let columnHeaders = categoryList[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < categoryList.length; i++) {
    let row = categoryList[i];
    let categoryId = row[columns["Category ID"]];
    let level1 = row[columns["L1 Category"]];
    let level2 = row[columns["L2 Category"]];
    let level3 = row[columns["L3 Category"]];
    let name = "";
    let shortName = row[columns["Short Name"]];
    let root = false;
    let leaf = true;

    // Set up name
    if (level2 == undefined || level2 == "") {
      name = level1;
    } else if (level3 == undefined || level3 == "") {
      name = level1 + "->" + level2;
    } else {
      name = level1 + "->" + level2 + "->" + level3;
    }
    // Set up root and leaf
    if (categoryId.slice(-4) == "0000") {
      root = true;
    } else {
      let parentCategoryLvl1 = categoryId.slice(0, -4) + "0000";
      categoryTotals[parentCategoryLvl1].leaf = false;
      if (categoryId.slice(-2) != "00") {
        let parentCategoryLvl2 = categoryId.slice(0, -2) + "00";
        categoryTotals[parentCategoryLvl2].leaf = false;
      }
    }

    categoryTotals[categoryId] = {
      "shortName": shortName,
      "name": name,
      "root": root,
      "leaf": leaf,
      "views": 0,
      "likes": 0,
      "duration": 0,
      "videos": []
    };
  }
  localStorage.removeItem("categoryListSheet");
  localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));

  requestSpreadsheetData("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Video List");
}

// Records video IDs from Google Sheet
// Initiates displayUploadThumbnails() and getAllVideoStats()
function recordVideoListData() {
  let videoList = JSON.parse(localStorage.getItem("videoListSheet"));
  let statsByVideoId = {};
  let uploads = [];
  let columns = {};
  let columnHeaders = videoList[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < videoList.length; i++) {
    let row = videoList[i];
    let organic = ("TRUE" === row[columns["Organic"]]);
    if (organic) {
      let videoId = row[columns["Video ID"]];
      let title = row[columns["Title"]];
      let publishDate = row[columns["Publish Date"]];
      let categoryString = row[columns["Categories"]];
      categoryString.replace(/\s/g, ''); // Removes whitespace
      statsByVideoId[videoId] = {
        "categories": categoryString.split(","),
        "title": title,
        "publishDate": publishDate
      };

      uploads.push(videoId);
    }
  }
  localStorage.removeItem("videoListSheet");
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
  localStorage.setItem("uploads", JSON.stringify(uploads));

  displayUploadThumbnails();
  getAllVideoStats(uploads);
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
  for (var i = 1; i < categoriesSheet.length; i++) {
    let categoryId = categoriesSheet[i][columns["Category ID"]]
    let name = categoriesSheet[i][columns["Name"]];
    let shortName = categoriesSheet[i][columns["Short Name"]];
    let views = parseInt(categoriesSheet[i][columns["Views"]]);
    let likes = parseInt(categoriesSheet[i][columns["Likes"]]);
    let duration = parseInt(categoriesSheet[i][columns["Duration (sec)"]]);
    let avgViews = parseFloat(categoriesSheet[i][columns["Average Video Views"]]);
    let avgLikes = parseFloat(categoriesSheet[i][columns["Average Video Likes"]]);
    let avgDuration = parseFloat(categoriesSheet[i][columns["Average Video Duration"]]);
    let videosString = categoriesSheet[i][columns["Videos"]];
    let videos = videosString.split(",");
    let root = ("TRUE" === categoriesSheet[i][columns["Root"]]);
    let leaf = ("TRUE" === categoriesSheet[i][columns["Leaf"]]);
    categoryStats.push({
      "categoryId": categoryId,
      "name": name,
      "shortName": shortName,
      "views": views,
      "likes": likes,
      "duration": duration,
      "avgViews": avgViews,
      "avgLikes": avgLikes,
      "avgDuration": avgDuration,
      "videos": videos,
      "root": root,
      "leaf": leaf,
    });
  }
  localStorage.removeItem("categoriesSheet");
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
}

// Records video data from Google Sheet to localStorage.allVideoStats, .uploads,
// and .statsByVideoId
function recordVideoData() {
  let videoSheet = JSON.parse(localStorage.getItem("videoSheet"));
  let columns = {};
  let columnHeaders = videoSheet[0];
  for (var i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  let uploads = [];
  let allVideoStats = [];
  let statsByVideoId = {};
  for (var i = 1; i < videoSheet.length; i++) {
    let videoId = videoSheet[i][columns["Video ID"]];
    let title = videoSheet[i][columns["Title"]];
    let viewCount = parseInt(videoSheet[i][columns["Views"]]);
    let likeCount = parseInt(videoSheet[i][columns["Likes"]]);
    let dislikeCount = parseInt(videoSheet[i][columns["Dislikes"]]);
    let duration = parseInt(videoSheet[i][columns["Duration (sec)"]]);
    let commentCount = parseInt(videoSheet[i][columns["Comments"]]);
    let publishDate = videoSheet[i][columns["Publish Date"]].substr(0, 10);
    let row = {
      "videoId": videoId,
      "views": viewCount,
      "likes": likeCount,
      "dislikes": dislikeCount,
      "duration": duration,
      "comments": commentCount
    };
    allVideoStats.push(row);
    statsByVideoId[videoId] = {
      "title": title,
      "publishDate": publishDate
    };
    uploads.push(videoId);
  }
  localStorage.removeItem("videoSheet");
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
  localStorage.setItem("uploads", JSON.stringify(uploads));
}

// Saves categoryStats to Google Sheets
function saveCategoryStatsToSheets() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  var values = [
    ["Category ID", "Name", "Short Name", "Views", "Likes", "Duration (sec)",
    "Average Video Views", "Average Video Likes", "Average Video Duration",
    "Videos", "Root", "Leaf"]
  ];
  for (var i = 0; i < categoryStats.length; i++) {
    var row = [];
    row.push(categoryStats[i]["categoryId"]);
    row.push(categoryStats[i]["name"]);
    row.push(categoryStats[i]["shortName"]);
    row.push(categoryStats[i]["views"]);
    row.push(categoryStats[i]["likes"]);
    row.push(categoryStats[i]["duration"]);
    row.push(categoryStats[i]["avgViews"]);
    row.push(categoryStats[i]["avgLikes"]);
    row.push(categoryStats[i]["avgDuration"]);
    row.push(categoryStats[i]["videos"].join(","));
    row.push(categoryStats[i]["root"]);
    row.push(categoryStats[i]["leaf"]);
    values.push(row);
  }
  var body = {
    "values": values
  };
  requestUpdateSheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Category Stats", body);
}

// Saves allVideoStats and statsByVideoId to Google Sheets
function saveVideoStatsToSheets() {
  var values = [
    ["Video ID", "Title", "Views", "Likes", "Dislikes", "Duration (sec)", "Comments", "Publish Date"]
  ];
  var allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  var statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  for (var i = 0; i < allVideoStats.length; i++) {
    var row = [];
    var videoId = allVideoStats[i]["videoId"];
    row.push(videoId);
    row.push(statsByVideoId[videoId]["title"]);
    row.push(allVideoStats[i]["views"]);
    row.push(allVideoStats[i]["likes"]);
    row.push(allVideoStats[i]["dislikes"]);
    row.push(allVideoStats[i]["duration"]);
    row.push(allVideoStats[i]["comments"]);
    row.push(statsByVideoId[videoId]["publishDate"]);
    values.push(row);
  }
  var body= {
    "values": values
  };
  requestUpdateSheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Video Stats", body);
}

// Saves top ten videos by views this month to Google Sheets
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