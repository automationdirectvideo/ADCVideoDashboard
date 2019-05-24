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

//Request impressions from startDate to endDate from Analytics API
function requestImpressions(startDate, endDate) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "cardImpressions,cardTeaserImpressions,annotationImpressions,cardClickRate,cardTeaserClickRate,annotationClickableImpressions,annotationClickThroughRate",
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

// Request # of subscribers gained from startDate to endDate
function requestSubscribersGained(startDate, endDate) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "subscribersGained,subscribersLost",
    "startDate": startDate
  }  
  callAnalyticsAPI(request, "SubscribersGained: ", handleSubscribersGained);
}

// Request first numVideos videos from a playlist from Data API
function requestVideoPlaylist(playlistId, numVideos) {
  const request = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: numVideos
  };
  callDataAPIPlaylists(request, "VideoPlaylist: ", handleVideoPlaylist);
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
  }  
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
  }  
  callAnalyticsAPI(request, "ViewsByTrafficSource: ",
      handleViewsByTrafficSource);
}