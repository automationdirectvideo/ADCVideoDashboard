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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
    "metrics": "viewerPercentage",
    "sort": "gender,ageGroup",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ChannelDemographics: ", handleChannelDemographics);
}

function requestChannelSearchTerms(startDate, endDate) {
  const request = {
    "dimensions": "insightTrafficSourceDetail",
    "endDate": endDate,
    "filters": "insightTrafficSourceType==YT_SEARCH",
    "ids": "channel==MINE",
    "maxResults": 5,
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ChannelSearchTerms: ", handleChannelSearchTerms);
  
}

function requestMinutesSubscribedStatus(startDate, endDate) {
  var request = {
    "dimensions": "subscribed_status",
    "endDate": endDate,
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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
    "ids": "channel==MINE",
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

function requestCardPerformance(startDate, endDate) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "cardImpressions,cardClickRate," +
        "cardTeaserImpressions,cardTeaserClickRate",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "CardPerformance: ", handleCardPerformance,
      endDate);
}


/* Google Sheets Calls */

function requestSpreadsheetData(spreadsheetId, range, message) {
  var request = {
    "spreadsheetId": spreadsheetId,
    "range": range
  };
  if (message != undefined) {
    range = message
  }
  callSheetsAPIGet(request, "SpreadsheetData: ", handleSpreadsheetData, range);
}

function requestUpdateSheetData(spreadsheetId, range, body) {
  var request = {
    "spreadsheetId": spreadsheetId,
    "range": range,
    "valueInputOption": "RAW",
    "resource": body
  };
  callSheetsAPIUpdate(request, "UpdateSheetData:", handleUpdateSheetData,
      range);
}

/* Multiple Requests Functions */

function getAllVideoStats(uploads) {
  var settings = {
    "uploads": uploads,
    "index": 0
  };
  localStorage.setItem("allVideoStats", JSON.stringify([]));
  requestVideoStatisticsOverall(settings);
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

function getCardPerformanceByMonth() {
  // Oct. 2017 was the first month the ADC YT channel used impressions
  let cardData = [];
  localStorage.setItem("cardData", JSON.stringify(cardData));
  requestCardPerformance("2017-10-01", "2017-10-31");
}

function getTopTenVideosByMonth(startDate) {
  startDate = startDate || new Date("2010-07-1");
  var endDate = new Date();
  if (endDate - startDate > 0) {
    let firstDay = getYouTubeDateFormat(startDate);
    let lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0));
    let month = firstDay.substr(0, 7);
    requestMostWatchedVideos(firstDay, lastDay, 20, month);
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    // Space out the calls to Data and Sheets APIs to stay under quota limit
    setTimeout(function() {
      getTopTenVideosByMonth(startDate);
    }, 200);
  } else {
    // Wait to reload the page after the last Data API request is called
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
