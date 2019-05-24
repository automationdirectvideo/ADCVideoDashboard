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
  requestSubscribersGained(joinDate, getTodaysDate());
  requestImpressionsForLast("2019-04-01", "2019-04-30");
}

// Display channel data
function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;

}