// Request basic video stats from Analytics API
function requestBasicVideoStats() {
  var todayDate = getTodaysDate();
  const request = {
    "endDate": todayDate,
    "ids": "channel==MINE",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched,averageViewDuration",
    "startDate": joinDate
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

// Request impressions in the last defaultNumDays days from Analytics API
function requestImpressionsForLast() {
  requestImpressionsForLast(defaultNumDays);
}

// Request impressions in the last numDays days from Analytics API
function requestImpressionsForLast(numDays) {
  var todayDate = getTodaysDate();
  var startDate = getDateFromDaysAgo(numDays);
  requestImpressionsForLast(startDate, todayDate);
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

// Request # of subscribers gained in the last defaultNumDays days from Analytics API
function requestSubscribersGained() {
  requestSubscribersGained(defaultNumDays);
}

// Request # of subcribers gained in the last numDays days from Analytics API
function requestSubscribersGained(numDays) {
  var todayDate = getTodaysDate();
  var startDate = getDateFromDaysAgo(numDays);
  requestSubscribersGained(startDate, todayDate);
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

function requestVideoPlaylist(playlistId) {
  const request = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: 12
  };
  callDataAPIPlaylists(request, handleVideoPlaylist);
}

