/* Handles recording data from Google Sheets and saving data to Google Sheets */

function recordYearlyCategoryViews(sheetValues) {
  let categoryStats = lsGet("categoryStats");
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
  return categoryTraces;
}

// Saves categoryStats to Google Sheets
function saveCategoryStatsToSheets(categoryStats) {
  var values = [
    ["Category ID", "Name", "Short Name", "Views", "Likes", "Duration (sec)",
      "Strength", "Average Video Views", "Average Video Likes",
      "Average Video Duration", "Videos", "Root", "Leaf"
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
    row.push(categoryStats[i]["avgStrength"]);
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
  const updatePromise = clearSpreadsheet("Stats", "Category Stats")
    .then(response => {
      return updateSheetData("Stats", "Category Stats", body);
    });
  return updatePromise;
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
      "Comments", "YouTube Publish Date", "Categories", "Created By", "Organic",
      "Strength", "Average View Duration", "Average View Percentage",
      "Average Views Per Day", "Days Since Published", "Subscribers Gained",
      "Likes Per View", "Dislikes Per View"
    ]
  ];
  const statsByVideoId = lsGet("statsByVideoId");
  for (var i = 0; i < allVideoStats.length; i++) {
    var videoId = allVideoStats[i]["videoId"];
    var row = [
      videoId,
      statsByVideoId[videoId]["title"],
      allVideoStats[i]["views"],
      allVideoStats[i]["likes"],
      allVideoStats[i]["dislikes"],
      statsByVideoId[videoId]["duration"],
      allVideoStats[i]["comments"],
      allVideoStats[i]["publishDate"],
      statsByVideoId[videoId]["categories"].join(","),
      statsByVideoId[videoId]["createdBy"],
      statsByVideoId[videoId]["organic"],
      allVideoStats[i]["strength"],
      allVideoStats[i]["avgViewDuration"],
      allVideoStats[i]["avgViewPercentage"],
      allVideoStats[i]["avgViewsPerDay"],
      allVideoStats[i]["daysSincePublished"],
      allVideoStats[i]["subscribersGained"],
      allVideoStats[i]["likesPerView"],
      allVideoStats[i]["dislikesPerView"]
    ];
    values.push(row);
  }
  const body = {
    "values": values
  };
  const updatePromise = clearSpreadsheet("Stats", "Video Stats")
    .then(response => {
      return updateSheetData("Stats", "Video Stats", body);
    });
  return updatePromise;
}

// Saves graphData to Google Sheets
function saveGraphDataToSheets(graphData, sheetName) {
  var removeItem = false;
  if (graphData == undefined) {
    graphData = lsGet("graphData");
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
  const updatePromise = clearSpreadsheet("Stats", sheetName)
    .then(response => {
      return updateSheetData("Stats", sheetName, body);
    });
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