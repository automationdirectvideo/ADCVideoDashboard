// Request basic video stats from startDate to endDate from Analytics API
function requestBasicVideoStats(startDate, endDate) {
  const request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched,averageViewDuration",
    "startDate": startDate
  };
  callAnalyticsAPI(request, handleBasicVideoStats);
}

// Request channel info from Data API channels list
function requestChannelInfo(channel) {
  var request = {
    part: "snippet,contentDetails,statistics",
    forUsername: channel
  };
  callDataAPIChannels(request, handleChannelInfo);
}

//Request impressions from startDate to endDate from Analytics API
function requestImpressionsForLast(startDate, endDate) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "cardImpressions,cardTeaserImpressions,annotationImpressions,cardClickRate,cardTeaserClickRate,annotationClickableImpressions,annotationClickThroughRate",
    "startDate": startDate
  };
  callAnalyticsAPI(request, handleImpressionsForLast);
}

// Request # of subscribers gained from startDate to endDate
function requestSubscribersGained(startDate, endDate) {
  var request = {
    "endDate": endDate,
    "ids": "channel==MINE",
    "metrics": "subscribersGained,subscribersLost",
    "startDate": startDate
  }  
  callAnalyticsAPI(request, handleSubscribersGained);
}

// Request first numVideos videos from a playlist from Data API
function requestVideoPlaylist(playlistId, numVideos) {
  const request = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: numVideos
  };
  callDataAPIPlaylists(request, handleVideoPlaylist);
}

