/* Handles recording data from Google Sheets and saving data to Google Sheets */

// Records category IDs/names from Google Sheet
// Eventually initiates recordVideoListData()
function recordCategoryListData(categoryList) {
  let categoryTotals = {};
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

    // Set up root and leaf
    if (!/\d/.test(categoryId)) {
      root = true;
      name = level1;
    } else {
      let parentCategoryLvl1 = categoryId.match(/[A-Z]+/)[0];
      categoryTotals[parentCategoryLvl1].leaf = false;
      name = categoryTotals[parentCategoryLvl1].name + "->" + level2;
      if (categoryId.replace(/[A-Z]+[0-9]+/, "") != "") {
        let parentCategoryLvl2 = categoryId.match(/[A-Z]+[0-9]+/)[0];
        categoryTotals[parentCategoryLvl2].leaf = false;
        name = categoryTotals[parentCategoryLvl2].name + "->" + level3;
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
  localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));
  return categoryTotals;
}

// Records video IDs from Google Sheet
function recordVideoListData(videoList) {
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
      let duration = row[columns["Duration"]];
      let categoryString = row[columns["Categories"]];
      categoryString = categoryString.replace(/\s/g, ''); // Removes whitespace
      let initialCategories = categoryString.split(",");
      let allCategories = [];
      for (let j = 0; j < initialCategories.length; j++) {
        let categoryId = initialCategories[j];
        if (allCategories.indexOf(categoryId) == -1) {
          allCategories.push(categoryId);
        }
        if (/\d/.test(categoryId)) {
          let parentCategoryLvl1 = categoryId.match(/[A-Z]+/)[0];
          if (allCategories.indexOf(parentCategoryLvl1) == -1) {
            allCategories.push(parentCategoryLvl1);
          }
          if (categoryId.replace(/[A-Z]+[0-9]+/, "") != "") {
            let parentCategoryLvl2 = categoryId.match(/[A-Z]+[0-9]+/)[0];
            if (allCategories.indexOf(parentCategoryLvl2) == -1) {
              allCategories.push(parentCategoryLvl2);
            }
          }
        }
      }
      statsByVideoId[videoId] = {
        "categories": allCategories,
        "title": title,
        "publishDate": publishDate,
        "duration": duration
      };

      uploads.push(videoId);
    }
  }
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
  localStorage.setItem("uploads", JSON.stringify(uploads));
  return [statsByVideoId, uploads];
}

// Records category data from Google Sheet to localStorage.categoryStats
function recordCategoryStats(categoriesSheet) {
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
    let avgViews =
      parseFloat(categoriesSheet[i][columns["Average Video Views"]]);
    let avgLikes =
      parseFloat(categoriesSheet[i][columns["Average Video Likes"]]);
    let avgDuration =
      parseFloat(categoriesSheet[i][columns["Average Video Duration"]]);
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
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  return categoryStats;
}

// Records video data from Google Sheet to localStorage.allVideoStats, .uploads,
// and .statsByVideoId
function recordVideoData(videoSheet) {
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
    let categories = videoSheet[i][columns["Categories"]].replace(/\s/g, '');
    let row = {
      "videoId": videoId,
      "views": viewCount,
      "likes": likeCount,
      "dislikes": dislikeCount,
      "comments": commentCount
    };
    allVideoStats.push(row);
    if (!statsByVideoId[videoId]) {
      statsByVideoId[videoId] = {};
    }
    statsByVideoId[videoId]["title"] = title;
    statsByVideoId[videoId]["publishDate"] = publishDate;
    statsByVideoId[videoId]["duration"] = duration;
    statsByVideoId[videoId]["categories"] = categories;
    uploads.push(videoId);
  }
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
  localStorage.setItem("uploads", JSON.stringify(uploads));
}

// Displays graphs on dashboards
function recordGraphDataFromSheets(graphData) {
  let columns = {};
  let columnHeaders = graphData[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < graphData.length; i++) {
    let row = graphData[i];
    let graphId = row[columns["Graph ID"]];
    let data = JSON.parse(row[columns["Data"]]);
    let layout = JSON.parse(row[columns["Layout"]]);
    let config = JSON.parse(row[columns["Config"]]);
    let graphHeight = parseFloat(row[columns["Graph Height"]]);
    let graphWidth = parseFloat(row[columns["Graph Width"]]);
    let automargin = JSON.parse(row[columns["Automargin"]]);
    // Display graphs
    try {
      Plotly.newPlot(graphId, data, layout, config);
      if (automargin != "None") {
        recordGraphSize(graphId, graphHeight, graphWidth, automargin);
      } else {
        recordGraphSize(graphId, graphHeight, graphWidth);
      }
    } catch (err) {
      console.error(err);
      recordError(err);
    }
  }
}

