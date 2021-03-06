/* Handles recording data from Google Sheets and saving data to Google Sheets */

// Saves categoryStats to Google Sheets
function saveCategoryStatsToSheets(categoryStats) {
  var values = [
    ["Category ID", "Name", "Short Name", "Views", "Likes", "Duration (sec)",
      "Strength", "Average Video Views", "Average Video Likes",
      "Average Video Duration", "Videos", "Videos With Strength", "Root", "Leaf"
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
    row.push(categoryStats[i]["videosWithStrength"].join(","));
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
    lsRemove("graphData");
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

function saveVideographerStatsToSheets(videographers = lsGet("videographers")) {
  let headers = [
    "Label",
    "avgComments",
    "avgDislikes",
    "avgDuration",
    "avgLikeRatio",
    "avgLikes",
    "avgSubsGained",
    "avgViewPercentage",
    "avgViewPercentageLastXDays",
    "avgViews",
    "cumLikeRatio",
    "minWatched",
    "minWatchedLastXDays",
    "numVideos",
    "numVideosLastXDays",
    "totalComments",
    "totalDislikes",
    "totalDuration",
    "totalLikeRatio",
    "totalLikes",
    "totalSubsGained",
    "totalViews",
  ];
  let values = [headers];
  for (const name in videographers) {
    if (videographers.hasOwnProperty(name)) {
      const categories = videographers[name];
      for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
          const stats = categories[category];
          const categoryName = name + "-" + category;
          let row = [categoryName];
          for (let index = 1; index < headers.length; index++) {
            const property = headers[index];
            row.push(stats[property]);
          }
          values.push(row);
        }
      }
    }
  }
  const body = {
    "values": values
  };
  const updatePromise = updateSheetData("Stats", "Videographer Stats", body);
  return updatePromise;
}

function saveVideographerViewsToSheets(videographers) {
  let headers = [];
  let monthData = {};
  let names = Object.keys(videographers);
  names.sort();
  names.forEach(name => {
    const categories = videographers[name];
    for (const category in categories) {
      if (categories.hasOwnProperty(category)) {
        const data = categories[category].monthlyViews;
        const categoryName = name + "-" + category;
        headers.push(categoryName);
        for (const month in data) {
          if (data.hasOwnProperty(month)) {
            const views = data[month];
            if (!monthData[month]) {
              monthData[month] = {};
            }
            monthData[month][categoryName] = views;
          }
        }
      }
    }
  });
  let values = [];
  for (const month in monthData) {
    if (monthData.hasOwnProperty(month)) {
      const data = monthData[month];
      let dataList = [month];
      headers.forEach(categoryName => {
        const views = data[categoryName];
        dataList.push(views);
      });
      values.push(dataList);
    }
  }
  // Sorts month data by month from earliest to latest
  values.sort(function (a, b) {
    return new Date(a[0]) - new Date(b[0]);
  });
  headers.unshift("Month");
  values.unshift(headers);
  const body = {
    "values": values
  };
  const updatePromise = clearSpreadsheet("Stats", "Category Stats")
    .then(response => {
      return updateSheetData("Stats", "Videographer Monthly Views", body);
    });
  return updatePromise;
}


/* Google Sheets API Calls */

function clearSpreadsheet(sheetName, range) {
  const spreadsheetId = sheetNameToId(sheetName);
  if (spreadsheetId != "") {
    const request = {
      "spreadsheetId": spreadsheetId,
      "range": range
    };
    const sheetPromise = gapi.client.sheets.spreadsheets.values.clear(request)
      .then(response => {
        const successMessage = `Spreadsheet Cleared: ${range}`
        console.log(successMessage);
        return Promise.resolve(successMessage);
      })
      .catch(err => {
        const errorMsg = `Unable to get sheet: "${range}"`;
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      });
    return sheetPromise;
  } else {
    const errorMsg = `No spreadsheet exists with sheetName: "${sheetName}"`;
    console.error(errorMsg);
    const sheetError = new Error(errorMsg);
    recordError(sheetError);
  }
}

/**
 * Gets spreadsheet cells from Google Sheets
 *
 * @param {String} sheetName The common name of the Google Sheet
 * @param {String} range The tab/sheet of the desired sheet
 * @returns {Promise} Spreadsheet data
 */
function requestSpreadsheetData(sheetName, range) {
  const spreadsheetId = sheetNameToId(sheetName);
  if (spreadsheetId != "") {
    const request = {
      "spreadsheetId": spreadsheetId,
      "range": range
    };
    const sheetPromise = gapi.client.sheets.spreadsheets.values.get(request)
      .then(response => {
        console.log(`SpreadsheetData: ${range}`);
        return Promise.resolve(response.result.values);
      })
      .catch(err => {
        const errorMsg = `Unable to get sheet: "${range}"`;
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      });
    return sheetPromise;
  } else {
    const errorMsg = `No spreadsheet exists with sheetName: "${sheetName}"`;
    console.error(errorMsg);
    const sheetError = new Error(errorMsg);
    recordError(sheetError);
    return Promise.reject(errorMsg);
  }
}

function updateSheetData(sheetName, range, body) {
  const spreadsheetId = sheetNameToId(sheetName);
  if (spreadsheetId != "") {
    const request = {
      "spreadsheetId": spreadsheetId,
      "range": range,
      "valueInputOption": "RAW",
      "resource": body
    };
    const updatePromise = gapi.client.sheets.spreadsheets.values.update(request)
      .then(response => {
        console.log(`UpdateSheetData: ${range}`);
        return Promise.resolve(response);
      })
      .catch(err => {
        const errorMsg = `Unable to update sheet: "${range}" - `;
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      });
    return updatePromise;
  } else {
    const errorMsg = `No spreadsheet exists with sheetName: "${sheetName}"`;
    console.error(errorMsg);
    const sheetError = new Error(errorMsg);
    recordError(sheetError);
  }
}