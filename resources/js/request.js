/* Sends requests to API call functions */


/* 1000 Thumbnail Dashboard Calls */

// Request number of videos the channel has
function requestChannelNumVideos() {
  var request = {
    part: "statistics",
    forUsername: "automationdirect"
  };
  return gapi.client.youtube.channels.list(request)
    .then(response => {
      let numVideos = response.result.items[0].statistics.videoCount;
      document.getElementById("num-videos").innerText = numVideos;
    })
    .catch(err => {
      console.error("Unable to get number of channel videos:", err);
    });
}

/* Get All Video Stats Calls */

function getAllVideoStats(videos) {
  var requests = [];
  for (let i = 0; i < videos.length; i += 50) {
    const fiftyVideos = videos.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    var gapiRequest = {
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

function requestVideoViewsByYear(uploads, year) {
  var requests = [];
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
          ` ${i} - ${i + 49}: ${err}`;
        console.error(errorMsg, err);
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
    .catch(err => console.error("Unable to get video views by year", err));
  return viewsRequest;
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

function getYearlyCategoryViews(year) {
  const statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let uploadsByYear = [];
  for (var videoId in statsByVideoId) {
    if (statsByVideoId.hasOwnProperty(videoId)) {
      const publishDate = statsByVideoId[videoId]["publishDate"];
      const publishYear = publishDate.substr(0,4);
      if (year >= publishYear) {
        uploadsByYear.push(videoId);
      }
    }
  }
  
  return requestVideoViewsByYear(uploadsByYear, year);
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
