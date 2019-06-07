// Request basic video stats from startDate to endDate from Analytics API
function requestBasicVideoStats(startDate, endDate) {
  const request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched,averageViewDuration",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "BasicVideoStats", handleBasicVideoStats);
}

// Request channel info from Data API channels list
function requestChannelInfo(channel) {
  var request = {
    part: "snippet,contentDetails,statistics",
    forUsername: channel
  };
  callDataAPIChannels(request, "ChannelInfo: ", handleChannelInfo);
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

//Request impressions from startDate to endDate from Analytics API
function requestImpressions(startDate, endDate) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "cardImpressions,cardTeaserImpressions,annotationImpressions,adImpressions,cardClickRate,cardTeaserClickRate,annotationClickableImpressions,annotationClickThroughRate",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "Impressions: ", handleImpressions);
}

// Requests the numVideos most watched videos from startDate to endDate
function requestMostWatchedVideos(startDate, endDate, numVideos) {
  var request = {
    "dimensions": "video",
    "endDate": endDate,
    "ids": "channel==MINE",
    "maxResults": numVideos,
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "MostWatchedVideos: ", handleMostWatchedVideos);
}

function requestRealTimeStats(startDate, endDate, message) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "views,comments,likes,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration",
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

// Request first numVideos videos from a playlist from Data API
function requestVideoPlaylist(playlistId, numVideos) {
  const request = {
    playlistId: playlistId,
    part: "snippet"
  };
  callDataAPIPlaylists(request, "VideoPlaylist: ", handleVideoPlaylist);
}

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

function requestVideoStatisticsOverall(settings) {
  var videoId = settings["uploads"][settings["index"]];
  var request = {
    "part": "statistics,contentDetails",
    "id": videoId
  };
  callDataAPIVideos(request, "VideoSnippet: ", handleVideoStatisticsOverall, settings);
}

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

// Request views and estimatedMinutesWatched by device from startDate to endDate 
function requestViewsByDeviceType(startDate, endDate) {
  var request = {
    "dimensions": "deviceType",
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "views,estimatedMinutesWatched",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ViewsByDeviceType: ", handleViewsByDeviceType);
}

// Request views and estimatedMinutesWatched by traffic source from startDate to
// endDate
function requestViewsByTrafficSource(startDate, endDate) {
  var request = {
    "dimensions": "insightTrafficSourceType",
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "views,estimatedMinutesWatched",
    "sort": "-views",
    "startDate": startDate
  };
  callAnalyticsAPI(request, "ViewsByTrafficSource: ",
      handleViewsByTrafficSource);
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

function requestFileModifiedTime(fileId, message) {
  var request = {
    "fileId": fileId,
    "fields": "modifiedTime"
  };
  callDriveAPIFiles(request, "FileModifiedTime:", handleFileModifiedTime, message);
}

// Makes requests data for top video dashboard
function topVideoCalls(startDate, endDate, videoId, dashboardId) {
  requestVideoSearchTerms(startDate, endDate, videoId, dashboardId);
  requestVideoDailyViews(getDateFromDaysAgo(32), endDate, videoId, dashboardId);
  requestVideoSnippet(videoId, dashboardId);
  requestVideoBasicStats(startDate, endDate, videoId, dashboardId);
}

// Requests data for real time stats dashboard
function realTimeStatsCalls() {
  requestRealTimeStatsCumulative();
  requestRealTimeStatsMonth();
  requestRealTimeStatsToday();
}

function getAllVideoStats(uploads) {
  var settings = {
    "uploads": uploads,
    "index": 0
  };
  let stats = JSON.parse(localStorage.getItem("allVideoStats"));
  if (!stats) {
    localStorage.setItem("allVideoStats", JSON.stringify([]));
  }
  requestVideoStatisticsOverall(settings);
}