// Displays top video stats on dashboards
function recordTopVideoStatsFromSheets(topVideoStatsSheet) {
  let columns = {};
  let columnHeaders = topVideoStatsSheet[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  let dashboardIds = {};
  let rows = [];
  for (let i = 1; i < topVideoStatsSheet.length; i++) {
    const row = topVideoStatsSheet[i];
    const videoId = row[columns["Video ID"]];
    const dashboardId = row[columns["Dashboard ID"]];
    const title = row[columns["Title"]];
    const duration = row[columns["Duration"]];
    const publishDate = row[columns["Publish Date"]];
    const thumbnail = row[columns["Thumbnail"]];
    const views = row[columns["Views"]];
    const subscribersGained = row[columns["Subscribers Gained"]];
    const avgViewDuration = row[columns["Average View Duration"]];
    const minutesWatched = row[columns["Estimated Minutes Watched"]];
    const comments = row[columns["Comments"]];
    const likes = parseInt(row[columns["Likes"]]);
    const dislikes = parseInt(row[columns["Dislikes"]]);
    try {
      document.getElementById(dashboardId + "-title").innerHTML = title;
      document.getElementById(dashboardId + "-duration").innerHTML =
        "Duration: " + secondsToDuration(duration);
      document.getElementById(dashboardId + "-duration-seconds").innerHTML =
        duration;
      document.getElementById(dashboardId + "-publish-date").innerHTML =
        "Published: " + publishDate;
      document.getElementById(dashboardId + "-thumbnail").innerHTML =
        thumbnail;
      const row = [
        videoId,
        views,
        comments,
        likes,
        dislikes,
        minutesWatched,
        avgViewDuration,
        subscribersGained,
        0
      ];
      rows.push(row);
      dashboardIds[videoId] = dashboardId;
    } catch (err) {
      const errorMsg = `Dashboard "${dashboardId}" does not exist - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    }
  }
  const response = {
    "result": {
      "rows": rows
    }
  };
  displayVideoBasicStats(response, dashboardIds);
}

// Records real time stats from Google Sheet to localStorage.realTimeStats
function recordRealTimeStatsFromSheets(realTimeStatsSheet) {
  let realTimeStats = {};
  let columns = {};
  let columnHeaders = realTimeStatsSheet[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < realTimeStatsSheet.length; i++) {
    let row = realTimeStatsSheet[i];
    let timeRange = row[columns["Time Range"]];
    let views = row[columns["Views"]];
    let estimatedMinutesWatched = row[columns["Estimated Minutes Watched"]];
    let averageViewDuration = row[columns["Average View Duration"]];
    let netSubscribersGained = row[columns["Subscribers Gained"]];
    realTimeStats[timeRange] = {
      "views": parseInt(views),
      "estimatedMinutesWatched": parseInt(estimatedMinutesWatched),
      "averageViewDuration": parseInt(averageViewDuration),
      "netSubscribersGained": parseInt(netSubscribersGained),
    };
  }
  localStorage.setItem("realTimeStats", JSON.stringify(realTimeStats));
  return realTimeStats;
}

function recordUploads(videoList) {
  let uploads = [];
  let columns = {};
  let columnHeaders = videoList[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = videoList.length - 1; i >= 1; i--) {
    let row = videoList[i];
    let videoId = row[columns["Video ID"]];
    uploads.push(videoId);
  }
  displayThumbnails(uploads);
}

function recordYearlyCategoryViews(sheetValues) {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  let categoryTraces = {};
  let years = [];
  for (var row = 1; row < sheetValues.length; row += 2) {
    let year = sheetValues[row][0].substr(0, 4);
    years.push(year);
  }
  categoryTraces["years"] = years;
  let yearlyTotals = new Array(years.length).fill(0);
  for (var column = 1; column < sheetValues[0].length; column++) {
    let categoryId = sheetValues[0][column];
    let categoryInfo = false;
    var index = 0;
    while (categoryInfo == false && index < categoryStats.length) {
      if (categoryStats[index]["categoryId"] == categoryId) {
        categoryInfo = categoryStats[index];
      }
      index++;
    }
    let root = categoryInfo["root"];
    if (root && categoryId != "A") {
      let viewTrace = [];
      let avgViewTrace = [];
      let cumulativeViews = [];
      let cumulativeAvgViewTrace = [];
      for (var row = 1; row < sheetValues.length; row += 2) {
        // Get views and numVideos for this year
        let yearViews = parseInt(sheetValues[row][column]);
        let numVideos = parseInt(sheetValues[row + 1][column]);
        viewTrace.push(yearViews);
        // Calculate cumulative views up to current year
        let previousSumViews = 0;
        if (row != 1) {
          previousSumViews = parseInt(cumulativeViews[((row - 1) / 2) - 1]);
        }
        let currentSumViews = previousSumViews + yearViews;
        cumulativeViews.push(currentSumViews);
        // Calculate average views for current year & cumulative average view
        // up to current year
        let avgView = 0;
        let cumulativeAvgView = 0;
        if (numVideos != 0) {
          avgView = (yearViews / numVideos).toFixed(0);
          cumulativeAvgView = (currentSumViews / numVideos).toFixed(0);
        }
        avgViewTrace.push(avgView);
        cumulativeAvgViewTrace.push(cumulativeAvgView);
        // Calculate yearly totals
        yearlyTotals[(row - 1) / 2] += parseInt(yearViews);
      }
      categoryTraces[categoryId] = {
        "name": categoryInfo["shortName"],
        "viewTrace": viewTrace,
        "avgViewTrace": avgViewTrace,
        "cumulativeViews": cumulativeViews,
        "cumulativeAvgViewTrace": cumulativeAvgViewTrace
      };
    }
  }
  categoryTraces["totals"] = yearlyTotals;
  saveCategoryTracesToSheets(categoryTraces);
  displayCategoryViewsAreaCharts(categoryTraces);
}

// Saves categoryStats to Google Sheets
function saveCategoryStatsToSheets(categoryStats) {
  var values = [
    ["Category ID", "Name", "Short Name", "Views", "Likes", "Duration (sec)",
      "Average Video Views", "Average Video Likes", "Average Video Duration",
      "Videos", "Root", "Leaf"
    ]
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
  const updatePromise = updateSheetData("Stats", "Category Stats", body);
  return updatePromise;
}

// Saves categoryTraces for the Category Area Charts to Google Sheets
function saveCategoryTracesToSheets(categoryTraces) {
  var body = {
    values: [
      [
        JSON.stringify(categoryTraces)
      ]
    ]
  };
  updateSheetData("Stats", "Category Traces", body);
}

// Saves categoryYearlyStats to Google Sheets
function saveCategoryYearlyStatsToSheets(categoryYearlyTotals, year) {
  var spreadsheetId = sheetNameToId("Stats");
  var request = {
    "spreadsheetId": spreadsheetId,
    "range": "Category Views By Year"
  };
  return gapi.client.sheets.spreadsheets.values.get(request)
    .then(response => {
      if (response) {
        sheetValues = response.result.values;
        let columnHeaders = sheetValues[0];
        let viewsRow = [];
        viewsRow.push(year + " Views");
        let numVideosRow = [];
        numVideosRow.push(year + " Number of Videos");
        for (let i = 1; i < columnHeaders.length; i++) {
          let categoryId = columnHeaders[i];
          let totals = categoryYearlyTotals[categoryId];
          let views = parseInt(totals["views"]);
          let numVideos = parseInt(totals["numVideos"]);
          viewsRow.push(views);
          numVideosRow.push(numVideos);
        }
        startingRowIndex = (2 * (year - 2010)) + 1;
        while (sheetValues.length < startingRowIndex + 2) {
          sheetValues.push([]);
        }
        sheetValues[startingRowIndex] = viewsRow;
        sheetValues[startingRowIndex + 1] = numVideosRow;

        var body = {
          "values": sheetValues
        };
        var sheetName = "Category Views By Year";
        updateSheetData("Stats", sheetName, body);
      }
    })
    .catch(err => {
      console.error("Category Views By Year Google Sheet not found", err);
      recordError(err);
    });
}

// Saves allVideoStats and statsByVideoId to Google Sheets
function saveVideoStatsToSheets(allVideoStats) {
  var values = [
    ["Video ID", "Title", "Views", "Likes", "Dislikes", "Duration (sec)",
      "Comments", "Publish Date", "Categories"
    ]
  ];
  const statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  for (var i = 0; i < allVideoStats.length; i++) {
    var row = [];
    var videoId = allVideoStats[i]["videoId"];
    row.push(videoId);
    row.push(statsByVideoId[videoId]["title"]);
    row.push(allVideoStats[i]["views"]);
    row.push(allVideoStats[i]["likes"]);
    row.push(allVideoStats[i]["dislikes"]);
    row.push(statsByVideoId[videoId]["duration"]);
    row.push(allVideoStats[i]["comments"]);
    row.push(statsByVideoId[videoId]["publishDate"]);
    row.push(statsByVideoId[videoId]["categories"].join(","));
    values.push(row);
  }
  const body = {
    "values": values
  };
  const updatePromise = updateSheetData("Stats", "Video Stats", body);
  return updatePromise;
}

// Saves graphData to Google Sheets
function saveGraphDataToSheets(graphData, sheetName) {
  var removeItem = false;
  if (graphData == undefined) {
    graphData = JSON.parse(localStorage.getItem("graphData"));
    var removeItem = true;
  }
  sheetName = sheetName || "Graph Data";
  var values = [
    ["Graph ID", "Data", "Layout", "Config", "Graph Height", "Graph Width",
      "Automargin"
    ]
  ];
  for (var graphId in graphData) {
    if (graphData.hasOwnProperty(graphId)) {
      var row = [];
      row.push(graphId);
      row.push(JSON.stringify(graphData[graphId]["data"]));
      row.push(JSON.stringify(graphData[graphId]["layout"]));
      row.push(JSON.stringify(graphData[graphId]["config"]));
      row.push(graphData[graphId]["graphHeight"]);
      row.push(graphData[graphId]["graphWidth"]);
      row.push(JSON.stringify(graphData[graphId]["automargin"]));
      values.push(row);
    }
  }
  const body = {
    "values": values
  };
  updateSheetData("Stats", sheetName, body);
  if (removeItem) {
    localStorage.removeItem("graphData");
  }
}

// Saves topVideoStats to Google Sheets
function saveTopVideoStatsToSheets(topVideoStats) {
  var values = [
    ["Video ID", "Dashboard ID", "Title", "Duration", "Publish Date",
      "Thumbnail", "Views", "Subscribers Gained", "Average View Duration",
      "Estimated Minutes Watched", "Comments", "Likes", "Dislikes"
    ]
  ];
  for (const videoId in topVideoStats) {
    if (topVideoStats.hasOwnProperty(videoId)) {
      const videoStats = topVideoStats[videoId];
      var row = [];
      row.push(videoId);
      row.push(videoStats["dashboardId"]);
      row.push(videoStats["title"]);
      row.push(videoStats["duration"]);
      row.push(videoStats["publishDate"]);
      row.push(videoStats["thumbnail"]);
      row.push(videoStats["views"]);
      row.push(videoStats["subscribersGained"]);
      row.push(videoStats["avgViewDuration"]);
      row.push(videoStats["minutesWatched"]);
      row.push(videoStats["comments"]);
      row.push(videoStats["likes"]);
      row.push(videoStats["dislikes"]);
      values.push(row);
    }
  }
  const body = {
    "values": values
  };
  const updatePromise = updateSheetData("Stats", "Top Video Stats", body);
  return updatePromise;
}

// Saves realTimeStats to Google Sheets
function saveRealTimeStatsToSheets(realTimeStats) {
  var values = [
    ["Time Range", "Views", "Estimated Minutes Watched",
      "Average View Duration", "Subscribers Gained"
    ]
  ];
  for (const timeRange in realTimeStats) {
    if (realTimeStats.hasOwnProperty(timeRange)) {
      var row = [];
      row.push(timeRange);
      row.push(realTimeStats[timeRange]["views"]);
      row.push(realTimeStats[timeRange]["estimatedMinutesWatched"]);
      row.push(realTimeStats[timeRange]["averageViewDuration"]);
      row.push(realTimeStats[timeRange]["netSubscribersGained"]);
      values.push(row);
    }
  }
  const body = {
    "values": values
  };
  const updatePromise = updateSheetData("Stats", "Real Time Stats", body);
  return updatePromise;
}

function getCardPerformanceForCurrMonth() {
  const [startDate, endDate, month] = getCurrMonth();
  const request = requestCardPerformance(startDate, endDate, month);
  return request.then(cardData => {
    const body = {
      "values": [cardData]
    };
    const row = 3 + monthDiff(new Date(2017, 9), new Date(month));
    const sheet = "Card Performance!A" + row;
    return updateSheetData("Stats", sheet, body);
  });
}

// Saves top ten videos by views this month to Google Sheets
function getTopTenVideosForCurrMonth() {
  const [startDate, endDate, month] = getCurrMonth();
  const request = requestMostWatchedVideos(startDate, endDate, 20, month);
  return request.then(response => {
    const body = {
      "values": response
    };
    const row = 3 + monthDiff(new Date(2010, 6), new Date(month));
    const sheet = "Top Ten Videos!A" + row;
    return updateSheetData("Stats", sheet, body)
      .then(response => {
        return "Updated Top Ten Video Sheet";
      });
  });
}