/* Sends requests to API call functions */


/* 1000 Thumbnail Dashboard Calls */

// Request number of videos the channel has
function requestChannelNumVideos() {
  let request = {
    part: "statistics",
    forUsername: "automationdirect"
  };
  return gapi.client.youtube.channels.list(request)
    .then(response => {
      const numVideos = response.result.items[0].statistics.videoCount;
      document.getElementById("num-videos").innerText = numVideos;
    })
    .catch(err => {
      const errorMsg = "Unable to get number of channel videos: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

/* Get All Video Stats Calls */

function getAllVideoStats(videos) {
  let requests = [];
  for (let i = 0; i < videos.length; i += 50) {
    const fiftyVideos = videos.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    const gapiRequest = {
      "part": "statistics,contentDetails",
      "id": fiftyVideosStr
    };
    const request = gapi.client.youtube.videos.list(gapiRequest)
      .then(response => {
        console.log(`Video Request`, response);
        let stats = [];
        const videoItems = response.result.items;
        for (let index = 0; index < videoItems.length; index++) {
          const video = videoItems[index];
          const videoId = video.id;
          const videoStats = video.statistics;
          const durationStr = video.contentDetails.duration;
          const duration = parseInt(isoDurationToSeconds(durationStr));
          const viewCount = parseInt(videoStats.viewCount);
          const likeCount = parseInt(videoStats.likeCount);
          const dislikeCount = parseInt(videoStats.dislikeCount);
          const commentCount = parseInt(videoStats.commentCount);
          stats.push({
            "videoId": videoId,
            "views": viewCount,
            "likes": likeCount,
            "dislikes": dislikeCount,
            "comments": commentCount,
            "duration": duration
          });
        }
        // Return for post-processing of the data elsewhere
        return stats;
      })
      .catch(err => {
        const errorMsg = `Error in fetching stats for video group` +
          ` ${i} - ${i + 49}: `;
        console.log(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  return Promise.all(requests)
    .then(response => {
      console.log(response);
      let allVideoStats = [].concat.apply([], response);
      localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
      let categoryTotals = updateCategoryTotals(allVideoStats);
      let categoryStats = calcCategoryStats(categoryTotals);

      const catRequest = saveCategoryStatsToSheets(categoryStats);
      const videoRequest = saveVideoStatsToSheets(allVideoStats);
      const topTenRequest = getTopTenVideosForCurrMonth();
      return Promise.all([catRequest, videoRequest, topTenRequest]);
    });
}

function requestVideoViewsByYear(uploads, year) {
  let requests = [];
  const startDate = year + "-01-01";
  const endDate = year + "-12-31";

  for (let i = 0; i < uploads.length; i += 50) {
    const fiftyVideos = uploads.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    const filters = "video==" + fiftyVideosStr;
    const gapiRequest = {
      "dimensions": "video",
      "endDate": endDate,
      "filters": filters,
      "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
      "metrics": "views",
      "startDate": startDate
    };
    const request = gapi.client.youtubeAnalytics.reports.query(gapiRequest)
      .then(response => {
        return response.result.rows;
      })
      .catch(err => {
        const errorMsg = `Error in fetching stats for video group` +
          ` ${i} - ${i + 49}: `;
        console.error(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  const viewsRequest = Promise.all(requests)
    .then(response => {
      const allVideoViews = [].concat.apply([], response);
      console.log(`${year} Views by Video:`, allVideoViews);
      const statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
      const categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
      let categoryYearlyTotals = {};
      for (let i = 0; i < categoryStats.length; i++) {
        const categoryId = categoryStats[i]["categoryId"];
        const shortName = categoryStats[i]["shortName"];
        categoryYearlyTotals[categoryId] = {
          "numVideos": 0,
          "shortName": shortName,
          "views": 0
        }
      }

      allVideoViews.forEach(video => {
        const videoId = video[0];
        const viewCount = video[1];
        const categories = statsByVideoId[videoId]["categories"];
        for (let i = 0; i < categories.length; i++) {
          const categoryId = categories[i];
          const categoryViews = parseInt(categoryYearlyTotals[categoryId]["views"]);
          const categoryNumVideos =
            parseInt(categoryYearlyTotals[categoryId]["numVideos"]);
          categoryYearlyTotals[categoryId]["views"] = categoryViews + viewCount;
          categoryYearlyTotals[categoryId]["numVideos"] = categoryNumVideos + 1;
        }

      });
      return saveCategoryYearlyStatsToSheets(categoryYearlyTotals, year);
    })
    .catch(err => {
      const errorMsg = "Unable to get video views by year: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
  return viewsRequest;
}


/* Platform Dashboard Calls */

// Request age group and gender of channel views
function requestChannelDemographics(startDate, endDate) {
  const request = {
    "dimensions": "ageGroup,gender",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "viewerPercentage",
    "sort": "gender,ageGroup",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Channel Demographics`, response);
      return displayChannelDemographics(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Channel Demographics: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function requestChannelSearchTerms(startDate, endDate) {
  const request = {
    "dimensions": "insightTrafficSourceDetail",
    "endDate": endDate,
    "filters": "insightTrafficSourceType==YT_SEARCH",
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "maxResults": 5,
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Channel Search Terms`, response);
      return displayChannelSearchTerms(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Channel Search Terms: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function requestWatchTimeBySubscribedStatus(startDate, endDate) {
  const request = {
    "dimensions": "subscribedStatus",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "estimatedMinutesWatched",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Watch Time By Subscribed Status`, response);
      return displayWatchTimeBySubscribedStatus(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Watch Time By Subscribed Status: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function requestViewsByDeviceType(startDate, endDate) {
  const request = {
    "dimensions": "deviceType",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Views By Device Type", response);
      return displayViewsByDeviceType(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Views By Device Type: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function requestViewsByState(startDate, endDate) {
  const request = {
    "dimensions": "province",
    "endDate": endDate,
    "filters": "country==US",
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "province",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Views By State", response);
      return displayViewsByState(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Views By State: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function requestViewsByTrafficSource(startDate, endDate) {
  const request = {
    "dimensions": "insightTrafficSourceType",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Views By Traffic Source", response);
      return displayViewsByTrafficSource(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Views By Traffic Source: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Real Time Stats Calls */

function requestRealTimeStats(startDate, endDate) {
  const request = {
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views,subscribersGained,subscribersLost," +
      "estimatedMinutesWatched,averageViewDuration",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Real Time Stats", response);

      let realTimeStats = {};
      const headers = response.result.columnHeaders;
      const row = response.result.rows[0];
      for (let i = 0; i < row.length; i++) {
        realTimeStats[headers[i].name] = row[i];
      }
      realTimeStats["netSubscribersGained"] = realTimeStats.subscribersGained -
        realTimeStats.subscribersLost;
      delete realTimeStats.subscribersGained;
      delete realTimeStats.subscribersLost;
      return realTimeStats;
    })
    .catch(err => {
      const errorMsg = "Error getting Real Time Stats: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      throw err;
    });
}

function requestRealTimeStatsCumulative() {
  return requestRealTimeStats(joinDate, getDateFromDaysAgo(4));
}

function requestRealTimeStatsMonth() {
  return requestRealTimeStats(getDateFromDaysAgo(34), getDateFromDaysAgo(4));
}

function requestRealTimeStatsToday() {
  const date = getDateFromDaysAgo(3);
  return requestRealTimeStats(date, date);
}


/* Top Ten Dashboard Calls */

// Requests the numVideos most watched videos from startDate to endDate
function requestMostWatchedVideos(startDate, endDate, numVideos, month) {
  const request = {
    "dimensions": "video",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "maxResults": numVideos,
    "metrics": "views,estimatedMinutesWatched",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Most Watched Videos", response);
      const videos = response.result.rows;
      const uploads = JSON.parse(localStorage.getItem("uploads"));
      if (month == undefined) {
        throw new Error("Month is undefined");
      }
      var values = [
        [month]
      ];
      var index = 0;
      var numVideos = 1;
      while (numVideos <= 10) {
        if (uploads.includes(videos[index][0])) {
          values[0][numVideos] = videos[index][0];
          values[0][numVideos + 10] = videos[index][1];
          values[0][numVideos + 20] = videos[index][2];
          numVideos++;
        }
        index++;
      }
      return values;
    })
    .catch(err => {
      const errorMsg = "Error getting Most Watched Videos: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Top Video Calls */

function requestVideoBasicStats(startDate, endDate, videoId, dashboardIds,
  videoData) {
  const stringVideoId = "video==" + videoId;
  const request = {
    "dimensions": "video",
    "endDate": endDate,
    "filters": stringVideoId,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched," +
      "averageViewDuration,subscribersGained,subscribersLost",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Top Video Basic Stats", response);
      const updatedVideoData = displayVideoBasicStats(response, dashboardIds,
        videoData);
      const sheetsPromise = saveTopVideoStatsToSheets(updatedVideoData);
      return "Displayed Top Video Basic Stats";
    })
    .catch(err => {
      const errorMsg = `Error getting basic stats for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      throw new Error("Error in requestVideoBasicStats");
    });
}

function requestVideoDailyViews(startDate, endDate, videoId, dashboardId) {
  const filters = "video==" + videoId;
  const request = {
    "dimensions": "day",
    "endDate": endDate,
    "filters": filters,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "day",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Top Video Daily Views", response);
      displayVideoDailyViews(response, dashboardId);
      return Promise.resolve(`Displayed Daily Views: ${videoId}`);
    })
    .catch(err => {
      const errorMsg = `Error getting daily views for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      throw new Error("Error in requestVideoDailyViews");
    });
}

function requestVideoSearchTerms(startDate, endDate, videoId, dashboardId) {
  const filters = "video==" + videoId + ";insightTrafficSourceType==YT_SEARCH";
  const request = {
    "dimensions": "insightTrafficSourceDetail",
    "endDate": endDate,
    "filters": filters,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "maxResults": 10,
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Top Video Search Terms", response);
      displayVideoSearchTerms(response, dashboardId);
      return Promise.resolve(`Displayed Search Terms: ${videoId}`);
    })
    .catch(err => {
      const errorMsg = `Error getting search terms for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      throw new Error("Error in requestVideoSearchTerms");
    });
}


/* Card Performance Calls */

function requestCardPerformance(startDate, endDate, month) {
  const request = {
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "cardImpressions,cardClickRate," +
      "cardTeaserImpressions,cardTeaserClickRate",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Card Performance for month: ${month}`, response);
      const cardData = parseCardPerformance(response, month);
      return cardData;
    })
    .catch(err => {
      const errorMsg = `Error getting card performance for month: ${month} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Google Sheets Calls */

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

/* Multiple Requests Functions */

function getYearlyCategoryViews(year) {
  const statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let uploadsByYear = [];
  for (const videoId in statsByVideoId) {
    if (statsByVideoId.hasOwnProperty(videoId)) {
      const publishDate = statsByVideoId[videoId]["publishDate"];
      const publishYear = publishDate.substr(0, 4);
      if (year >= publishYear) {
        uploadsByYear.push(videoId);
      }
    }
  }
  return requestVideoViewsByYear(uploadsByYear, year);
}

function getCardPerformanceByMonthSince(startDate) {
  // Oct. 2017 was the first month the ADC YT channel used impressions
  startDate = startDate || new Date("2017-10-1");
  let requests = [];
  let firstMonth = undefined;
  const endDate = new Date();
  while (endDate - startDate > 0) {
    const firstDay = getYouTubeDateFormat(startDate);
    const lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(),
      startDate.getMonth() + 1, 0));
    const month = firstDay.substr(0, 7);
    if (firstMonth == undefined) {
      firstMonth = month;
    }
    requests.push(requestCardPerformance(firstDay, lastDay, month));
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  }
  return Promise.all(requests)
    .then(response => {
      const cardData = [].concat.apply([], response);
      const body = {
        "values": cardData
      };
      const row = 3 + monthDiff(new Date(2017, 9), new Date(firstMonth));
      const sheet = "Card Performance!A" + row;
      return updateSheetData("Stats", sheet, body);
    })
    .catch(err => {
      const errorMsg = "Error occurred getting Card Performance By Month: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function getTopTenVideosByMonthSince(startDate) {
  startDate = startDate || new Date("2010-07-1");
  let requests = [];
  let firstMonth = undefined;
  const endDate = new Date();
  while (endDate - startDate > 0) {
    const firstDay = getYouTubeDateFormat(startDate);
    const lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(),
      startDate.getMonth() + 1, 0));
    const month = firstDay.substr(0, 7);
    if (firstMonth == undefined) {
      firstMonth = month;
    }
    requests.push(requestMostWatchedVideos(firstDay, lastDay, 20, month));
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  }
  return Promise.all(requests)
    .then(response => {
      const values = [].concat.apply([], response);
      const body = {
        "values": values
      };
      const row = 3 + monthDiff(new Date(2010, 6), new Date(firstMonth));
      const sheet = "Top Ten Videos!A" + row;
      return updateSheetData("Stats", sheet, body);
    })
    .catch(err => {
      const errorMsg = "Error occurred getting Top Ten Videos By Month: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function platformDashboardCalls(startDate, endDate) {
  let requests = [];
  requests.push(requestChannelSearchTerms(startDate, endDate));
  requests.push(requestViewsByDeviceType(startDate, endDate));
  requests.push(requestViewsByTrafficSource(startDate, endDate));
  requests.push(requestViewsByState(startDate, endDate));
  requests.push(requestChannelDemographics(startDate, endDate));
  requests.push(requestWatchTimeBySubscribedStatus(startDate, endDate));
  return Promise.all(requests)
    .then(response => {
      console.log("Platform Dashboard Calls Status:", response);
      return "Platform Dashboard Calls";
    })
    .catch(err => {
      const errorMsg = "Error occurred in Platform Dashboard Calls: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

// Requests data for real time stats dashboard
function realTimeStatsCalls() {
  let requests = [];
  requests.push(requestRealTimeStatsToday());
  requests.push(requestRealTimeStatsMonth());
  requests.push(requestRealTimeStatsCumulative());
  return Promise.all(requests)
    .then(response => {
      const realTimeStats = {
        "today": response[0],
        "month": response[1],
        "cumulative": response[2]
      };
      localStorage.setItem("realTimeStats", JSON.stringify(realTimeStats));
      displayRealTimeStats(realTimeStats);
      return saveRealTimeStatsToSheets(realTimeStats);
    })
    .then(response => {
      return "Real Time Stats Completed";
    })
    .catch(err => {
      const errorMsg = "Error occurred in Real Time Stats Calls: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

// Makes requests data for top video dashboard
function topVideoCalls(startDate, endDate, videoId, dashboardIds) {
  let requests = [];
  const videoData = displayTopVideoTitles(dashboardIds);

  requests.push(requestVideoBasicStats(startDate, endDate, videoId,
    dashboardIds, videoData));
  for (const videoId in dashboardIds) {
    if (dashboardIds.hasOwnProperty(videoId)) {
      const dashboardId = dashboardIds[videoId];
      requests.push(requestVideoSearchTerms(startDate, endDate, videoId,
        dashboardId));
      requests.push(requestVideoDailyViews(getDateFromDaysAgo(32), endDate,
        videoId, dashboardId));
    }
  }
  return Promise.all(requests)
    .then(response => {
      console.log("Top Video Calls Result", response);
      return Promise.resolve("Top Video Calls completed");
    })
    .catch(err => {
      const errorMsg = `Error making Top Video Calls for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}