/* Sends requests to API call functions */


/* 1000 Thumbnail Dashboard Calls */

// Request number of videos the channel has
function requestChannelNumVideos() {
  var request = {
    part: "statistics",
    forUsername: "automationdirect"
  };
  callDataAPIChannels(request, "ChannelInfo: ", handleChannelNumVideos);
}


/* Get All Video Stats Calls */

function requestVideoStatisticsOverall(settings) {
  var videoId = settings["uploads"][settings["index"]];
  var request = {
    "part": "statistics,contentDetails",
    "id": videoId
  };
  callDataAPIVideos(request, "VideoStatistics: ", handleVideoStatisticsOverall,
      settings);
}

function requestVideoViewsByYear(settings) {
  var videoId = settings["uploads"][settings["index"]];
  var year = settings["year"];
  var startDate = year + "-01-01";
  var endDate = year + "-12-31";
  var filters = "video==" + videoId;
  var request = {
    "dimensions": "video",
    "endDate": endDate,
    "filters": filters,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "startDate": startDate
  }
  callAnalyticsAPI(request, "VideoViewsByYear: ", handleVideoViewsByYear,
      settings);
}


/* Platform Dashboard Calls */

// Request age group and gender of channel views
function requestChannelDemographics(startDate, endDate) {
  var request = {
    "dimensions": "ageGroup,gender",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "viewerPercentage",
    "sort": "gender,ageGroup",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ChannelDemographics: ", displayChannelDemographics);
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
  callAnalyticsAPI(request, "ChannelSearchTerms: ", handleChannelSearchTerms);
  
}

function requestMinutesSubscribedStatus(startDate, endDate) {
  var request = {
    "dimensions": "subscribedStatus",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "estimatedMinutesWatched",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "MinutesSubscribedStatus: ",
      handleMinutesSubscribedStatus);
}

function requestViewsByDeviceType(startDate, endDate) {
  var request = {
    "dimensions": "deviceType",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ViewsByDeviceType: ", handleViewsByDeviceType);
}

function requestViewsByState(startDate, endDate) {
  var request = {
    "dimensions": "province",
    "endDate": endDate,
    "filters": "country==US",
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "province",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ViewsByTrafficSource: ", handleViewsByState);
}

function requestViewsByTrafficSource(startDate, endDate) {
  var request = {
    "dimensions": "insightTrafficSourceType",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ViewsByTrafficSource: ",
      handleViewsByTrafficSource);
}


/* Real Time Stats Calls */

function requestRealTimeStats(startDate, endDate, message) {
  var request = {
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views,subscribersGained,subscribersLost," +
        "estimatedMinutesWatched,averageViewDuration",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "RealTimeStats: ", handleRealTimeStats, message);
}

function requestRealTimeStatsCumulative() {
  requestRealTimeStats(joinDate, getDateFromDaysAgo(4), "cumulative");
}

function requestRealTimeStatsMonth() {
  requestRealTimeStats(getDateFromDaysAgo(34), getDateFromDaysAgo(4), "month");
}

function requestRealTimeStatsToday() {
  var date = getDateFromDaysAgo(3);
  requestRealTimeStats(date, date, "today");
}


/* Top Ten Dashboard Calls */

// Requests the numVideos most watched videos from startDate to endDate
function requestMostWatchedVideos(startDate, endDate, numVideos, month) {
  var request = {
    "dimensions": "video",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "maxResults": numVideos,
    "metrics": "views,estimatedMinutesWatched",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "MostWatchedVideos: ", handleMostWatchedVideos,
      month);
}


/* Top Video Calls */

function requestVideoBasicStats(startDate, endDate, videoId, dashboardId) {
  var stringVideoId = "video==" + videoId;
  const request = {
    "dimensions": "video",
    "endDate": endDate,
    "filters": stringVideoId,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched," +
        "averageViewDuration,subscribersGained,subscribersLost",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "VideoBasicStats: ", handleVideoBasicStats,
      dashboardId);
}

function requestVideoDailyViews(startDate, endDate, videoId, dashboardId) {
  var filters = "video==" + videoId;
  const request = {
    "dimensions": "day",
    "endDate": endDate,
    "filters": filters,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "day",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "VideoDailyViews: ", handleVideoDailyViews,
      dashboardId);
}

function requestVideoSearchTerms(startDate, endDate, videoId, dashboardId) {
  var filters = "video==" + videoId + ";insightTrafficSourceType==YT_SEARCH";
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
  callAnalyticsAPI(request, "VideoSearchTerms: ", handleVideoSearchTerms,
      dashboardId);
}

function requestVideoSnippet(videoId, dashboardId) {
  var request = {
    "part": "snippet,contentDetails",
    "id": videoId
  };
  callDataAPIVideos(request, "VideoSnippet: ", handleVideoSnippet, dashboardId);
}


/* Card Performance Calls */

function requestCardPerformance(startDate, endDate, month) {
  var request = {
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "cardImpressions,cardClickRate," +
        "cardTeaserImpressions,cardTeaserClickRate",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "CardPerformance: ", handleCardPerformance, month);
}


/* Google Sheets Calls */

// QUESTION: should this be an async function?
function requestSpreadsheetData(sheetName, range) {
  var spreadsheetId = sheetNameToId(sheetName);
  if (spreadsheetId != "") {
    var request = {
      "spreadsheetId": spreadsheetId,
      "range": range
    };
    var sheetPromise = gapi.client.sheets.spreadsheets.values.get(request)
      .then(response => {
        console.log(`SpreadsheetData: ${range}`);
        return Promise.resolve(response.result.values);
      })
      .catch(err => {
        console.error(`Unable to get sheet: "${range}"`, err);
        // TODO: Throw error & wrap function in retry block
        // throw err;
      });
    return sheetPromise;
  } else {
    console.error(`No spreadsheet exists with sheetName: "${sheetName}"`);
  }
}

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

// QUESTION: should this be an async function?
function updateSheetData(sheetName, range, body) {
  var spreadsheetId = sheetNameToId(sheetName);
  if (spreadsheetId != "") {
    var request = {
      "spreadsheetId": spreadsheetId,
      "range": range,
      "valueInputOption": "RAW",
      "resource": body
    };
    var updatePromise = gapi.client.sheets.spreadsheets.values.update(request)
      .then(response => {
        console.log(`UpdateSheetData: ${range}`);
        return Promise.resolve(response);
      })
      .catch(err => {
        console.error(`Unable to update sheet: "${range}"`, err);
        // TODO: Throw error & wrap function in retry block
        // throw err;
      });
    return updatePromise;
  } else {
    console.error(`No spreadsheet exists with sheetName: "${sheetName}"`);
  }
}

/* Multiple Requests Functions */

// TODO: Delete this function and functions only used by its
// function getAllVideoStats(uploads) {
//   var settings = {
//     "uploads": uploads,
//     "index": 0
//   };
//   localStorage.setItem("allVideoStats", JSON.stringify([]));
//   requestVideoStatisticsOverall(settings);
// }

function getAllVideoStats(videos) {
  var requests = [];
  for (let i = 0; i < videos.length; i += 50) {
    const fiftyVideos = videos.slice(i, i + 50);
    console.log(fiftyVideos);
    const fiftyVideosStr = fiftyVideos.join(",");
    var gapiRequest = {
      "part": "statistics,contentDetails",
      "id": fiftyVideosStr
    };
    const request = gapi.client.youtube.videos.list(gapiRequest)
      .then(response => {
        console.log(`Video Request`);
        console.log(response);
        let stats = [];
        const videoItems = response.result.items;
        for (let index = 0; index < videoItems.length; index++) {
          const video = videoItems[index];
          const videoId = video.id;
          const videoStats = video.statistics;
          const durationStr = response.result.items[0].contentDetails.duration;
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
          ` ${i} - ${i + 49}: ${err}`;
        console.log(errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  let getVideoRequest = Promise.all(requests)
    .then(response => {
      console.log(response);
      let allVideoStats = [].concat.apply([], response);
      localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
      let categoryTotals = updateCategoryTotals(allVideoStats);
      let categoryStats = calcCategoryStats(categoryTotals);

      saveCategoryStatsToSheets(categoryStats); // QUESTION: should this return a promise?
      saveVideoStatsToSheets(allVideoStats); // QUESTION: should this return a promise?
      updateTopTenVideoSheet();
    })
    .catch(err => console.log(`Promise.all error: ${err}`));
    
  // TODO: Maybe remove this catch block. Needs more research
  // https://javascript.info/promise-chaining

  return getVideoRequest;
}

function getYearlyCategoryViews(year) {
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let uploadsByYear = [];
  for (var videoId in statsByVideoId) {
    if (statsByVideoId.hasOwnProperty(videoId)) {
      let publishDate = statsByVideoId[videoId]["publishDate"];
      let publishYear = publishDate.substr(0,4);
      if (year >= publishYear) {
        uploadsByYear.push(videoId);
      }
    }
  }
  let settings = {
    "index": 0,
    "uploads": uploadsByYear,
    "year": year
  };
  let categoryStats = JSON.parse(localStorage.categoryStats);
  let categoryYearlyTotals = {};
  for (var i = 0; i < categoryStats.length; i++) {
    let categoryId = categoryStats[i]["categoryId"];
    let shortName = categoryStats[i]["shortName"];
    categoryYearlyTotals[categoryId] = {
      "numVideos": 0,
      "shortName": shortName,
      "views": 0
    }
  }
  localStorage.setItem("categoryYearlyTotals",
      JSON.stringify(categoryYearlyTotals));
  requestVideoViewsByYear(settings);
}

function getCardPerformanceByMonth(startDate) {
  // Oct. 2017 was the first month the ADC YT channel used impressions
  startDate = startDate || new Date("2017-10-1");
  var endDate = new Date();
  if (endDate - startDate > 0) {
    let firstDay = getYouTubeDateFormat(startDate);
    let lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0));
    let month = firstDay.substr(0, 7);
    requestCardPerformance(firstDay, lastDay, month);
    newStartDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    // Space out the calls to Data and Sheets APIs to stay under quota limit
    setTimeout(function() {
      getCardPerformanceByMonth(newStartDate);
    }, 300);
  } else {
    // Wait to reload the page after the last Data API request is called
    // TODO: look into reload timing/necessity
    // setTimeout(function() {
    //   window.location.reload();
    // }, 5000);
  }
}

function getTopTenVideosByMonth(startDate) {
  startDate = startDate || new Date("2010-07-1");
  var endDate = new Date();
  if (endDate - startDate > 0) {
    let firstDay = getYouTubeDateFormat(startDate);
    let lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0));
    let month = firstDay.substr(0, 7);
    requestMostWatchedVideos(firstDay, lastDay, 20, month);
    newStartDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    // Space out the calls to Data and Sheets APIs to stay under quota limit
    setTimeout(function() {
      getTopTenVideosByMonth(newStartDate);
    }, 300);
  } else {
    // Wait to reload the page after the last Data API request is called
    // TODO: look into reload timing/necessity
    setTimeout(function() {
      window.location.reload();
    }, 5000);
  }
}

function platformDashboardCalls(startDate, endDate) {
  requestChannelSearchTerms(startDate, endDate);
  requestViewsByDeviceType(startDate, endDate);
  requestViewsByTrafficSource(startDate, endDate);
  requestViewsByState(startDate, endDate);
  requestChannelDemographics(startDate, endDate);
  requestMinutesSubscribedStatus(startDate, endDate);
}

// Requests data for real time stats dashboard
function realTimeStatsCalls() {
  console.log( "Real Time Stats Calls" );
  requestRealTimeStatsMonth();
  requestRealTimeStatsToday();
  requestRealTimeStatsCumulative();
}

// Makes requests data for top video dashboard
function topVideoCalls(startDate, endDate, videoId, dashboardId) {
  requestVideoSearchTerms(startDate, endDate, videoId, dashboardId);
  requestVideoDailyViews(getDateFromDaysAgo(32), endDate, videoId, dashboardId);
  requestVideoBasicStats(startDate, endDate, videoId, dashboardId);
  displayTopVideoTitle(videoId, dashboardId);
}

/* Non-dashboard Related Calls */

// Requests description of given video
function requestVideoDescription(videoId) {
  var request = {
    "part": "snippet",
    "id": videoId
  };
  callDataAPIVideos(request, "VideoDescription: ", handleVideoDescription);
}
