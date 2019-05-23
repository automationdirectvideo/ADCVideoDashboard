// Calls the Analytics API with a request and returns response to callback
function callAnalyticsAPI(request, callback) {
  gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Response", response);
      callback(response);
    })
    .catch(err => {
      console.error("Analytics API call error", err);
    });
}

// Calls the Data API for channels with a request and returns response to callback
function callDataAPIChannels(request, callback) {
  gapi.client.youtube.channels.list(request)
    .then(response => {
      console.log("Response", response);
      callback(response);
    })
    .catch(err => {
      console.error("Data API call error", err);
    });
}

// Calls the Data API for playlists with a request and returns response to callback
function callDataAPIPlaylists(request, callback) {
  gapi.client.youtube.playlistItems.list(request)
    .then(response => {
      console.log("Response", response);
      callback(response);
    });
}

// Tests calls to the API
function testAPICalls() {
  requestBasicVideoStats();
  requestSubscribersGained(30);
  requestImpressionsForLast(30);
}

// Display channel data
function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;

}

// Request channel info from Data API channels list
function getChannelInfo(channel) {
  var request = {
    part: "snippet,contentDetails,statistics",
    forUsername: channel
  };
  callDataAPIChannels(request, handleChannelInfo);
}

// Handles channel info response from Data API
function handleChannelInfo(response) {
  const channel = response.result.items[0];

  const output = `
    <ul class="list-group">
      <li class="list-group-item">Title: ${channel.snippet.title}</li>
      <li class="list-group-item">ID: ${channel.id}</li>
      <li class="list-group-item">Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
      <li class="list-group-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
      <li class="list-group-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
    </ul>
    <p>${channel.snippet.description}</p>
    <hr>
    <a class="btn btn-dark" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
  `;
  showChannelData(output);

  const playlistId = channel.contentDetails.relatedPlaylists.uploads;
  requestVideoPlaylist(playlistId);
}

function requestVideoPlaylist(playlistId) {
  const request = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: 12
  };
  callDataAPIPlaylists(request, handleVideoPlaylist);
}

function handleVideoPlaylist(response) {
  const playListItems = response.result.items;
  if (playListItems) {
    let output = `<h4 class="text-center col-12">Latest Videos</h4>`;

    // Loop though videos and append output
    playListItems.forEach(item => {
      const videoId = item.snippet.resourceId.videoId;

      output += `
        <div class="col-3">
        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media;" allowfullscreen></iframe>
        </div>
      `;
    });

    // Output videos
    videoContainer.innerHTML = output;

  } else {
    videoContainer.innerHTML = "No Uploaded Videos";
  }
}

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

// Handles basic video stats response from Analytics API
function handleBasicVideoStats(response) {
  if (response) {
    console.log("Response from Analytics API received");
  }
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

// Handles subscribers gained response from Analytics API
function handleSubscribersGained(response) {
  if (response) {
    console.log("Response from Analytics API received");
  }
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
    "metrics": "cardImpressions,cardTeaserImpressions,annotationImpressions",
    "startDate": startDate
  };
  callAnalyticsAPI(request, handleImpressionsForLast);
}

//Handles impressions response from Analytics API
function handleImpressionsForLast(response) {
  if (response) {
    console.log("Response from Analytics API received");
  }
}