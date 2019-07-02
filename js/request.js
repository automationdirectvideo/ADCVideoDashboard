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
  callDataAPIVideos(request, "VideoStatistics: ", handleVideoStatisticsOverall, settings);
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
    "dimensions": "subscribedStatus",
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "estimatedMinutesWatched",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "MinutesSubscribedStatus: ", handleMinutesSubscribedStatus);
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
    "metrics": "views,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration",
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
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "MostWatchedVideos: ", handleMostWatchedVideos, month);
}


/* Top Video Calls */

function requestVideoBasicStats(startDate, endDate, videoId, dashboardId) {
  var stringVideoId = "video==" + videoId;
  const request = {
    "dimensions": "video",
    "endDate": endDate,
    "filters": stringVideoId,
    "ids": "channel==MINE",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "VideoBasicStats: ", handleVideoBasicStats, dashboardId);
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
  callAnalyticsAPI(request, "VideoDailyViews: ", handleVideoDailyViews, dashboardId);
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
  callAnalyticsAPI(request, "VideoSearchTerms: ", handleVideoSearchTerms, dashboardId);
}

function requestVideoSnippet(videoId, dashboardId) {
  var request = {
    "part": "snippet,contentDetails",
    "id": videoId
  };
  callDataAPIVideos(request, "VideoSnippet: ", handleVideoSnippet, dashboardId);
}


/* Google Sheets/Drive Calls */

function requestAppendSheetData(spreadsheetId, range, body) {
  var request = {
    "spreadsheetId": spreadsheetId,
    "range": range,
    "valueInputOption": "RAW",
    "resource": body
  };
  callSheetsAPIAppend(request, "AppendSheetData:", handleAppendSheetData);
}

function requestFileModifiedTime(fileId, message) {
  var request = {
    "fileId": fileId,
    "fields": "modifiedTime"
  };
  callDriveAPIFiles(request, "FileModifiedTime:", handleFileModifiedTime, message);
}

function requestSpreadsheetData(spreadsheetId, range) {
  var request = {
    "spreadsheetId": spreadsheetId,
    "range": range
  };
  callSheetsAPIGet(request, "SpreadsheetData: ", handleSpreadsheetData, range);
}

function requestUpdateSheetData(spreadsheetId, range, body) {
  var request = {
    "spreadsheetId": spreadsheetId,
    "range": range,
    "valueInputOption": "RAW",
    "resource": body
  };
  callSheetsAPIUpdate(request, "UpdateSheetData:", handleUpdateSheetData);
}


/* Miscellaneous Calls */

// Request channel info from Data API channels list
function requestChannelInfo(channel) {
  var request = {
    part: "snippet,contentDetails,statistics",
    forUsername: channel
  };
  callDataAPIChannels(request, "ChannelInfo: ", handleChannelInfo);
}

// Request # of subscribers gained from startDate to endDate
function requestSubscribersGained(startDate, endDate) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "subscribersGained,subscribersLost",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "SubscribersGained: ", handleSubscribersGained);
}

// Request videos from a playlist
function requestVideoPlaylist(playlistId) {
  const request = {
    playlistId: playlistId,
    part: "snippet"
  };
  callDataAPIPlaylists(request, "VideoPlaylist: ", handleVideoPlaylist);
}

// Request retention metrics for a video
function requestVideoRetention(startDate, endDate, videoId) {
  var filters = "video==" + videoId + ";audienceType==ORGANIC";
  const request = {
    "dimensions": "elapsedVideoTimeRatio",
    "endDate": endDate,
    "filters": filters,
    "ids": "channel==MINE",
    "metrics": "audienceWatchRatio,relativeRetentionPerformance",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "VideoRetention: ", handleVideoRetention);
}

function requestVideoViewsByTrafficSource(startDate, endDate, videoId) {
  var stringVideoId = "video==" + videoId;
  const request = {
    "dimensions": "insightTrafficSourceType",
    "endDate": endDate,
    "filters": stringVideoId,
    "ids": "channel==MINE",
    "maxResults": 10,
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "VideoViewsByTrafficSource: ",
      handleVideoViewsByTrafficSource);
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